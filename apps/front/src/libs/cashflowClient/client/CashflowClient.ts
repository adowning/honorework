import type { WebSocket as WebSocketNode } from 'ws'
import { CashflowAction, CashflowInfo, CashflowVariableValue } from './types'
import { AppEvents } from './types/events'
import { CashflowHelloRequest } from './types/cashflow-auth.types'
import {
  CashflowEventName,
  CashflowEventPayload,
  AppEventsource,
  AppEventsSubscription,
  AppEventsTypeWriteable,
} from './types/cashflow-event.types'
import { CashflowRequest } from './types/cashflow-request.types'
import {
  DoActionResponse,
  ExecuteCodeTriggerResponse,
  GetActionsResponse,
  GetCodeTriggersResponse,
  GetCommandsResponse,
  GetEventsResponse,
  GetGlobalResponse,
  GetGlobalsResponse,
  GetInfoResponse,
  GetUserGlobalsResponse,
  SendMessageResponse,
  CashflowErrorResponse,
  CashflowResponseTypes,
  SubscribeResponse,
  UnsubscribeResponse,
  GetActiveViewersResponse,
} from './types/cashflow-response.types'
import {
  generateRequestId,
  getCloseEventReason,
  sha256base64,
  withTimeout,
} from './util/websocket.util'

export type CashflowClientOptions = {
  scheme: 'ws' | 'wss' | string
  host: string
  port: number
  token?: string
  endpoint: string
  password?: string
  immediate: boolean
  autoReconnect: boolean
  retries: number
  subscribe: AppEventsSubscription | '*'
  onConnect?: (data: CashflowInfo) => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onData?: (data: any) => void
}

export const DefaultCashflowClientOptions: CashflowClientOptions = {
  scheme: 'ws',
  host: '127.0.0.1',
  port: 3000,
  endpoint: '/api/setup',
  immediate: true,
  autoReconnect: true,
  retries: -1,
  subscribe: {},
} as const

// const ws = new WebSocket('ws://localhost/ws?token=JWT_TOKEN')

// // Get all tournaments
// ws.send(
//   JSON.stringify({
//     request: 'getAll',
//     id: '1',
//     data: { table: 'tournament' },
//   }),
// )

// // Create new game session
// ws.send(
//   JSON.stringify({
//     request: 'create',
//     id: '2',
//     data: {
//       table: 'gameSession',
//       values: {
//         gameId: 'game_123',
//         betAmount: 100,
//       },
//     },
//   }),
// )

// Handle responses
// ws.onmessage = (event) => {
//   const response = JSON.parse(event.data)
//   console.log(`Response ${response.id}:`, response)
// }
/**
 * The `CashflowClient` class provides an interface to connect and interact with a Streamer.bot WebSocket server.
 * It allows for authentication, event subscription, and various requests to control and retrieve information from the Streamer.bot instance.
 *
 * @example
 * ```typescript
 * const client = new CashflowClient({
 *   host: 'localhost',
 *   port: 3000,
 *   password: 'your_password',
 *   immediate: true,
 *   autoReconnect: true,
 *   retries: 5,
 *   onConnect: (info) => console.log('Connected to Streamer.bot', info),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * client.on('Twitch.ChatMessage', (data) => {
 *   console.log('Chat message received:', data);
 * });
 * ```
 *
 * @remarks
 * The client supports both browser and Node.js environments. In a Node.js environment, it uses the `ws` package for WebSocket connections.
 *
 * @param options - Configuration options for the CashflowClient instance.
 * @param options.host - The host of the Streamer.bot WebSocket server.
 * @param options.port - The port of the Streamer.bot WebSocket server.
 * @param options.password - The password for authentication with the Streamer.bot WebSocket server.
 * @param options.scheme - The scheme to use for the WebSocket connection (e.g., 'ws' or 'wss').
 * @param options.endpoint - The endpoint path for the WebSocket connection.
 * @param options.immediate - Whether to immediately connect to the WebSocket server upon instantiation.
 * @param options.autoReconnect - Whether to automatically reconnect to the WebSocket server if the connection is lost.
 * @param options.retries - The number of reconnection attempts before giving up. A negative value means infinite retries.
 * @param options.subscribe - Initial subscriptions to events upon connection.
 * @param options.onConnect - Callback function to be called when the client successfully connects to the WebSocket server.
 * @param options.onDisconnect - Callback function to be called when the client disconnects from the WebSocket server.
 * @param options.onError - Callback function to be called when an error occurs.
 * @param options.onData - Callback function to be called when data is received from the WebSocket server.
 *
 * @public
 */
export class CashflowClient {
  private readonly options: CashflowClientOptions

  protected socket?: WebSocket | WebSocketNode

  protected info?: CashflowInfo
  protected version?: string

  private _authEnabled: boolean = false
  private _authenticated: boolean = false

  private listeners: Array<{
    events: Array<CashflowEventName | '*'>
    callback: (data: any) => void
  }> = []
  private subscriptions: AppEventsSubscription = {}

  private _explicitlyClosed = false
  private _retried = 0

  private _connectController = new AbortController()
  private _reconnectTimeout: ReturnType<typeof setTimeout> | undefined = undefined

  public constructor(options: Partial<CashflowClientOptions> = DefaultCashflowClientOptions) {
    this.options = { ...DefaultCashflowClientOptions, ...options }

    if (true === this.options.immediate) {
      this.connect().catch((e) => console.warn)
    }
  }

  /**
   * Check if the WebSocket connection is authenticated
   */
  public get authenticated(): boolean {
    return !!this.socket && this.socket.readyState === this.socket.OPEN && this._authenticated
  }

  /**
   * Connect to a Streamer.bot WebSocket server
   */
  public async connect(timeout: number = 10_000): Promise<void> {
    if (this.socket?.readyState !== this.socket?.CLOSED) {
      try {
        await this.disconnect()
      } catch (e) {}
    }

    this._explicitlyClosed = false

    this._connectController.abort()
    this._connectController = new AbortController()
    const controller = new AbortController()

    this._connectController.signal.addEventListener(
      'abort',
      () => {
        controller.abort()
      },
      { once: true },
    )

    return await withTimeout(
      new Promise<void>(async (res, rej) => {
        try {
          let t
          this._authEnabled = true
          if (
            this.options.token == undefined ||
            this.options.token == null ||
            this.options.token == 'undefined' ||
            !this.options.token
          ) {
            t = localStorage.getItem('sb:toolkit:token') as string
            this.options.token = t
          }
          console.log(this.options.token)
          console.log(t)
          if (
            this.options.token == undefined ||
            this.options.token == null ||
            this.options.token == 'undefined' ||
            !this.options.token
          )
            return rej(new Error(JSON.stringify({ message: 'No token available', code: 900 })))
          const uri = `${this.options.scheme}://${this.options.host}:${this.options.port}${this.options.endpoint}?token=${this.options.token}`
          console.debug(
            'Connecting to Streamer.bot WebSocket server at',
            uri,
            this._authEnabled ? 'with authentication' : '',
          )

          this.socket = !!globalThis?.process?.versions?.node
            ? new (await import('ws')).WebSocket(uri)
            : new WebSocket(uri)

          this.socket.onmessage = this.onMessage.bind(this)
          this.socket.onopen = this.onOpen.bind(this)
          this.socket.onclose = this.onClose.bind(this)
          this.socket.onerror = this.onError.bind(this)

          this.socket.addEventListener(
            'open',
            () => {
              if (!this.socket) return rej(new Error('WebSocket not initialized'))
              res()
            },
            { signal: controller.signal },
          )

          this.socket.addEventListener(
            'close',
            () => {
              return rej(new Error('WebSocket closed'))
            },
            { once: true },
          )
        } catch (error) {
          try {
            await this.disconnect()
            this?.options?.onError?.(error as Error)
          } catch (e) {
            console.warn('Error invoking onError handler', e)
          }
          rej(error)
        }
      }),
      {
        timeout,
        message: 'WebSocket connection timeout exceeded',
        controller,
      },
    )
  }

  /**
   * Disconnect Streamer.bot WebSocket
   */
  public async disconnect(code: number = 1000, timeout: number = 1_000): Promise<void> {
    this._explicitlyClosed = true
    this._connectController.abort()
    this._reconnectTimeout && clearTimeout(this._reconnectTimeout)
    if (!this.socket || this.socket.readyState === this.socket.CLOSED) return

    const controller = new AbortController()
    const signal = controller.signal

    return await withTimeout(
      new Promise<void>((res, rej) => {
        this.socket?.addEventListener(
          'close',
          () => {
            console.debug('Disconnected from Streamer.bot WebSocket server')
            res()
          },
          { signal },
        )

        if (this.socket?.readyState !== this.socket?.CLOSING) {
          try {
            this.socket?.close(code)
          } catch (error) {
            rej(error)
          }
        }
      }),
      {
        timeout,
        message: 'Timeout exceeded while closing connection',
        controller,
      },
    )
  }

  private async handshake(): Promise<void> {
    if (!this.socket) throw new Error('WebSocket not initialized')

    const controller = new AbortController()
    const { signal } = controller

    this._connectController.signal.addEventListener(
      'abort',
      () => {
        controller.abort()
      },
      { once: true },
    )

    const response = await withTimeout(
      new Promise<CashflowHelloRequest | CashflowInfo>((res, rej) => {
        console.log('here')
        this.socket?.addEventListener(
          'message',
          async (event: any) => {
            console.log('event ', event)
            if (!('data' in event) || !event.data || typeof event.data !== 'string') {
              console.debug('Unknown message received', event)
              return
            }
            console.log('eventx ', event)

            try {
              const payload = JSON.parse(event.data)
              console.log('payload ', payload)

              if (payload && 'info' in payload) {
                console.log('info ', payload)

                res(payload)
              }
            } catch (e) {
              console.warn('Invalid JSON payload received', event.data)
              rej(e)
            }
          },
          { signal },
        )
      }),
      {
        timeout: 5_000,
        message: 'Handshake timeout exceeded',
        controller,
      },
    )

    if (!response || !('info' in response)) throw new Error('Handshake failed (invalid payload)')
    if ('request' in response && response?.request === 'Hello' && response.authentication) {
      console.log('Handshake succeeded ')
      return await this.authenticate(response as CashflowHelloRequest)
    } else if (response.info && !response.authentication) {
      console.debug('Connected to Streamer.bot WebSocket server', response.info)
      this.info = response.info
      this.version = response.info.version
      return
    }

    throw new Error('Handshake failed (unknown)')
  }

  private async authenticate(data: CashflowHelloRequest): Promise<void> {
    if (!this._authEnabled || !this.options.password) {
      console.debug(
        'No password provided for authentication. Checking if auth is enforced for all requests...',
      )
      const res = await this.getInfo()
      if (res.status === 'ok') {
        console.log('was ok')
        this._authenticated = false
        this.version = data.info.version
        this.info = data.info
        return
      }
      await this.disconnect()
      throw new Error('Authentication required')
    }

    if (!data.authentication) {
      console.debug('Missing authentication payload')
      await this.disconnect()
      throw new Error('Invalid authentication payload')
    }

    console.debug('Authenticating with Streamer.bot WebSocket server...')

    const { salt, challenge } = data?.authentication
    const secret = await sha256base64(`${this.options.password}${salt}`)

    const authentication = await sha256base64(`${secret}${challenge}`)

    const response = await this.request({
      request: 'Authenticate',
      authentication,
    })
    console.log(response)
    if (response.status === 'ok') {
      this._authenticated = true
      this.version = data.info.version
      this.info = data.info
    } else {
      await this.disconnect()
      throw new Error('Authentication failed')
    }
  }

  protected async onOpen(): Promise<void> {
    this._retried = 0
    this._reconnectTimeout && clearTimeout(this._reconnectTimeout)

    try {
      // Force a getInfo call for backwards compat with Streamer.bot v0.2.4 and older
      if (!this._authEnabled) {
        void this.getInfo().catch(() => console.debug('Failed to get Streamer.bot info'))
      }
      await this.handshake()

      if (this.version && this.info) {
        console.debug(`Connected to Streamer.bot: v${this.version} (${this.info.name})`)
        this?.options?.onConnect?.(this.info)
      }
    } catch (err) {
      console.warn('Failed handshake with Streamer.bot', err)
      this.options?.onError?.(
        err instanceof Error ? err : new Error('Failed handshake with Streamer.bot'),
      )
      return await this.disconnect()
    }

    try {
      // Subscribe to initial subscriptions requested in client options
      if (this.options.subscribe === '*' || Object.keys(this.options.subscribe ?? {}).length) {
        await this.subscribe(this.options.subscribe)
      }

      // Subscribe to any events from listeners added with .on
      if (Object.keys(this.subscriptions ?? {}).length) {
        await this.subscribe(this.subscriptions)
      }

      console.debug('Subscribed to requested events', this.subscriptions, this.listeners)
    } catch (e) {
      console.warn('Error subscribing to requested events', e)
    }
  }

  protected onClose(event: CloseEvent): void {
    this._connectController.abort()

    try {
      if ((event.type === 'error' || !event.wasClean) && this.options.onError)
        this?.options?.onError(new Error(getCloseEventReason(event)))
      this?.options?.onDisconnect?.()
    } catch (e) {
      console.warn('Error invoking onDisconnect handler', e)
    }

    // No auto-reconnect, clean up
    if (this._explicitlyClosed || !this.options.autoReconnect) {
      console.debug('Cleaning up...')
      return this.cleanup()
    }

    // Handle auto-reconnect
    this._retried += 1
    if (
      typeof this.options.retries === 'number' &&
      (this.options.retries < 0 || this._retried < this.options.retries)
    ) {
      if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout)
      this._reconnectTimeout = setTimeout(
        async () => {
          if (!!this.socket && this.socket.readyState !== this.socket.CLOSED) return
          console.debug(`Reconnecting... (attempt ${this._retried})`)
          try {
            await this.connect(10_000)
          } catch (e) {
            if (this._retried) console.warn(`Failed to reconnect (attempt ${this._retried - 1})`, e)
          }
        },
        Math.min(30_000, this._retried * 1_000),
      )
    } else {
      console.debug('Auto-reconnect limit reached. Cleaning up...')
      this.cleanup()
    }
  }

  protected async onMessage(event: MessageEvent): Promise<void> {
    if (!event.data || typeof event.data !== 'string') {
      console.debug('Unknown message received', event)
      return
    }

    let payload
    try {
      payload = JSON.parse(event.data)
    } catch (e) {
      console.warn('Invalid JSON payload received', event.data)
      return
    }
    console.log('event', payload.event)
    console.log('event', event.data)

    // onData handler
    try {
      if (this.options.onData) this?.options?.onData(payload)
    } catch (e) {
      console.warn('Error invoking onData handler', e)
    }

    // any listeners called from `.on`
    if (payload?.event?.source && payload?.event?.type) {
      for (const listener of this.listeners) {
        if (!listener.events?.length) continue
        if (
          !listener.events.find((event) => {
            return (
              event === '*' ||
              event === `${payload?.event?.source}.${payload?.event?.type}` ||
              (event.split('.', 2)?.[1] === '*' &&
                event.split('.', 2)?.[0] === payload?.event?.source)
            )
          })
        )
          continue

        try {
          listener.callback(payload)
        } catch (e) {
          console.warn('Error while invoking subscription callback', listener.events)
        }
      }
    }
  }

  protected onError(event: Event): void {
    console.debug('WebSocket onError', event)
    if (!!this.socket && this.socket.readyState !== this.socket.OPEN) {
      this._connectController.abort()
    }
    try {
      this?.options?.onError?.(new Error('WebSocket Error'))
    } catch (e) {
      console.warn('Error invoking onError handler', e)
    }
  }

  protected cleanup(): void {
    if (this.socket) {
      this.socket.onopen = null
      this.socket.onclose = null
      this.socket.onerror = null
      this.socket.onmessage = null
      this.socket = undefined
    }
    this.listeners = []
    this._retried = 0
    this._connectController.abort()
    if (this._reconnectTimeout) clearTimeout(this._reconnectTimeout)
  }

  /**
   * Send a raw object to the Streamer.bot WebSocket
   */
  public send(data: Object): void {
    console.log('send')
    console.log('send')
    console.log('send', data)
    this.socket?.send(JSON.stringify(data))
  }

  /**
   * Make a request to the Streamer.bot WebSocket,
   * wait for the response, and return the response data
   */
  public async request<T extends CashflowResponseTypes>(
    request: CashflowRequest,
    id: string = '',
    timeout: number = 10_000,
  ): Promise<T> {
    if (!id) id = generateRequestId()

    const controller = new AbortController()
    const signal = controller.signal

    this._connectController.signal.addEventListener(
      'abort',
      () => {
        controller.abort()
      },
      { once: true },
    )

    const response = await withTimeout(
      new Promise<T>((res, rej) => {
        this.socket?.addEventListener(
          'message',
          (event: any) => {
            console.log('ev ev ', event)
            if (!('data' in event) || !event.data || typeof event.data !== 'string') {
              console.debug('Unknown message received', event.data)
              return
            }

            try {
              const payload = JSON.parse(event?.data)
              console.log('ev ev ', payload.id)
              console.log('ev ev ', id)

              if (payload?.id === id) {
                return res(payload)
              }
            } catch (e) {
              console.warn('Invalid JSON payload received', event.data)
              rej(e)
            }
          },
          { signal },
        )
        // console.log(request)
        this.send({ ...request, id })
      }),
      {
        timeout,
        message: 'Request timed out',
        controller,
        signal,
      },
    )

    if (response?.status === 'ok') {
      // onData handler
      try {
        if (this.options.onData) {
          this?.options?.onData(response)
        }
      } catch (e) {
        console.warn('Error invoking onData handler', e)
      }

      return {
        event: {
          source: 'Request',
          type: request.request ?? 'Unknown',
        },
        ...response,
      }
    }

    throw new Error('Request failed')
  }

  /**
   * Listener for specific event data
   */
  public async on<TEvent>(
    event: TEvent extends CashflowEventName ? TEvent : CashflowEventName | '*',
    listener: (
      data: CashflowEventPayload<TEvent extends CashflowEventName ? TEvent : CashflowEventName>,
    ) => void,
  ): Promise<void> {
    try {
      if (!event) return

      // Subscribe to all events
      if (event === '*') {
        const events = AppEvents as AppEventsTypeWriteable
        for (const key in events) {
          if (key === undefined) continue
          if (!Object.keys(AppEvents).includes(key)) continue

          const eventSource = key as keyof typeof events
          const eventTypes = events[eventSource] ?? []

          if (eventTypes && eventTypes.length) {
            const set = new Set([...(this.subscriptions[eventSource] ?? []), ...eventTypes])
            this.subscriptions[eventSource] = [...set] as any[]
          }
        }
      }
      // Handle narrowed event requests
      else {
        // Validate event string
        const [source, type] = event.split('.', 2)
        if (!source || !type || !(source in AppEvents)) return

        const eventSource = source as keyof AppEventsTypeWriteable
        const eventType = type as AppEventsTypeWriteable[keyof AppEventsTypeWriteable][number] | '*'
        if (eventType) {
          const set = new Set([
            ...(this.subscriptions[eventSource] ?? []),
            ...(eventType === '*' ? AppEvents[eventSource] : [eventType]),
          ])
          this.subscriptions[eventSource] = [...set] as any
        } else {
          throw new Error('Invalid event type')
        }
      }

      // If WebSocket is connected, subscribe to the event(s)
      if (this.socket && this.socket.readyState === this.socket.OPEN && this.version) {
        await this.subscribe(this.subscriptions)
      }

      this.listeners.push({
        events: [event],
        callback: listener,
      })

      console.debug('Added subscription for', event)
    } catch (e) {
      console.warn('Failed adding subscription for', event, e)
    }
  }

  /**
   * Subscribe to events from your connected Streamer.bot instance
   */
  public async subscribe(events: AppEventsSubscription | '*'): Promise<SubscribeResponse> {
    // subscribe to all if = '*'
    if (events === '*') {
      events = AppEvents as AppEventsTypeWriteable
    }

    for (const key in events) {
      if (key === undefined) continue
      if (!Object.keys(AppEvents).includes(key)) continue

      const eventSource = key as keyof typeof events
      const eventTypes = events[eventSource] ?? []

      if (eventTypes && eventTypes.length) {
        const set = new Set([...(this.subscriptions[eventSource] ?? []), ...eventTypes])
        this.subscriptions[eventSource] = [...set] as any[]
      }
    }

    return await this.request<SubscribeResponse>({
      request: 'Subscribe',
      events: this.subscriptions,
    })
  }

  /**
   * Unsubscribe from events you are currently subscribed to
   */
  public async unsubscribe(events: AppEventsSubscription | '*'): Promise<UnsubscribeResponse> {
    // unsubscribe from all if = '*'
    if (events === '*') events = AppEvents as AppEventsTypeWriteable

    // remove subscriptions from state
    for (const key in events) {
      if (key === undefined) continue
      if (!Object.keys(AppEvents).includes(key)) continue

      const eventSource = key as AppEventsource
      const eventTypes = events[eventSource]

      if (eventTypes && eventTypes.length) {
        for (const eventType of eventTypes) {
          if (eventType) {
            if (this.subscriptions[eventSource]?.filter) {
              ;(this.subscriptions[eventSource] = this.subscriptions[eventSource] as any[])?.filter(
                (evt: any) => eventType !== evt,
              )
            }
          }
        }
      }
    }

    // send request to streamer.bot
    return await this.request<UnsubscribeResponse>({
      request: 'UnSubscribe',
      events,
    })
  }

  /**
   * Get all possible events that may be subscribed to
   */
  public async getEvents(): Promise<GetEventsResponse> {
    return await this.request<GetEventsResponse>({
      request: 'GetEvents',
    })
  }

  /**
   * Get all actions from your connected Streamer.bot instance
   */
  public async getActions(): Promise<GetActionsResponse> {
    return await this.request<GetActionsResponse>({
      request: 'GetActions',
    })
  }

  /**
   * Get all actions from your connected Streamer.bot instance
   */
  public async doAction(
    action: string | Partial<Pick<CashflowAction, 'id' | 'name'>>,
    args?: Record<string, any>,
  ): Promise<DoActionResponse> {
    let id, name

    if (typeof action === 'string') {
      id = action
    } else {
      id = action.id
      name = action.name
    }

    return await this.request<DoActionResponse>({
      request: 'DoAction',
      action: {
        id,
        name,
      },
      args,
    })
  }

  /**
   * Get information about the connected Streamer.bot instance
   */
  public async getInfo(): Promise<GetInfoResponse> {
    return await this.request<GetInfoResponse>({
      request: 'GetInfo',
    })
  }

  /**
   * Returns all active viewers and their user information
   */
  public async getActiveViewers(): Promise<GetActiveViewersResponse> {
    return await this.request<GetActiveViewersResponse>({
      request: 'GetActiveViewers',
    })
  }

  /**
   * Execute a custom code trigger
   */
  public async executeCodeTrigger(
    triggerName: string,
    args?: Record<string, any>,
  ): Promise<ExecuteCodeTriggerResponse> {
    return await this.request<ExecuteCodeTriggerResponse>({
      request: 'ExecuteCodeTrigger',
      triggerName,
      args,
    })
  }

  /**
   * Get all custom code triggers
   */
  public async getCodeTriggers(): Promise<GetCodeTriggersResponse> {
    return await this.request<GetCodeTriggersResponse>({
      request: 'GetCodeTriggers',
    })
  }

  /**
   * Get commands for the connected Streamer.bot instance
   *
   * @version 0.2.5
   */
  public async getCommands(): Promise<GetCommandsResponse> {
    return await this.request<GetCommandsResponse>({
      request: 'GetCommands',
    })
  }

  /**
   * Get all global variables
   *
   * @version 0.2.5
   */
  public async getGlobals(persisted = true): Promise<GetGlobalsResponse> {
    return await this.request<GetGlobalsResponse>({
      request: 'GetGlobals',
      persisted,
    })
  }

  /**
   * Get a global variable by name
   *
   * @version 0.2.5
   * @param name The name of the global variable to fetch
   * @param persisted Whether the global variable is persisted
   */
  public async getGlobal<T extends CashflowVariableValue, K extends string = string>(
    name: K,
    persisted = true,
  ) {
    const response = await this.request<GetGlobalResponse<T, K>>({
      request: 'GetGlobal',
      variable: name,
      persisted,
    })
    if (response.status === 'ok') {
      if (!response.variables[name]) return { status: 'error', error: 'Variable not found' }
      return {
        id: response.id,
        status: response.status,
        variable: response.variables[name],
      }
    }
    return response
  }

  /**
   * Get user global variables
   *
   * @version 0.2.5
   * @param platform The platform to fetch globals for (twitch, youtube, trovo)
   * @param name Optional name of the global user variable to fetch
   * @param persisted Whether the global variable is persisted
   */
  public async getUserGlobals<T extends CashflowVariableValue, K extends string = string>(
    name: K | null = null,
    persisted = true,
  ): Promise<GetUserGlobalsResponse<T, K>> {
    return await this.request<GetUserGlobalsResponse<T, K>>({
      request: 'SendMessage',
    })
  }

  /**
   * Get user global variables
   *
   * @version 0.2.5
   * @param platform The platform to fetch globals for (twitch, youtube, trovo)
   * @param userId The user ID to fetch globals for
   * @param name Optional name of the global variable to fetch
   * @param persisted Whether the global variable is persisted
   */
  public async getUserGlobal<
    T extends CashflowVariableValue,
    K extends string = string,
    U extends string = string,
  >(userId: U, name: K | null = null, persisted = true) {}

  /**
   * Send chat messages
   *
   * Authenticated WebSocket is required
   *
   * @version 0.2.5
   * @param platform The platform to send the message to
   * @param message The message content to send
   * @param options Additional options for the message
   */
  public async sendMessage(
    // platform: CashflowPlatform,
    message: string,
    {
      bot = false,
      internal = true,
      ...options
    }: {
      bot?: boolean
      internal?: boolean
      replyId?: string
      broadcastId?: string
    } = {},
  ): Promise<SendMessageResponse> {
    console.log(message)
    if (!this._authenticated) {
      return {
        status: 'error',
        error: 'Authentication required',
      } as CashflowErrorResponse
    }

    const req = {
      message,
      bot,
      internal,
    }

    return await this.request({
      ...req,
      request: 'SendMessage',
    })
  }
}
