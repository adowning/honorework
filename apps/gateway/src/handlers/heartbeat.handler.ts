import { Logger } from '@thanhhoajs/logger'
import type { ServerWebSocket } from 'bun'
import { sessionManager } from '../services/session.service'
import { ICashflowWebSocketData } from '../server'

const logger = Logger.get('HEARTBEAT')

export const startHeartbeatLoop = (updateFrequency = 3000) => {
  return updateLoop('Regular Updates', updateFrequency)
}

export function updateLoop(name: string, interval: number) {
  let _keepGoing = true
  let _timer: Timer | null = null

  const tick: any = () => {
    console.log(`tick ${name}`)
    const sessions = sessionManager.findAll()
    console.log(sessions)
    for (const [userId, ws] of sessions) {
      // const queuedMessages = session.readQueue();
      // if (Array.isArray(queuedMessages)) {
      // for (const message of queuedMessages)
      ws
        .values()
        .next()
        .value?.send(JSON.stringify({ type: 'heartbeat', message: 'pong' })) //  ws.send(JSON.stringify(message));
      // } else if (typeof queuedMessages === "string") {
      // ws.send(queuedMessages);
      // }
      if (_keepGoing) _timer = setTimeout(tick, interval)
    }
  }
  logger.info(`starting update loop ${name} @  ${interval}`)

  tick()

  function stopper() {
    // console.log(`stopping updateLoop ${name}`)
    if (_timer) clearTimeout(_timer)

    _keepGoing = false
  }

  return stopper
}

export const heartbeatHandler = {
  register: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    query?: Record<string, string>,
  ) => {
    console.log(`${ws.data.custom?.user.id}`)
    logger.info(`New heartbeat connection. User ID: ${ws.data.custom?.user.id}`)
    ws.subscribe('heartbeats') // Subscribe to 'general' topic
    ws.send(JSON.stringify({ type: 'heartbeat', message: 'Pong' }))
    return
  },
  onMessage: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    message: string | Buffer,
  ) => {
    //console.log(`Received: ${message}`);
    if (message === 'ping') {
      ws.send(JSON.stringify({ type: 'heartbeat', message: 'pong' }))
      return
    }
  },
  onClose: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code: number,
    reason: string,
  ) => {
    //console.log(`Heartbeat connection closed: ${code} - ${reason}`);
  },
}
