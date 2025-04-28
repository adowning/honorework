// import type { Context } from 'hono'
// import { ServerWebSocket } from 'bun'
// import { db } from './db'
// import { schema } from './db'

// import * as jwt from 'jsonwebtoken'
// import { eq, and, SQL, sql } from 'drizzle-orm'
// import { ICashflowWebSocketData } from './server'
// import {
//   tournament,
//   transaction,
//   friendship,
//   profile,
//   user,} from './generated/drizzle/schema'

// export const crud = {
//   // User operations
//   users: {
//     getCurrent: (ctx: Context) => ctx.get('currentUser'),

//     update: async (
//       userId: string,
//       data: Partial<typeof schema.user.$inferInsert>,
//     ) => {
//       return db
//         .update(schema.user)
//         .set(data)
//         .where(eq(schema.user.id, userId))
//         .returning()
//     },

//     getById: async (userId: string) => {
//       return db.query.user.findFirst({
//         where: eq(schema.user.id, userId),
//         with: { profile: true },
//       })
//     },
//   },

//   // Profile operations
//   profiles: {
//     create: async (
//       userId: string,
//       data: Omit<typeof profile.$inferInsert, 'userId'>,
//     ) => {
//       return db
//         .insert(profile)
//         .values({ ...data, userId })
//         .returning()
//     },

//     getActive: async (userId: string) => {
//       return db.query.profile.findFirst({
//         where: and(eq(profile.userId, userId), eq(profile.isActive, true)),
//       })
//     },
//   },

//   // Tournament operations
//   tournaments: {
//     create: async (
//       operatorId: string,
//       data: Omit<typeof tournament.$inferInsert, 'operatorId'>,
//     ) => {
//       return db
//         .insert(tournament)
//         .values({ ...data, operatorId })
//         .returning()
//     },

//     join: async (userId: string, tournamentId: string, profileId: string) => {
//       return db
//         .insert(tournamentEntry)
//         .values({
//           userId,
//           tournamentId,
//           profileId,
//           id: crypto.randomUUID(),
//           joinedAt: new Date().toISOString(),
//         })
//         .returning()
//     },

//     getLeaderboard: async (tournamentId: string) => {
//       return db.query.tournament.findFirst({
//         where: eq(tournament.id, tournamentId),
//         columns: { leaderboard: true },
//       })
//     },
//   },

//   // Game operations
//   games: {
//     startSession: async (profileId: string, gameId: string) => {
//       return db
//         .insert(gameSession)
//         .values({
//           id: crypto.randomUUID(),
//           gameId,
//           profileId,
//           active: true,
//           startTime: new Date().toISOString(),
//         })
//         .returning()
//     },

//     endSession: async (
//       sessionId: string,
//       results: {
//         betAmount?: string | null
//         winAmount?: string | null
//         xpEarned: number
//       },
//     ) => {
//       return db
//         .update(gameSession)
//         .set({
//           endTime: sql`CURRENT_TIMESTAMP`,
//           active: false,
//           ...results,
//         })
//         .where(eq(gameSession.id, sessionId))
//         .returning()
//     },
//   },

//   // Transaction operations
//   transactions: {
//     create: async (
//       profileId: string,
//       data: Omit<typeof transaction.$inferInsert, 'profileId'>,
//     ) => {
//       return db
//         .insert(transaction)
//         .values({
//           ...data,
//           profileId,
//           id: crypto.randomUUID(),
//         })
//         .returning()
//     },

//     getHistory: async (profileId: string) => {
//       return db.query.transaction.findMany({
//         where: eq(transaction.profileId, profileId),
//         orderBy: (tx) => [sql`${tx.createdAt} DESC`],
//       })
//     },
//   },

//   // Social features
//   social: {
//     sendFriendRequest: async (userId: string, friendId: string) => {
//       return db
//         .insert(friendship)
//         .values({
//           id: crypto.randomUUID(),
//           userId,
//           friendId,
//           status: 'PENDING',
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString(),
//         })
//         .returning()
//     },

//     sendMessage: async (
//       userId: string,
//       content: string,
//       channel: 'LOBBY' | 'PRIVATE',
//       roomId?: string,
//     ) => {
//       return db
//         .insert(chatMessage)
//         .values({
//           id: crypto.randomUUID(),
//           userId,
//           content,
//           channel,
//           roomId,
//           createdAt: new Date().toISOString(),
//         })
//         .returning()
//     },
//   },

//   // Utility functions
//   utils: {
//     getFullUserData: async (userId: string) => {
//       return db.query.user.findFirst({
//         where: eq(schema.user.id, userId),
//         with: {

//           profile: true,
//           achievements: true,
//           friends: true,
//         },
//       })
//     },
//   },
// }

// // Middleware helper
// export const withAuth = (secret: string) => {
//   return {
//     authMiddleware: async (ctx: Context, next: () => Promise<void>) => {
//       const token =
//         ctx.req.header('Authorization')?.split(' ')[1] || ctx.req.query('token')
//       if (!token) {
//         ctx.status(401)
//         return
//       }

//       try {
//         const payload = jwt.verify(token, secret) as { sub: string }
//         ctx.set('jwtPayload', payload)
//         await next()
//       } catch {
//         ctx.status(401)
//       }
//     },

//     getUser: async (ctx: Context) => {
//       const payload = ctx.get('jwtPayload')
//       const currentUser = await db.query.user.findFirst({
//         where: (u, { eq }) => eq(u.id, payload.sub),
//       })

//       if (!currentUser) ctx.status(401)
//       return currentUser
//     },
//   }
// }

// // WebSocket types
// type WSMessage = {
//   request: string
//   id: string
//   data?: {
//     table?: string
//     id?: string
//     values?: Record<string, any>
//     gameId?: string
//   }
// }

// type WSResponse = {
//   id: string
//   success: boolean
//   data?: Record<string, any> | any[]
//   error?: string
// }

// // WebSocket CRUD Handler
// export class WSCrudHandler {
//   private ws: ServerWebSocket<ICashflowWebSocketData>
//   private ctx: Context
//   private currentUser?: typeof schema.user.$inferSelect

//   constructor(ws: ServerWebSocket<ICashflowWebSocketData>, ctx: Context) {
//     this.ws = ws
//     this.ctx = ctx
//     this.setup()
//   }

//   private async setup() {
//     try {
//       const token = this.ctx.req.query('token')
//       const payload = await jwt.verify(token, this.ctx.env.JWT_SECRET)

//       this.currentUser = await db.query.user.findFirst({
//         where: eq(schema.user.id, payload.sub),
//       })

//       if (!this.currentUser) {
//         this.sendError('AUTH_FAILED', 'Invalid user credentials')
//         this.ws.close()
//         return
//       }

//       this.ws.data.eventBus.on('message', (message) =>
//         this.handleMessage(message as Buffer),
//       )
//     } catch (error) {
//       this.sendError('AUTH_FAILED', 'Authentication failed')
//       this.ws.close()
//     }
//   }

//   private async handleMessage(raw: Buffer) {
//     try {
//       const message: WSMessage = JSON.parse(raw.toString())
//       const response: WSResponse = { id: message.id, success: true }

//       try {
//         switch (message.request) {
//           case 'getAll':
//             response.data = await this.handleGetAll(message.data?.table ?? '')
//             break
//           case 'create':
//             response.data = await this.handleCreate(
//               message.data?.table ?? '',
//               message.data?.values ?? {},
//             )
//             break
//           case 'update':
//             response.data = await this.handleUpdate(
//               message.data?.table ?? '',
//               message.data?.values ?? {},
//             )
//             break
//           case 'delete':
//             response.data = await this.handleDelete(
//               message.data?.table ?? '',
//               message.data?.id ?? '',
//             )
//             break
//           case 'startGameSession':
//             response.data = await this.startGameSession(
//               message.data?.gameId ?? '',
//             )
//             break
//           default:
//             response.success = false
//             response.error = 'Invalid request type'
//         }
//       } catch (error) {
//         response.success = false
//         response.error =
//           error instanceof Error ? error.message : 'Operation failed'
//       }

//       this.ws.send(JSON.stringify(response))
//     } catch (error) {
//       this.sendError('INVALID_REQUEST', 'Malformed request')
//     }
//   }

//   private sendError(id: string, message: string) {
//     this.ws.send(
//       JSON.stringify({
//         id,
//         success: false,
//         error: message,
//       }),
//     )
//   }

//   private getOwnerCondition(table: keyof typeof schema): SQL {
//     switch (table) {
//       case 'tournament':
//         return eq(schema.tournament.operatorId, this.currentUser!.id)
//       case 'profile':
//         return eq(schema.profile.userId, this.currentUser!.id)
//       case 'gameSession':
//         return eq(
//           schema.gameSession.profileId,
//           this.currentUser!.activeProfileId!,
//         )
//       default:
//         return sql`TRUE`
//     }
//   }

//   private injectOwnerData(table: string, values: Record<string, any>) {
//     switch (table) {
//       case 'tournament':
//         return { ...values, operatorId: this.currentUser!.id }
//       case 'gameSession':
//         return {
//           ...values,
//           profileId: this.currentUser!.activeProfileId,
//         }
//       case 'transaction':
//         return {
//           ...values,
//           profileId: this.currentUser!.activeProfileId,
//         }
//       default:
//         if ('userId' in values) values.userId = this.currentUser!.id
//         return values
//     }
//   }

//   private async handleGetAll(table?: string) {
//     if (!table || !schema[table as keyof typeof schema]) {
//       throw new Error('Invalid table name')
//     }
//     const tableSchema = schema[table as keyof typeof schema]
//     return db
//       .select()
//       .from(tableSchema)
//       .where(this.getOwnerCondition(table as keyof typeof schema))
//   }

//   private async handleCreate(table: string, values: Record<string, any>) {
//     if (!table || !schema[table as keyof typeof schema]) {
//       throw new Error('Invalid table name')
//     }
//     const tableSchema = schema[table as keyof typeof schema]
//     const dataWithOwner = this.injectOwnerData(table, values)
//     return db.insert(tableSchema).values(dataWithOwner).returning()
//   }

//   private async handleUpdate(table: string, values: Record<string, any>) {
//     if (!table || !schema[table as keyof typeof schema]) {
//       throw new Error('Invalid table name')
//     }
//     const tableSchema = schema[table as keyof typeof schema]
//     return db
//       .update(tableSchema)
//       .set(values)
//       .where(
//         and(
//           eq((tableSchema as any).id, values.id),
//           this.getOwnerCondition(table as keyof typeof schema),
//         ),
//       )
//       .returning()
//   }

//   private async handleDelete(table: string, id: string) {
//     if (!table || !schema[table as keyof typeof schema]) {
//       throw new Error('Invalid table name')
//     }
//     const tableSchema = schema[table as keyof typeof schema]
//     return db
//       .delete(tableSchema)
//       .where(
//         and(
//           eq((tableSchema as any).id, id),
//           this.getOwnerCondition(table as keyof typeof schema),
//         ),
//       )
//       .returning()
//   }

//   private async startGameSession(
//     gameId: string,
//   ): Promise<(typeof gameSession.$inferSelect)[]> {
//     if (!this.currentUser?.activeProfileId) {
//       throw new Error('No active profile')
//     }

//     return db
//       .insert(gameSession)
//       .values({
//         id: crypto.randomUUID(),
//         gameId,
//         profileId: this.currentUser.activeProfileId,
//         active: true,
//         startTime: new Date().toISOString(),
//       })
//       .returning()
//   }

//   // ... rest of WSCrudHandler implementation ...
// }
