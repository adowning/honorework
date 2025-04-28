import { Logger } from '@thanhhoajs/logger'
import {
  sleep,
  type Server,
  type ServerWebSocket,
  type WebSocketServeOptions,
} from 'bun'
import {
  ICashflowWebSocketData,
  IThanhHoaWebSocket,
} from '../shared/interfaces'
import { EventEmitter } from './event-emitter.core'
import { Route } from './router.core'
import { ThanhHoaWebSocketOptions, WebSocketMiddleware } from '../shared'
import { MessageQueue } from './message-queue.core'
import { RouterHandler } from './router-handler.core'
import { parse } from 'url'

const logger = Logger.get('THANHHOA WEBSOCKET')

/**
 * Managing the WebSocket server.
 * @extends EventEmitter
 */
export class ThanhHoaWebSocket
  extends EventEmitter
  implements IThanhHoaWebSocket
{
  private options: WebSocketServeOptions<ICashflowWebSocketData>
  private server: Server
  private routes: Map<string, Route> = new Map()
  private globalMiddlewares: Set<WebSocketMiddleware> = new Set()
  private messageQueue: MessageQueue

  /**
   * Creates a new instance of ThanhHoaWebSocket.
   * @param {ThanhHoaWebSocketOptions} [options={}] - Options for the WebSocket server.
   */
  constructor(options: ThanhHoaWebSocketOptions = {}) {
    super()
    this.options = {
      port: options.port || 3001,
      fetch: this.handleUpgrade.bind(this),
      websocket: {
        message: this.handleMessage.bind(this),
        open: this.handleOpen.bind(this),
        close: this.handleClose.bind(this),
        drain: this.handleDrain.bind(this),
        ...options.websocket,
      },
    }
    this.server = Bun.serve(this.options)
    this.messageQueue = new MessageQueue()
  }

  use(middleware: WebSocketMiddleware): void {
    this.globalMiddlewares.add(middleware)
  }

  private async applyMiddlewares(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    middlewares: Set<WebSocketMiddleware>,
  ): Promise<boolean> {
    for (const middleware of middlewares) {
      if (!(await middleware(ws))) {
        return false
      }
    }
    return true
  }

  private async handleUpgrade(
    req: Request,
    server: Server,
  ): Promise<Response | undefined> {
    //console.log('upgrade')
    const url = new URL(req.url)
    const pathname = url.pathname.replace(/^\/+|\/+$/g, '')

    // \r\n\r\n: These are control characters used in HTTP to
    // denote the end of the HTTP headers section.

    let matchedRoute: Route | undefined
    let params: Record<string, string> = {}
    for (const [routePath, route] of this.routes) {
      const match = this.matchRoute(pathname, routePath)
      if (match) {
        matchedRoute = route
        params = match
        break
      }
    }

    if (!matchedRoute) {
      return new Response('Not Found', { status: 404 })
    }

    const clientId = crypto.randomUUID()
    const emitter = new EventEmitter()

    const data: ICashflowWebSocketData = {
      routeHandler: matchedRoute,
      path: pathname,
      query: Object.fromEntries(url.searchParams),
      params,
      headers: req.headers,
      custom: {
        user: undefined,
      },
      clientId,
      eventBus: emitter,
    }
    return server.upgrade(req, { data })
      ? undefined
      : new Response('Upgrade failed', { status: 500 })
  }

  private matchRoute(
    pathname: string,
    routePath: string,
  ): Record<string, string> | null {
    const pathnameSegments = pathname.split('/')
    const routeSegments = routePath.split('/')
    //console.log(routePath)
    if (pathnameSegments.length !== routeSegments.length) {
      return null
    }

    const params: Record<string, string> = {}
    // if (routeSegments !== undefined) console.log(routeSegments)
    for (let i = 0; i < routeSegments.length; i++) {
      let paramName: string
      // if (routeSegments[i] !== undefined) console.log(routeSegments[i])
      if (routeSegments[i].startsWith(':')) {
        paramName = routeSegments[i].slice(1)
        params[paramName] = pathnameSegments[i]
      } else if (routeSegments[i] !== pathnameSegments[i]) {
        return null
      }
    }

    return params
  }

  private async handleOpen(
    ws: ServerWebSocket<ICashflowWebSocketData>,
  ): Promise<void> {
    const { routeHandler, query, params } = ws.data
    if (
      await this.applyMiddlewares(
        ws,
        new Set([
          ...this.globalMiddlewares,
          ...(routeHandler.middlewares || []),
        ]),
      )
    ) {
      await routeHandler.onOpen?.(ws, query, params)
    } else {
      console.log('closing from core')
      ws.close(1008, 'Unauthorized')
      return
    }
    this.emit('open', ws.data, ws)
  }

  private async handleMessage(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    message: string | Buffer,
  ): Promise<void> {
    const { routeHandler } = ws.data
    console.log(message)
    if (
      await this.applyMiddlewares(
        ws,
        new Set([
          ...this.globalMiddlewares,
          ...(routeHandler.middlewares || []),
        ]),
      )
    ) {
      await routeHandler.onMessage?.(ws, message)
    }
    this.emit('message', { ...ws.data, message }, ws)
  }

  private async handleClose(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code: number,
    reason: string,
  ): Promise<void> {
    const { routeHandler } = ws.data
    await routeHandler.onClose?.(ws, code, reason)
    this.emit('close', { ...ws.data, code, reason }, ws)
  }

  private handleDrain(ws: ServerWebSocket<ICashflowWebSocketData>): void {
    this.sendQueuedMessages(ws)
    this.emit('drain', ws.data, ws)
  }

  private sendQueuedMessages(
    ws: ServerWebSocket<ICashflowWebSocketData>,
  ): void {
    while (true) {
      const queuedMessage = this.messageQueue.dequeue(ws.data.clientId)
      if (!queuedMessage) break

      const result = ws.send(queuedMessage.message, queuedMessage.compress)
      if (result === -1) break
      if (result === 0) {
        this.handleConnectionIssue(ws)
        break
      }
    }
  }

  private handleConnectionIssue(
    ws: ServerWebSocket<ICashflowWebSocketData>,
  ): void {
    logger.error(
      `Connection issue for client ${ws.data.clientId}. Path: ${ws.data.path}`,
    )
    ws.close(1011, 'Connection errors!')
  }

  group(
    prefix: string,
    ...args: (WebSocketMiddleware | RouterHandler)[]
  ): void {
    const handler = args.pop() as RouterHandler
    const groupMiddlewares = new Set(args as WebSocketMiddleware[])

    for (const [routePath, route] of handler.getRoutes()) {
      const fullPath = prefix ? `${prefix}/${routePath}` : routePath
      const allMiddlewares = new Set([
        ...groupMiddlewares,
        ...route.middlewares,
      ])
      this.routes.set(
        fullPath.replace(/^\/+|\/+$/g, ''),
        new Route(fullPath, route.handler, allMiddlewares),
      )
    }
  }

  broadcast(
    message: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer,
    compress?: boolean,
  ): void {
    // this.server.publish('broadcast', message, compress);
    if (
      message instanceof ArrayBuffer ||
      message instanceof SharedArrayBuffer
    ) {
      this.server.publish('broadcast', message, compress)
    } else {
      if (typeof message === 'string') {
        this.server.publish('broadcast', message, compress)
      }
    }
  }

  subscribe(ws: ServerWebSocket<ICashflowWebSocketData>, topic: string): void {
    ws.subscribe(topic)
  }

  unsubscribe(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    topic: string,
  ): void {
    ws.unsubscribe(topic)
  }

  publish(
    topic: string,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): void {
    this.server.publish(topic, message, compress)
  }

  isSubscribed(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    topic: string,
  ): boolean {
    return ws.isSubscribed(topic)
  }

  send(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    message: string | Bun.BufferSource,
    compress?: boolean,
  ): number {
    const result = ws.send(message, compress)
    if (result === -1) {
      this.messageQueue.enqueue(ws.data.clientId, message, !!compress)
      return -1
    } else if (result === 0) {
      this.handleConnectionIssue(ws)
      return 0
    }
    return result
  }

  cork<T>(ws: ServerWebSocket<ICashflowWebSocketData>, callback: () => T): T {
    return ws.cork(callback)
  }

  close(
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code?: number,
    reason?: string,
  ): void {
    ws.close(code, reason)
  }

  stop(): void {
    this.server.stop()
  }

  get hostname(): string {
    return this.server.hostname as string
  }

  get port(): number {
    return this.server.port as number
  }

  get pendingWebSockets(): number {
    return this.server.pendingWebSockets
  }

  get development(): boolean {
    return this.server.development
  }

  getStats(): object {
    return {
      pendingConnections: this.pendingWebSockets,
      routeCount: this.routes.size,
    }
  }

  logger(): void {
    const space = ' '
    const indentTwoSpaces = space.repeat(2)
    const indentFourSpaces = space.repeat(4)

    logger.success('ThanhHoaWebSocket Server Information')
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Server Details
    logger.info('📡 Server Details:')
    logger.info(
      `${indentTwoSpaces}🔗 Listening on: ${this.hostname}:${this.port}`,
    )
    logger.info(
      `${indentTwoSpaces}🛠️ Development mode: ${
        this.development ? 'Enabled' : 'Disabled'
      }`,
    )
    logger.info('')

    // Defined Routes
    logger.info('🛣️ Defined Routes:')
    for (const [path, route] of this.routes) {
      logger.info(`${indentTwoSpaces}📍 ${path}`)
    }
    logger.info('')

    // Global Middlewares
    logger.info('🔗 Global Middlewares:')
    logger.info(`${indentTwoSpaces}📊 Count: ${this.globalMiddlewares.size}`)
    logger.info('')

    // Server Options
    logger.info('⚙️ Server Options:')
    logger.info(`${indentTwoSpaces}🔢 Port: ${this.options.port}`)
    if (this.options.websocket) {
      logger.info(`${indentTwoSpaces}🔌 WebSocket handlers:`)
      logger.info(
        `${indentFourSpaces}📨 message: ${
          typeof this.options.websocket.message === 'function'
            ? '✅ Defined'
            : '❌ Not defined'
        }`,
      )
      logger.info(
        `${indentFourSpaces}🔓 open: ${
          typeof this.options.websocket.open === 'function'
            ? '✅ Defined'
            : '❌ Not defined'
        }`,
      )
      logger.info(
        `${indentFourSpaces}🔒 close: ${
          typeof this.options.websocket.close === 'function'
            ? '✅ Defined'
            : '❌ Not defined'
        }`,
      )
      logger.info(
        `${indentFourSpaces}🚰 drain: ${
          typeof this.options.websocket.drain === 'function'
            ? '✅ Defined'
            : '❌ Not defined'
        }`,
      )
    }

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  }
}
