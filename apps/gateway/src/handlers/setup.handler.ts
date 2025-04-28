import type { ServerWebSocket } from 'bun'
import { sessionManager } from '../services/session.service'
import { statsHandler } from './stats.handler'
import { Logger } from '@thanhhoajs/logger'
import destr from 'destr'
import { ICashflowWebSocketData } from '../server/shared'
import emitter from '../emitter'
import {
  GetActionsResponse,
  CashflowAction,
  SubscribeResponse,
} from '@cashflow/client'
export interface ISocketMesssage {
  type: string
  message?: string
  request?: string
  data?: any
  id: string
}
const logger = Logger.get('SETUP')
export type StreamerbotInfo = {
  /**
   * The ID of the connected Streamer.bot instance
   *
   * @example 'b63152c5-5bfe-4751-8644-579f7fb4a682'
   */
  instanceId: string

  /**
   * The name of the connected Streamer.bot instance
   *
   * @example 'Streamer.bot'
   */
  name: string

  /**
   * The operating system of the connected Streamer.bot instance
   *
   * @example 'windows'
   */
  os: 'windows' | 'linux' | 'macosx' | (string & {})

  /**
   * The version of the operating system of the connected Streamer.bot instance
   *
   * @example '10.0.0.19042'
   * @version 0.2.5
   */
  osVersion: string

  /**
   * The version of the connected Streamer.bot instance
   *
   * @example '0.1.21'
   */
  version: string

  /**
   * The source of the Streamer.bot connection
   * @description Requires Streamer.bot v0.1.21 or higher
   */
  source?: 'websocketServer' | 'streamDeckServer' | 'httpServer' | (string & {})
}

const pingHandler = (ws: ServerWebSocket<ICashflowWebSocketData>) => {}
export const setupHandler = {
  // register: (
  //   ws: ServerWebSocket<ICashflowWebSocketData>,
  //   query?: Record<string, string>
  // ) => {
  //   //console.log(`${ws.data.custom?.user.id}`);
  //   logger.info(
  //     `New heartbeat connection. User ID: ${ws.data.custom?.user.id}`
  //   );
  //   ws.subscribe("heartbeats"); // Subscribe to 'general' topic
  //   ws.send(JSON.stringify({ type: "heartbeat", message: "Pong" }));
  //   return;
  // },
  onOpen: async (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    query?: Record<string, string>,
  ) => {
    console.log(ws)
    const user = ws.data.custom!.user
    console.log(user.id)
    await sessionManager.register(user.id, ws, '/setup')
    const sbi: StreamerbotInfo = {
      instanceId: ws.data.custom.userId,
      name: 'Gateway',
      os: 'linux',
      osVersion: '5.10.0-23-amd64',
      version: '0.0.1',
      source: 'websocketServer',
    }
    // const challenge = crypto.randomBytes(32).toString('hex')
    const challenge = new Uint8Array(32)
    // window.crypto.getRandomValues(challenge)
    const salt = crypto.getRandomValues(new Uint8Array(16))
    ws.send(
      //     info: StreamerbotInfo
      // authentication: {
      //   challenge: string
      //   salt: string
      // }
      // timestamp: string
      // session: string

      JSON.stringify({
        event: { source: 'asdf', info: 'here is some infos' },
        info: sbi,
        type: 'message',
        request: 'Hello',
        message: 'info',
        authentication: {
          challenge,
          salt,
        },
        timestamp: new Date().getTime().toString(),
        session: ws.data.clientId,
        status: 'ok',
        id: 'sb:client:req:1745601968116-1800216028',
      }),
    )
    // heartbeatHandler.register(ws);
    // statsHandler.register(ws)
    // chatHandler.register(ws);
    // logger.info(sessionManager.findAll().size.toString())
    // Initialize eventBus
    // ws.data.eventBus.on('ping', () => {
    //   ws.send(JSON.stringify({ data: { message: 'info' } }))
    // })
    // ws.data.eventBus.on('message', () => {})
    // emitter.emitAction('websocket.connect', {
    //   id: ws.data.custom!.user.id,
    //   user,
    // })
  },
  onMessage: (ws: ServerWebSocket<ICashflowWebSocketData>, _message: any) => {
    const message: ISocketMesssage = destr(_message)
    console.info('received ', message)
    if (message.request == 'Authenticate') {
      const sbi: StreamerbotInfo = {
        instanceId: ws.data.custom.userId,
        name: 'Gateway',
        os: 'linux',
        osVersion: '5.10.0-23-amd64',
        version: '0.0.1',
        source: 'websocketServer',
      }
      const challenge = new Uint8Array(32)
      // window.crypto.getRandomValues(challenge)
      const salt = crypto.getRandomValues(new Uint8Array(16))
      ws.send(
        JSON.stringify({
          event: { source: 'asdf', info: 'here is some infos' },
          info: sbi,
          type: 'message',
          request: 'Hello',
          message: 'info',
          authentication: {
            challenge,
            salt,
          },
          timestamp: new Date().getTime().toString(),
          session: ws.data.clientId,
          id: message.id,
          status: 'ok',
        }),
      )
    }
    if (message.request == 'GetActiveViewers') {
      ws.send(
        JSON.stringify({
          viewers: Array.from(sessionManager.findAll()),
          count: sessionManager.getTotalSessions(),
          id: message.id,
          status: 'ok',
        }),
      )
      logger.info('Responded to GetActiveViewers')
    }
    if (message.request == 'GetActions') {
      const cfa: CashflowAction = {
        action: 'cashflow',
        action_id: 'cashflow',
        action_name: 'Cashflow',
        action_type: 'cashflow',
        action_version: '1.0.0',
        request: 'GetActions',

        subaction_count: 1,
        enabled: true,
        group: 'cashflow',
        id: message.id,
        name: 'Cashflow',
      }
      const cfas: any = []
      cfas.push(cfa)
      const response: GetActionsResponse = {
        actions: cfas,
        id: message.id,
        count: 1,
      }
      ws.send(
        JSON.stringify({
          response,
        }),
      )
      logger.info('Responded to GetActiveViewers')
    }
    if (message.request == 'Subscribe') {
      //           WebsocketClient: ['Open', 'Close', 'Message'],

      // WebsocketCustomServer: ['Open', 'Close', 'Message'],
      const cfa: SubscribeResponse = {
        id: message.id,
        status: 'ok',

        events: 'Open',
      }
      const cfas: any = []
      cfas.push(cfa)
      const response: SubscribeResponse = {
        actions: cfas,
        count: 1,
        id: message.id,
        status: 'ok',
        request: 'Subscribe',
      }
      ws.send(
        JSON.stringify({
          response,
        }),
      )
      logger.info('Responded to GetActiveViewers')
    }
    // id: string
    // status: TStatus
    // events: AppEventsSubscription

    // const client = ws
    console.log(message)
    ws.data.eventBus.emit(message.type, message.message, ws)
    //console.log(`Received: ${JSON.stringify(message)}`)
  },
  onClose: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code: number,
    reason: string,
  ) => {
    // sessionManager.clearHeartbeat(ws)
    logger.info(`Setup connection closed: ${code} - ${reason}`)
    console.log(ws.data.clientId)
    sessionManager.removeOne(ws.data.clientId)

    ws.close()

    ////console.log(`Setup connection closed: ${code} - ${reason}`);
  },
}
