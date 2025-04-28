import { Logger } from '@thanhhoajs/logger'
import { ServerWebSocket } from 'bun'
import { db } from './db'
import { WebSocketMiddleware, ICashflowWebSocketData } from './server'
import * as jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import {
  RainHistory,
  user,
  transaction,
  profile,
  operator,
} from './generated/drizzle/schema'

const logger = Logger.get('AUTH')

export const authMiddleware: WebSocketMiddleware = async (
  ws: ServerWebSocket<ICashflowWebSocketData>,
) => {
  logger.debug(`Auth check....`)
  let cookie = ws.data.headers.get('token')

  // const prisma = new PrismaService()
  const params = ws.data.query
  let token
  if (params) token = params['token']
  try {
    if (cookie !== undefined && cookie !== null && !token)
      token = cookie.split('token=')[1]?.split(';')[0]
    if (!token) token = ws.data.headers.get('Authorization')
    console.log('their token: ', token)

    if (!token) {
      ws.close(1008, 'Unauthorized')
      return false
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET as string)
    if (!payload) {
      ws.close(1009, 'Unauthorized')
      return false
    }
    // const posts = await db.query.user.findMany({
    //   columns: {
    //     id: true,
    //     content: true,
    //   },
    //   with: {
    //     comments: {
    //       columns: {
    //         authorId: false,
    //       },
    //     },
    //   },
    // })
    //  db.query.playerAccount.findMany({
    //    with:{ user: true},
    //    where:{
    //     user: {
    //       id: payload.sub as unknown as number
    //     }
    //     }
    //      phpId: payload.sub as unknown as number
    //    }
    //  })

    const _user = await db.query.user.findFirst({
      where: eq(user.id, payload.id as string),
    })
    if (!_user) {
      ws.close(1010, 'Unauthorized')
      return false
    }
    //console.log(user.activeProfileId)
    const _profile = await db.query.profile.findFirst({
      where: eq(profile.id, user.activeProfileId),
      // with: {
      //   operator: true,
      // },
    })

    if (!_profile) {
      ws.close(1011, 'Unauthorized')
      return false
    }

    //console.log(profile.id)
    const _operator = await db.query.operator.findFirst({
      where: eq(operator.id, profile.shopId),
      // with: {
      //   operator: true,
      // },
    })

    if (!operator) {
      ws.close(1012, 'Unauthorized')
      return false
    }
    //console.log(operator.id)

    // //console.log(p)
    // const result = await db.user.findFirst({where: {phpid: payload.sub as unknown as number}})
    // if (result.length === 0) {
    //   ws.close(1008, 'Unauthorized')
    // return false
    // }
    delete _user.passwordHash
    _profile.operator = operator
    _user.activeProfile = profile
    ws.data.custom.user = user
    console.log(ws.data.custom.user)
    return true
  } catch (e) {
    console.log(e)
    ws.close(1008, 'Unauthorized')
    logger.error(`Auth error: ${e}`)
    return false
  }
}
