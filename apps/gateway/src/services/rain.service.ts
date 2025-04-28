// // rain.service.ts
// import { ServerWebSocket } from 'bun'
// import { ICashflowWebSocketData, ThanhHoaWebSocket } from '../server'
// import { Logger } from '@thanhhoajs/logger'
// import { db } from '../db'

// import { eq, and, desc, sql, gt, lt } from 'drizzle-orm'
// import { profile } from 'bun:jsc'
// import { RainHistory, user, transaction, RainTip, RainWinner } from '../generated/drizzle/schema'

// const config = {
//   config_rain: {
//     cooldown: 1,
//     min_tip: 1,
//     delay: 1,
//     duration: 1,
//   },
// }

// interface RainGame {
//   status: 'wait' | 'start' | 'end'
//   time: number
//   time_roll: number
//   amount: number
//   users: Record<string, number>
//   winners: any[]
//   total: number
// }

// export class RainService {
//   private readonly logger = Logger.get('RAIN')
//   private rain_game: RainGame = {
//     status: 'wait',
//     time: 0,
//     time_roll: 0,
//     amount: 0,
//     users: {},
//     winners: [],
//     total: 0,
//   }

//   constructor(private readonly webSocket: ThanhHoaWebSocket) {
//     this.initializeRainGame()
//   }

//   private async rain_checkGame() {
//     if (this.rain_game.status === 'wait') {
//       if (
//         this.rain_game.time + config.config_rain.cooldown <
//         Math.floor(Date.now() / 1000)
//       ) {
//         await this.rain_startGame()
//       }
//     } else if (this.rain_game.status === 'start') {
//       if (
//         this.rain_game.time + config.config_rain.duration <
//         Math.floor(Date.now() / 1000)
//       ) {
//         await this.rain_endGame()
//       }
//     }
//   }
//   private async rain_startGame() {
//     this.rain_game.status = 'start'
//     this.rain_game.time = Math.floor(Date.now() / 1000)
//     this.rain_game.time_roll = 0
//     this.rain_game.amount = 0
//     this.rain_game.users = {}
//     this.rain_game.winners = []
//     this.rain_game.total = 0

//     this.webSocket.broadcast(
//       JSON.stringify({
//         type: 'rain',
//         command: 'start',
//       }),
//     )

//     this.logger.info('Rain game started')
//   }
//   private initializeRainGame() {
//     this.loadRainState().catch((err) => {
//       this.logger.error(`Failed to load rain state: ${err.message}`)
//     })

//     setInterval(() => this.rain_checkGame(), 1000)
//   }

//   private async loadRainState() {
//     try {
//       const [lastRain] = await db
//         .select()
//         .from(RainHistory)
//         .orderBy(desc(RainHistory.time_roll))
//         .limit(1)

//       if (lastRain) {
//         this.rain_game.time_roll = lastRain.time_roll.getTime()
//       }
//     } catch (error) {
//       this.logger.error(
//         `Error loading rain state: ${error instanceof Error ? error.message : String(error)}`,
//       )
//       throw error
//     }
//   }

//   private async rain_endGame() {
//     this.rain_game.status = 'end'
//     this.rain_game.time_roll = Math.floor(Date.now() / 1000)

//     const usersCount = Object.keys(this.rain_game.users).length
//     if (usersCount > 0 && this.rain_game.amount > 0) {
//       const amountPerUser = this.rain_game.amount / usersCount

//       await db.transaction(async (tx) => {
//         // Create rain history
//         let id = '0'
//         const [newRain] = await tx
//           .insert(RainHistory)
//           .values({
//             amount: this.rain_game.amount.toString(),
//             winners: usersCount,
//             total: this.rain_game.total.toString(),
//             time_roll: sql`CURRENT_TIMESTAMP`,
//             ended: true,
//           })
//           .returning()

//         // Process winners
//         for (const [userid, count] of Object.entries(this.rain_game.users)) {
//           try {
//             const userAmount = amountPerUser * count
//             this.rain_game.total += userAmount

//             // Update user balance
//             await tx
//               .update(user)
//               .set({ balance: sql`balance + ${userAmount}` })
//               .where(eq(user.id, userid))
//             let id = '0'
//             // Create transaction
//             await tx.insert(transaction).values({
//               id,
//               type: 'WIN',
//               amount: userAmount.toString(),
//               status: 'COMPLETED',
//               profileId: (await db.query.profile.findFirst({
//                 where: eq(profile.userId, userid),
//               }))!.id,
//               metadata: { source: 'rain' },
//             })

//             // Record winner
//             await tx.insert(RainWinner).values({
//               rainHistoryId: newRain.id,
//               userid,
//               amount: userAmount.toString(),
//             })

//             // Notify winner
//             this.webSocket.publish(
//               `user_${userid}`,
//               JSON.stringify({
//                 type: 'info',
//                 info: `You won ${this.getFormatAmountString(userAmount)} coins from rain!`,
//               }),
//             )
//           } catch (error) {
//             this.logger.error(
//               `Error processing rain winner ${userid}: ${error instanceof Error ? error.message : 'Unknown error'}`,
//             )
//           }
//         }
//       })
//     }

//     this.webSocket.broadcast(
//       JSON.stringify({
//         type: 'rain',
//         command: 'end',
//         winners: this.rain_game.winners,
//         total: this.rain_game.total,
//       }),
//     )

//     this.logger.info(`Rain game ended with ${usersCount} winners`)

//     setTimeout(() => {
//       this.rain_game.status = 'wait'
//       this.rain_game.time = Math.floor(Date.now() / 1000)
//     }, config.config_rain.delay * 1000)
//   }

//   public async rain_tipGame(
//     user: any,
//     ws: ServerWebSocket<ICashflowWebSocketData>,
//     amount: string,
//   ) {
//     // ... existing validation logic ...

//     try {
//       // Check user balance
//       const [userData] = await db
//         .select({ balance: user.balance })
//         .from(user)
//         .where(eq(user.id, user.userid))

//       if (
//         !userData ||
//         this.getFormatAmount(userData.balance) < parseInt(amount)
//       ) {
//         this.webSocket.send(
//           ws,
//           JSON.stringify({ type: 'error', error: 'Insufficient funds' }),
//         )
//         return
//       }

//       await db.transaction(async (tx) => {
//         // Deduct balance
//         const amount = 0
//         const id = '0'
//         await tx
//           .update(user)
//           .set({ balance: sql`balance - ${amount}` })
//           .where(eq(user.id, user.userid))

//         // Create transaction
//         await tx.insert(transaction).values({
//           id,
//           type: 'WIN',
//           amount: amount.toString(),
//           status: 'COMPLETED',
//           profileId: (await db.query.profile.findFirst({
//             where: eq(profile.userId, user.userid),
//           }))!.id,
//           metadata: { source: 'rain_tip' },
//         })

//         // Update rain amount
//         this.rain_game.amount += amount

//         // Record tip
//         await tx.insert(RainTip).values({
//           time: new Date().getTime(),
//           userid: user.userid,
//           amount,
//           id_rain: (
//             await db
//               .select({ id: RainHistory.id })
//               .from(RainHistory)
//               .orderBy(desc(RainHistory.createdAt))
//               .limit(1)
//           )[0].id,
//         })
//       })

//       this.webSocket.send(
//         ws,
//         JSON.stringify({
//           type: 'info',
//           info: `Tipped ${this.getFormatAmountString(parseInt(amount))} coins to rain!`,
//         }),
//       )
//     } catch (error) {
//       this.logger.error(
//         `Rain tip error: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       )
//       this.webSocket.send(
//         ws,
//         JSON.stringify({ type: 'error', error: 'Transaction failed' }),
//       )
//     }
//   }

//   public async getLastRainInfo(ws: ServerWebSocket<ICashflowWebSocketData>) {
//     try {
//       const [lastRain] = await db
//         .select()
//         .from(RainHistory)
//         .where(eq(RainHistory.ended, true))
//         .orderBy(desc(RainHistory.time_roll))
//         .limit(1)

//       if (lastRain) {
//         const timeDiff =
//           Math.floor(Date.now() / 1000) - lastRain.time_roll.getTime() / 1000
//         this.webSocket.send(
//           ws,
//           JSON.stringify({
//             type: 'rain',
//             command: 'last',
//             minutes: Math.floor(timeDiff / 60),
//             seconds: timeDiff % 60,
//           }),
//         )
//       } else {
//         this.webSocket.send(
//           ws,
//           JSON.stringify({
//             type: 'rain',
//             command: 'last',
//             message: 'No previous rains',
//           }),
//         )
//       }
//     } catch (error) {
//       this.logger.error(
//         `Last rain error: ${error instanceof Error ? error.message : 'Unknown error'}`,
//       )
//       this.webSocket.send(
//         ws,
//         JSON.stringify({ type: 'error', error: 'Failed to get history' }),
//       )
//     }
//   }

//   // Helper methods
//   private getFormatAmountString(amount: number): string {
//     return amount.toFixed(2)
//   }

//   private getFormatAmount(balance: any): number {
//     return parseFloat(balance)
//   }
// }
