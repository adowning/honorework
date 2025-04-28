import Protocol from './protocol' // Assuming protocol.js is now protocol.ts and exports the Protocol singleton

//pomelo 全局化管理
export interface starxMsg {
  host: string
  port?: number
  path?: string
  connectcb?: Function
  encrypt?: Function
  encode?: Function
  decode?: Function
  user?: any
  handshakeCallback?: Function
  maxReconnectAttempts?: number
  reconnect?: boolean
}

// declare class starx {
//     constructor(parameters) { }

//     declare static init(params: pomeloMsg): viod;
//     declare static clearListener(): viod;
//     declare static disconnect(): viod;
//     declare static request(route: string, msg: any, callback?: Function): viod;
//     declare static notify(route: string, msg: any): viod;
//     declare static getState(): boolean;
//     declare static on(key: string, call: Function);
// }

interface EmitterInterface {
  _callbacks?: { [event: string]: ((...args: any[]) => void)[] }
  on(event: string, fn: (...args: any[]) => void): this
  addEventListener(event: string, fn: (...args: any[]) => void): this
  once(event: string, fn: (...args: any[]) => void): this
  off(event?: string, fn?: (...args: any[]) => void): this
  removeListener(event?: string, fn?: (...args: any[]) => void): this
  removeAllListeners(event?: string, fn?: (...args: any[]) => void): this
  removeEventListener(event?: string, fn?: (...args: any[]) => void): this
  emit(event: string, ...args: any[]): this
  listeners(event: string): ((...args: any[]) => void)[]
  hasListeners(event: string): boolean
}

class Emitter implements EmitterInterface {
  _callbacks?: { [event: string]: ((...args: any[]) => void)[] } = {}

  constructor(obj?: any) {
    if (obj) {
      this.mixin(obj)
    }
  }

  private mixin(obj: any): any {
    for (const key in Emitter.prototype) {
      if (Object.prototype.hasOwnProperty.call(Emitter.prototype, key)) {
        ;(obj as any)[key] = (Emitter.prototype as any)[key]
      }
    }
    return obj
  }

  on(event: string, fn: (...args: any[]) => void): this {
    this._callbacks = this._callbacks || {}
    ;(this._callbacks[event] = this._callbacks[event] || []).push(fn)
    return this
  }

  addEventListener(event: string, fn: (...args: any[]) => void): this {
    return this.on(event, fn)
  }

  once(event: string, fn: (...args: any[]) => void): this {
    const self = this
    this._callbacks = this._callbacks || {}

    function on(this: any, ...args: any[]) {
      self.off(event, on)
      fn.apply(this, args)
    }

    ;(on as any).fn = fn
    this.on(event, on)
    return this
  }

  off(event?: string, fn?: (...args: any[]) => void): this {
    this._callbacks = this._callbacks || {}

    // all
    if (arguments.length === 0) {
      this._callbacks = {}
      return this
    }

    // specific event
    const callbacks = this._callbacks[event!]
    if (!callbacks) return this

    // remove all handlers for the given event
    if (arguments.length === 1) {
      delete this._callbacks[event!]
      return this
    }

    // remove specific handler
    let cb: (...args: any[]) => void
    for (let i = 0; i < callbacks.length; i++) {
      cb = callbacks[i]
      if (cb === fn || (cb as any).fn === fn) {
        callbacks.splice(i, 1)
        break
      }
    }
    return this
  }

  removeListener(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }

  removeAllListeners(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }

  removeEventListener(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }

  emit(event: string, ...args: any[]): this {
    this._callbacks = this._callbacks || {}
    const callbacks = this._callbacks[event]

    if (callbacks) {
      const listeners = callbacks.slice(0)
      for (let i = 0, len = listeners.length; i < len; ++i) {
        listeners[i].apply(this, args)
      }
    }

    return this
  }

  listeners(event: string): ((...args: any[]) => void)[] {
    this._callbacks = this._callbacks || {}
    return this._callbacks[event] || []
  }

  hasListeners(event: string): boolean {
    return !!this.listeners(event).length
  }
}

declare global {
  interface Window {
    Protocol: any
    rsa: any
    sys: any
    localStorage: any
    starx: StarxSingleton
    decodeIO_encoder: any
    decodeIO_decoder: any
  }
}

const JS_WS_CLIENT_TYPE = 'js-websocket'
const JS_WS_CLIENT_VERSION = '0.0.1'

const rsa = window.rsa

const RES_OK = 200
const RES_FAIL = 500
const RES_OLD_CLIENT = 501

if (typeof Object.create !== 'function') {
  ;(Object as any).create = function (o: any) {
    function F() {}
    F.prototype = o
    return new (F as any)()
  }
}

interface StarxSingleton extends EmitterInterface {
  init: (params: any) => void
  clearListener: () => void
  disconnect: () => void
  request: (route: string, msg: any, cb: (data: any) => void) => void
  notify: (route: string, msg: any) => void
  encode: (reqId: number, route: string, msg: any) => any
  decode: (data: any) => any
  getState: () => boolean
}

class Starx implements StarxSingleton {
  private static instance: Starx
  _callbacks?: { [event: string]: ((...args: any[]) => void)[] } = {}
  private socket: WebSocket | null = null
  private reqId = 0
  private callbacks: { [id: number]: (data: any) => void } = {}
  private handlers: { [type: number]: (data: any) => void } = {}
  private routeMap: { [id: number]: string } = {}
  private dict: { [route: string]: number } = {}
  private abbrs: { [code: number]: string } = {}
  private heartbeatInterval = 0
  private heartbeatTimeout = 0
  private nextHeartbeatTimeout = 0
  private gapThreshold = 100
  private heartbeatId: NodeJS.Timeout | null = null
  private heartbeatTimeoutId: NodeJS.Timeout | null = null
  private handshakeCallback: ((user: any) => void) | null = null

  private reconnect = false
  private reconncetTimer: NodeJS.Timeout | null = null
  private reconnectUrl: string | null = null
  private reconnectAttempts = 0
  private readonly DEFAULT_MAX_RECONNECT_ATTEMPTS = 10
  private useCrypto: boolean | undefined
  private readonly handshakeBuffer: any = {
    sys: {
      type: JS_WS_CLIENT_TYPE,
      version: JS_WS_CLIENT_VERSION,
      rsa: {},
    },
    user: {},
  }
  private connectcb: ((event: string, ...args: any[]) => void) | null = null

  private constructor() {
    // Private constructor for singleton
    Object.setPrototypeOf(this, Emitter.prototype)
    this.handlers[Protocol.Package.TYPE_HANDSHAKE] = this.handshake.bind(this)
    // this.handlers[Protocol.Package.TYPE_HEARTBEAT] = this.heartbeat.bind(this)
    this.handlers[Protocol.Package.TYPE_DATA] = this.onData.bind(this)
    this.handlers[Protocol.Package.TYPE_KICK] = this.onKick.bind(this)
    this.decode = this.defaultDecode.bind(this)
    this.encode = this.defaultEncode.bind(this)
    console.log('Starx instance created')
  }

  public decode: (data: any) => any
  public reconnectionDelay = 5000

  public encode: (reqId: number, route: string, msg: any) => any

  public static getInstance(): Starx {
    if (!Starx.instance) {
      Starx.instance = new Starx()
    }
    return Starx.instance
  }

//  public init(params: any): void {
  public init = (params: any): any => {

    console.log('参数', this.socket?.readyState, '====', WebSocket.OPEN)
    console.log(this.socket?.readyState)
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return
    const host = params.host
    const port = params.port
    const path = params.path
    this.connectcb = params.connectcb

    this.encode = params.encode || this.defaultEncode.bind(this)
    this.decode = params.decode || this.defaultDecode.bind(this)

    let url = ''
    if (host.toLowerCase().includes('ws://') || host.toLowerCase().includes('wss://')) url = host
    else url = 'ws://' + host

    if (port) {
      url += ':' + port
    }

    if (path) {
      url += path
    }
    console.log(url)
    this.handshakeBuffer.user = params.user
    if (params.encrypt) {
      this.useCrypto = true
      rsa.generate(1024, '10001')
      const data = {
        rsa_n: rsa.n.toString(16),
        rsa_e: rsa.e,
      }
      this.handshakeBuffer.sys.rsa = data
    }
    this.handshakeCallback = params.handshakeCallback //|| this.heartbeat.bind(this)
    this.connect(params, url)
  }

  private defaultDecode = (data: any): any => {
    const msg = Protocol.Message.decode(data)

    if (msg.id > 0) {
      msg.route = this.routeMap[msg.id]
      delete this.routeMap[msg.id]
      if (!msg.route) {
        return
      }
    }

    msg.body = this.deCompose(msg)
    return msg
  }

  private defaultEncode = (reqId: number, route: string, msg: any): any => {
    const type = reqId ? Protocol.Message.TYPE_REQUEST : Protocol.Message.TYPE_NOTIFY

    if (window.decodeIO_encoder && window.decodeIO_encoder.lookup(route)) {
      const Builder = window.decodeIO_encoder.build(route)
      msg = new Builder(msg).encodeNB()
    } else {
      msg = Protocol.strencode(JSON.stringify(msg)) //json方式，probuf方式不需要
    }

    let compressRoute = 0
    if (this.dict && this.dict[route]) {
      route = this.dict[route].toString()
      compressRoute = 1
    }

    return Protocol.Message.encode(reqId, type, compressRoute, route, msg)
  }
  private reset = (): void  => {

    this.reconnect = false
    this.reconnectionDelay = 1000 * 5
    this.reconnectAttempts = 0
    clearTimeout(this.reconncetTimer!)
  }

  private send = (packet: any): void  => {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(packet.buffer)
    }
  }
  private connect = (params: any, url: string): void => {
    console.log('connect to ' + url)

    const maxReconnectAttempts = params.maxReconnectAttempts || this.DEFAULT_MAX_RECONNECT_ATTEMPTS
    this.reconnectUrl = url

  
    const onopen = (event: Event) => {
      if (this.reconnect) {
        this.emit('reconnect')
      }
      this.reset()
      const obj = Protocol.Package.encode(
        Protocol.Package.TYPE_HANDSHAKE,
        Protocol.strencode(JSON.stringify(this.handshakeBuffer)),
      )
      this.send(obj)
    }

    const onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        this.processPackage(Protocol.Package.decode(event.data))
        if (this.heartbeatTimeout) {
          this.nextHeartbeatTimeout = Date.now() + this.heartbeatTimeout
        }
      }
    }

    const onerror = (event: Event) => {
      if (this.connectcb) this.connectcb('io-error', event)
      console.error('socket error: ', event)
    }

    const onclose = (event: CloseEvent) => {
      if (this.connectcb) {
        this.connectcb('close', event)
        this.connectcb('disconnect', event)
      }
      console.log('socket close: ', event)
      if (params.reconnect && this.reconnectAttempts < maxReconnectAttempts) {
        this.reconnect = true
        this.reconnectAttempts++
        this.reconncetTimer = setTimeout(() => {
          this.connect(params, this.reconnectUrl!)
        }, this.reconnectionDelay)
        this.reconnectionDelay *= 2
      }
    }

    this.socket = new WebSocket(url)
    this.socket.binaryType = 'arraybuffer'
    this.socket.onopen = onopen
    this.socket.onmessage = onmessage
    this.socket.onerror = onerror
    this.socket.onclose = onclose
  }

  clearListener(): void {
    this.connectcb = () => {}
    this.callbacks = {}
  }

  disconnect(): void {
    if (this.socket) {
      if ((this.socket as any).disconnect) (this.socket as any).disconnect()
      if (this.socket.close) this.socket.close()
      console.log('disconnect')
      this.socket = null
      this.callbacks = {}
      this.routeMap = {}
    }

    if (this.heartbeatId) {
      clearTimeout(this.heartbeatId)
      this.heartbeatId = null
    }
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId)
      this.heartbeatTimeoutId = null
    }
  }


  request(route: string, msg: any, cb: (data: any) => void): void {
    if (arguments.length === 2 && typeof msg === 'function') {
      cb = msg as (data: any) => void
      msg = {}
    } else {
      msg = msg || {}
    }
    route = route || (msg as any).route
    if (!route) {
      return
    }
    console.log('request=>', msg)
    this.reqId++
    this.sendMessage(this.reqId, route, msg)

    this.callbacks[this.reqId] = cb
    this.routeMap[this.reqId] = route
  }

  notify(route: string, msg: any): void {
    msg = msg || {}
    this.sendMessage(0, route, msg)
  }

  private sendMessage(reqId: number, route: string, msg: any): void {
    if (this.useCrypto) {
      const jsonMsg = JSON.stringify(msg)
      const sig = rsa.signString(jsonMsg, 'sha256')
      msg = JSON.parse(jsonMsg)
      msg['__crypto__'] = sig
    }
    if (this.encode) {
      msg = this.encode(reqId, route, msg)
    }

    const packet = Protocol.Package.encode(Protocol.Package.TYPE_DATA, msg)
    this.send(packet)
  }



  private heartbeat(data: any): void {
    if (!this.heartbeatInterval) {
      return
    }

    const obj = Protocol.Package.encode(Protocol.Package.TYPE_HEARTBEAT)
    if (this.heartbeatTimeoutId) {
      clearTimeout(this.heartbeatTimeoutId)
      this.heartbeatTimeoutId = null
    }

    if (this.heartbeatId) {
      return
    }

    this.heartbeatId = setTimeout(() => {
      this.heartbeatId = null
      this.send(obj)
      console.log('send heartbeat')
      this.nextHeartbeatTimeout = Date.now() + this.heartbeatTimeout
      this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb, this.heartbeatTimeout)
    }, this.heartbeatInterval)
  }

  private heartbeatTimeoutCb = (): void => {
    const gap = this.nextHeartbeatTimeout - Date.now()
    if (gap > this.gapThreshold) {
      this.heartbeatTimeoutId = setTimeout(this.heartbeatTimeoutCb, gap)
    } else {
      console.error('server heartbeat timeout')
      if (this.connectcb) this.connectcb('heartbeat timeout')
      this.disconnect()
    }
  }

  private handshake = (data: any): void => {
    data = JSON.parse(Protocol.strdecode(data))
    if (data.code === RES_OLD_CLIENT) {
      if (this.connectcb) this.connectcb('error', 'client version not fullfill')
      return
    }

    if (data.code !== RES_OK) {
      if (this.connectcb) this.connectcb('error', 'handshake fail')
      return
    }

    this.handshakeInit(data)

    const obj = Protocol.Package.encode(Protocol.Package.TYPE_HANDSHAKE_ACK)
    this.send(obj)

    if (this.connectcb) this.connectcb('connect')
  }

  private onData = (data: any): void => {
    let msg = data
    if (this.decode) {
      msg = this.decode(msg)
    }
    this.processMessage(this, msg)
  }

  private onKick = (data: any): void => {
    data = JSON.parse(Protocol.strdecode(data))
    if (this.connectcb) this.connectcb('onKick', data)
  }

  private processPackage = (msgs: any): void => {
    if (Array.isArray(msgs)) {
      for (let i = 0; i < msgs.length; i++) {
        const msg = msgs[i]
        this.handlers[msg.type](msg.body)
      }
    } else {
      this.handlers[msgs.type](msgs.body)
    }
  }

  private processMessage = (starx: Starx, msg: any): void => {
    if (!msg.id) {
      starx.emit('unsolicited', msg)
      return
    }

    const cb = this.callbacks[msg.id]
    delete this.callbacks[msg.id]

    if (typeof cb !== 'function') {
      starx.emit('unsolicited', msg)
      return
    }

    cb(msg.body)
  }

  private deCompose = (msg: any): any => {
    let route = msg.route

    if (msg.compressRoute) {
      if (!this.abbrs[route]) {
        return {}
      }
      route = msg.route = this.abbrs[route]
    }

    if (window.decodeIO_decoder && window.decodeIO_decoder.lookup(route)) {
      return window.decodeIO_decoder.build(route).decode(msg.body)
    } else {
      return JSON.parse(Protocol.strdecode(msg.body))
    }
  }

  private handshakeInit = (data: any): void => {
    if (data.sys && data.sys.heartbeat) {
      this.heartbeatInterval = data.sys.heartbeat * 1000
      this.heartbeatTimeout = this.heartbeatInterval * 2
    } else {
      this.heartbeatInterval = 0
      this.heartbeatTimeout = 0
    }

    this.initData(data)

    if (typeof this.handshakeCallback === 'function') {
      this.handshakeCallback(data.user)
    }
  }

  getState(): boolean {
    return !this.socket || this.socket.readyState !== WebSocket.OPEN ? false : true
  }

  private initData = (data: any): void => {
    if (!data || !data.sys) {
      return
    }
    this.dict = data.sys.dict

    if (this.dict) {
      this.abbrs = {}
      for (const route in this.dict) {
        this.abbrs[this.dict[route]] = route
      }
    }

    ;(window as any).starx = this
  }

  // Emitter implementation (delegating to the Emitter class instance)
  on(event: string, fn: (...args: any[]) => void): this {
    ;(Emitter.prototype as any).on.call(this, event, fn)
    return this
  }
  addEventListener(event: string, fn: (...args: any[]) => void): this {
    return this.on(event, fn)
  }
  once(event: string, fn: (...args: any[]) => void): this {
    ;(Emitter.prototype as any).once.call(this, event, fn)
    return this
  }
  off(event?: string, fn?: (...args: any[]) => void): this {
    ;(Emitter.prototype as any).off.call(this, event, fn)
    return this
  }
  removeListener(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }
  removeAllListeners(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }
  removeEventListener(event?: string, fn?: (...args: any[]) => void): this {
    return this.off(event, fn)
  }
  emit(event: string, ...args: any[]): this {
    ;(Emitter.prototype as any).emit.call(this, event, ...args)
    return this
  }
  listeners(event: string): ((...args: any[]) => void)[] {
    return (Emitter.prototype as any).listeners.call(this, event)
  }
  hasListeners(event: string): boolean {
    return (Emitter.prototype as any).hasListeners.call(this, event)
  }
}

const starx = Starx.getInstance()
export default starx

if (typeof window !== 'undefined') {
  ;(window as any).starx = starx
}
