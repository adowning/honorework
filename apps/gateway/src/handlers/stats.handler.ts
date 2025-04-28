import { Pool, Client } from 'pg'

import { type ServerWebSocket } from 'bun'
import { Logger } from '@thanhhoajs/logger'
import { sessionManager } from '../services/session.service'
import type { ICashflowWebSocketData } from '../server'
import type { ISessionManager } from '../services/ISessionManager'
import { db } from '../db'
import { schema } from '../db'
import { eq, sql } from 'drizzle-orm'
// const prisma = new PrismaClient()

// const dbConfig = {
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT as string),
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
// }
// // const subscribers = new Map<
// //   [ServerWebSocket<ICashflowWebSocketData>, Profile],
// //   string
// // >();
// const pgClient = new Client(dbConfig)
// const profileBalanceChannel: string = "profile_balance_channel"; // Or your desired channel name
const profilesChange: string = 'profile_updates' // Or your desired channel name
// const _sessionManager = new SessionManager();
interface DBMessagePayload {
  table: string
  event_data: any
}
const DATABASE_URL = 'postgresql://user:password@host:port/database' // Replace with your DB details
const JWT_SECRET = 'your-secret-key' // Replace with a strong secret key
const WEBSOCKET_PORT = 8765
const SESSION_TIMEOUT = 3600 // Seconds for session timeout

interface Profile {
  id: string
  balance: number
  vipPoints: number
  countBalance: number
  currency?: string
  isExcluded?: boolean
  isActive: boolean
  faceVerificationTime?: string
  address?: number
  totalCashOut?: number
  totalSpins: number
  totalCashIn?: number
  totalWon?: number
  totalBet?: number
  totalBonusWon?: number
  rtp?: number
  createdAt: Date
  updatedAt: Date
  profileType: 'PLAYER' | 'OPERATOR' | 'AFFILIATE' // Assuming ProfileType is an enum
  limits?: any // jsonb
  xp?: number
  stats?: any // jsonb
  rakeback?: any // jsonb
  mute: boolean
  ban: boolean
  verifiedAt?: Date
  cashtag?: string
  email?: string
  shopId: string
  userId: string
  activeProfileId: string
  phpid?: number
  phpShopId?: number
  [key: string]: any // Allow for other potential fields
}

export interface ProfileChangeEventData {
  operation: 'INSERT' | 'UPDATE'
  profile_id: string
  userId: string
  old_balance: number // | {}
  new_balance: number
  change_type: string
}
export interface ProfileChangeEvent {
  table: 'profiles' | 'users'
  event_data: ProfileChangeEventData
}

const logger = Logger.get('STATS')

export async function listenForNotifications(
  dbPool: Pool,
  sessionManager: ISessionManager,
): Promise<void> {
  const client = await dbPool.connect()

  try {
    client.on('notification', (msg) => {
      const count = sessionManager.getTotalSessions()
      console.log('listen count ', count)
      if (count < 1) {
        console.log('Stats handler aborting notification (no clients)')
        return
      }
      console.log(msg)
      if (msg.channel === 'profile_balance_channel') {
        try {
          const payload: ProfileChangeEvent = JSON.parse(msg.payload!)

          console.log(payload)
          const userId = payload.event_data.userId
          // console.log(userId);
          if (userId) {
            // console.log(userId);
            // console.log(payload.event_data);
            sessionManager.broadcast(userId, payload.event_data)
          }
        } catch (error) {
          console.error('Error processing notification payload:', error)
        }
      }
    })
    await client.query('LISTEN profile_balance_channel')
    logger.info(
      'Listening for PostgreSQL notifications on channel "profile_balance_channel"',
    )

    // Keep the connection alive to continue listening
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60000)) // Check every minute
      await client.query('SELECT 1') // Send a simple query to keep the connection active
    }
  } catch (error) {
    console.error('Error listening for notifications:', error)
  } finally {
    client.release()
  }
}
const updateLoops: string[] = []
export function updateLoop(id: string, interval: number) {
  setInterval(
    async function (id) {
      console.log(id)
      const profile = await db.query.profile.findFirst({
        where: eq(schema.profile.id, id as string),
        // with: {
        //   operator: true,
        // },
      })

      if (!profile) {
        //  ws.close(1008, 'Unauthorized')
        console.log('no prof found')
        return false
      }
      //  const result = await db.query.profile.findMany({
      //    where: {
      //      : id,
      //    },
      //  })
      const newbal = (profile?.balance as number) + 1
      // console.log(profile?.balance)
      console.log(newbal)
      try {
        // await prisma.profiles.update({
        //   where: {
        //     id: id,
        //   },
        //   data: {
        //     balance: { increment: 1 },
        //   },
        // })
        const updatedBalance: { balance: string | null }[] = await db
          .update(schema.profile)
          .set({
            balance: sql`${schema.profile.balance} + 1`,
          })
          .where(eq(schema.profile.id, id))
          .returning({ balance: schema.profile.balance })
        console.log(updatedBalance)
        //   await db
        //     .update(profiles)
        //     .set({ balance: newbal })
        //     .where(eq(profiles.id, id))
      } catch (e) {
        console.log(e)
      }
    },
    interval,
    id,
  )
  updateLoops.push(id)
  // setInterval(funca, id, interval)

  // setInterval(async function (id) {
  //   const uid = id
  //   console.log(uid)
  //   // try {
  //   await db
  //     .update(Profile)
  //     .set({
  //       stats: increment(Profile.balance, 1),
  //     })
  //     .where(eq(Profile.id, uid))
  //   // } catch (e) {
  //   //   console.log(e)
  //   // }
  // }, 2000)
}

export const statsHandler = {
  register: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    query?: Record<string, string>,
  ) => {
    // ws.subscribe("general"); // Subscribe to 'general' topic
    // ws.send("Welcome to the chat!");
    console.log('here')
    if (updateLoops.includes(ws.data.custom?.user.activeProfileId)) return
    updateLoop(ws.data.custom?.user.activeProfileId, 5000)
    // handleSubscription(ws);
  },
  onMessage: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    message: string | Buffer,
  ) => {
    logger.info(`Received: ${message}`)
    // ws.publish("general", `Profile ${ws.data.custom?.userId} says: ${message}`);
  },
  onClose: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code: number,
    reason: string,
  ) => {
    sessionManager.removeOne(ws.data.custom!.user.id)

    logger.info(`Stats connection closed: ${code} - ${reason}`)
  },
}

// async function handleSubscription(ws: ServerWebSocket<ICashflowWebSocketData>) {
//   console.log(ws.data.custom!.user.id)
//   if (ws.data.custom === undefined) return false
//   // sessionManager.create(ws.data.custom!.user.id, ws, ws.data.custom.user);
//   logger.info(`New stats connection. Profile ID: ${ws.data.custom?.user.id}`)
//   logger.info(`Subscribers total: , ${sessionManager.findAll().size}`)
//   return true
// }
