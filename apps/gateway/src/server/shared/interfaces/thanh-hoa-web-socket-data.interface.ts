import { IEventEmitter, IWebSocketRouteHandler } from '..'

interface CustomWebsocketData {
  [key: string]: any
  user: any
  isAlive?: boolean
  pingIntervalId?: NodeJS.Timeout
  retryTimeoutId?: NodeJS.Timeout
}
/**
 * Data structure for WebSocket connection.
 */
export interface ICashflowWebSocketData {
  routeHandler: IWebSocketRouteHandler
  path: string
  query?: Record<string, string>
  params?: Record<string, string>
  headers: Headers
  custom: CustomWebsocketData
  clientId: string
  eventBus: IEventEmitter
}
