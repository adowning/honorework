import { ServerWebSocket } from 'bun'
import { ICashflowWebSocketData } from '../server/shared'

interface Session {
  userId: string
  ws: ServerWebSocket<ICashflowWebSocketData>
  sessionId: string
  type: 'general' | 'game'
}

export interface ISessionManager {
  register(
    userId: string,
    websocket: ServerWebSocket<ICashflowWebSocketData>,
    route?: string,
  ): void
  unregister(
    websocket: ServerWebSocket<ICashflowWebSocketData>,
  ): Promise<number>
  broadcast(userId: string, message: any): Promise<number>
  removeOne(userId: string): number
  find(userId: string): ServerWebSocket<ICashflowWebSocketData> | undefined
  removeAll(userId: string): number
  findAll(): Map<string, ServerWebSocket<ICashflowWebSocketData>[]>
  // Consider adding a method to get the total number of sessions
  getTotalSessions(): number
}
