import type { ServerWebSocket } from 'bun'
import { Logger } from '@thanhhoajs/logger'
import { ISessionManager } from './ISessionManager'
import { ICashflowWebSocketData } from '../server/shared'
import { listenForNotifications } from '../handlers/stats.handler'
import { Pool } from 'pg'

const dbPool = new Pool({ connectionString: process.env.DATABASE_URL })

const logger = Logger.get('SESSION_MANAGER')
interface GameSession {
  id: string
  gameId: string
  sessionId: string
  entryTime: Date
  exitTime?: Date
  creditsAtEntry: number
  creditsAtExit: number
  totalSpins: number
  totalBetAmount: number
  totalWinAmount: number
  spinData: SpinData[]
  sessionDuration: number
  platformSessionId: string
}
interface SpecialFeatures {
  id: string
  jackpot?: any
  scatter?: any
  bonus?: any
  spinDataId: string
}

interface SpinData {
  id: string
  spinId: string
  betAmount: number
  winAmount: number
  specialFeatures?: SpecialFeatures
  gameSessionId: string
}
interface PlatformSession {
  userId: string
  profileId: string
  managerName: string
  initialCredits: number
  clientId: string
  currentCredits: number
  entryTime: Date
  exitTime?: Date
  currentRTP: number
  gameSessions: GameSession[]
  createdAt: Date
  updatedAt: Date
  ws: ServerWebSocket<ICashflowWebSocketData>
  sessionId: string
}
// interface Session {
//   userId: string;
//   ws: ServerWebSocket<ICashflowWebSocketData>;
//   sessionId: string;
//   type: "general" | "game";
// }
class SessionManager implements ISessionManager {
  private static instance: SessionManager
  // private sessions: {
  //   [userId: string]: ServerWebSocket<ICashflowWebSocketData>;
  // } = {}; // Using any for now, adjust if ICashflowWebSocketData is comple
  // x
  private sessions: Map<string, PlatformSession> = new Map()
  private readonly initialPingInterval = 5000 // 30 seconds
  private listeningForStats = false // 30 seconds
  private readonly maxRetryInterval = 60000 // 10 minutes
  private readonly retryDecrementFactor = 0.5
  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  register(
    userId: string,
    websocket: ServerWebSocket<ICashflowWebSocketData>,
    route = 'setup',
  ): void {
    const sessionId: string = `${userId}-${route}`
    const session: PlatformSession = {
      userId,
      ws: websocket,
      sessionId,
      clientId: websocket.data.clientId,
      profileId: websocket.data.custom.user.activeProfileId,
      managerName: websocket.data.custom.user.activeProfile.operator.ownerId,
      initialCredits: websocket.data.custom.user.activeProfile.balance,
      currentCredits: websocket.data.custom.user.activeProfile.balance,
      entryTime: new Date(),
      currentRTP: 0,
      gameSessions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.sessions.set(sessionId, session)
    websocket.data.custom.isAlive = true
    if (this.listeningForStats === false) {
      listenForNotifications(dbPool, this).catch((err) => console.error(err))
      this.listeningForStats = true
    }
    logger.info(`Client registered: User ID ${userId}, route ${route}`)
  }

  async unregister(
    websocket: ServerWebSocket<ICashflowWebSocketData>,
  ): Promise<number> {
    try {
      const sessionId = websocket.data.custom.sessionId
      if (this.sessions.delete(sessionId)) {
        logger.info(`Client unregistered: Session ID ${sessionId}`)
      } else {
        logger.warn(
          `Attempted to unregister non-existent session: Session ID ${sessionId}`,
        )
      }
    } catch (error) {
      logger.error('Error during session unregistration:', error)
    }
    return this.sessions.size
  }

  async broadcast(userId: string, message: any): Promise<number> {
    let activeSessions = 0
    this.sessions.forEach(async (session, sessionId) => {
      if (session.userId === userId) {
        try {
          session.ws.send(JSON.stringify(message))
          logger.info(
            `Message sent to user ${userId} with session ID ${sessionId}`,
          )
          activeSessions++
        } catch (error) {
          logger.error(
            `Error sending message to user ${userId} with session ID ${sessionId}:`,
            error,
          )
          await this.unregister(session.ws)
        }
      }
    })
    return activeSessions
  }

  /**
   * Removes one WebSocket connection for a given user ID.
   * If the user has multiple connections, it will remove the first one found.
   * @param userId The ID of the user.
   * @returns The number of active WebSocket connections remaining for the user.
   */
  removeOne(clientId: string): number {
    try {
      const sessionToRemove = Array.from(this.sessions.values()).find(
        (session) => session.clientId === clientId,
      )
      if (!sessionToRemove) {
        logger.warn(`No WebSocket connection found for clientId ${clientId}`)
        return this.sessions.size
      }

      sessionToRemove.ws.terminate()
      this.sessions.delete(sessionToRemove.sessionId)

      logger.info(`One WebSocket connection removed for clientId ${clientId}`)
      return this.sessions.size
    } catch (error) {
      logger.error(
        `Error removing WebSocket connection for user ${clientId}:`,
        error,
      )
      return this.sessions.size
    }
  }

  /**
   * Finds the first WebSocket connection for a given user ID.
   * Returns the first WebSocket found, or undefined if the user has no connections.
   * @param userId The ID of the user.
   * @returns The first ServerWebSocket object if found, otherwise undefined.
   */
  find(userId: string): ServerWebSocket<ICashflowWebSocketData> | undefined {
    try {
      const session = Array.from(this.sessions.values()).find(
        (session) => session.userId === userId,
      )

      if (session) {
        logger.info(`WebSocket found for user ID ${userId}`)
        return session.ws
      } else {
        logger.warn(`No WebSocket found for user ID ${userId}`)
        return undefined
      }
    } catch (error) {
      logger.error(`Error finding WebSocket for user ID ${userId}:`, error)
      return undefined
    }
  }

  /**
   * Removes all WebSocket connections for a given user ID.
   * @param userId The ID of the user.
   * @returns The number of WebSocket connections removed for the user.
   */
  removeAll(userId: string): number {
    try {
      const userSessions = Array.from(this.sessions.values()).filter(
        (session) => session.userId === userId,
      )

      if (userSessions.length === 0) {
        logger.warn(`No WebSocket connections found for user ${userId}`)
        return 0
      }

      let removedCount = 0

      userSessions.forEach((session) => {
        try {
          session.ws.terminate()
          this.sessions.delete(session.sessionId)
          removedCount++
        } catch (error) {
          logger.error(
            `Error terminating session ${session.sessionId} for user ${userId}:`,
            error,
          )
        }
      })

      if (removedCount > 0) {
        logger.info(
          `Successfully removed ${removedCount} WebSocket connections for user ${userId}`,
        )
      }

      return removedCount
    } catch (error) {
      logger.error(
        `Error removing all WebSocket connections for user ${userId}:`,
        error,
      )
      return 0
    }
  }
  getTotalSessions(): number {
    return this.sessions.size
  }
  /**
   * Finds all WebSocket connections across all users.
   * Returns a Map where the key is the userId and the value is an array of ServerWebSocket objects.
   * @returns A Map of all active WebSocket connections.
   */
  findAll(): Map<string, ServerWebSocket<ICashflowWebSocketData>[]> {
    try {
      const result = new Map<
        string,
        ServerWebSocket<ICashflowWebSocketData>[]
      >()

      this.sessions.forEach((session) => {
        if (!result.has(session.userId)) {
          result.set(session.userId, [])
        }
        result.get(session.userId)!.push(session.ws)
      })

      const totalSessions = Array.from(result.values()).reduce(
        (acc, sessions) => acc + sessions.length,
        0,
      )

      logger.info(
        `findAll() executed, returning ${totalSessions} active sessions across ${result.size} users.`,
      )

      return result
    } catch (error) {
      logger.error('Error executing findAll():', error)
      throw new Error('Failed to retrieve all sessions')
    }
  }
}

// Usage:
const sessionManagerInstance = SessionManager.getInstance()
export const sessionManager = SessionManager.getInstance()
// export class SessionManager {
//   private static _instance: SessionManager;
//   private hasSpawned: boolean = false;
//   // private _sessionIds: string[] = [];
//   static sessions: [ThanhHoaWebSocket, User] | [] = [];
//   public count: number = SessionManager.sessions.length;

//   public constructor() {
//     if (this.hasSpawned) {
//       throw new Error("too many");
//     }
//     this.hasSpawned = true;
//     return this;
//   }
//   public static get Instance() {
//     // Do you need arguments? Make it a regular static method instead.
//     return this._instance || (this._instance = new this());
//   }
//   /**
//    * Get saved session IDs.
//    */
//   // public getSessionIds(): string[] {
//   //   return this._sessionIds;
//   // }
//   public getSessions(): ServerWebSocket<ICashflowWebSocketData>[] {
//     return SessionManager.sessions;
//   }
//   /**
//    * Get saved session IDs.
//    */
//   public find(id: string): [ThanhHoaWebSocket, User] | undefined {
//     return SessionManager.sessions.find((session) => session[1].id === id);
//   }
//   /**
//    * Check if the session ID is valid.
//    */
//   public check(sessionId: string): boolean {
//     return SessionManager.sessions.find(
//       (session) => session[1].id === sessionId
//     );
//   }

//   /**
//    * Create a random unique session ID that is used to identify
//    * the user in the WebSocket server(24 characters long).
//    */
//   public create(
//     id: string,
//     ws: ServerWebSocket<ICashflowWebSocketData>,
//     user: User
//   ): string {
//     // const characters =
//     //   "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     // let id = "";

//     // for (let i = 0; i < 24; i++) {
//     //   const randomIndex = Math.floor(Math.random() * characters.length);
//     //   id += characters.charAt(randomIndex);
//     // }
//     const exists = SessionManager.sessions.find(
//       (session) => session[1].id == id
//     );
//     // console.log(exists);
//     // if (exists) return this.create(id, ws, user);
//     // console.log(user);
//     // console.log(ws.readyState);
//     // console.log(id);

//     // this._sessionIds.push(id);
//     if (!exists) SessionManager.sessions.push([ws, user]);
//     logger.info(SessionManager.sessions.length.toString());
//     return id;
//   }

//   /**
//    * Remove session ID.
//    */
//   public remove(sessionId: string): void {
//     SessionManager.sessions = SessionManager.sessions.find(
//       (session) => session[1].id != sessionId
//     );
//   }

//   /**
//    * Remove all session IDs.
//    */
//   public clear(): void {
//     SessionManager.sessions = [];
//   }
// }
// // export const sessionManager = new SessionManager();
// // export const myClassInstance = SessionManager.Instance;

// const sessionManager = new SessionManager();

// export const useSessionManager = () => sessionManager;

// export default sessionManager;
