import { Logger } from '@thanhhoajs/logger'

const logger = Logger.get('WEBSOCKET_CLIENT')

export class WebSocketClient {
  private ws: WebSocket
  private reconnectInterval: number = 5000
  private clientId: string

  constructor(private url: string, private token: string) {
    this.clientId = crypto.randomUUID()
    this.connect()
  }

  private connect() {
    this.ws = new WebSocket(`${this.url}?token=${this.token}`)

    this.ws.on('open', () => {
      logger.success('Connected to WebSocket server')
      this.authenticate()
    })

    this.ws.on('message', (data) => {
      const message = JSON.parse(data.toString())
      this.handleMessage(message)
    })

    this.ws.on('close', () => {
      logger.warn('Connection closed, attempting reconnect...')
      setTimeout(() => this.connect(), this.reconnectInterval)
    })
  }

  private authenticate() {
    this.send({
      type: 'auth',
      token: this.token,
      clientId: this.clientId,
    })
  }

  public send(message: any) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  private handleMessage(message: any) {
    switch (message.type) {
      case 'heartbeat':
        this.handleHeartbeat()
        break
      case 'notification':
        this.handleNotification(message.data)
        break
      // Add more message handlers
    }
  }

  private handleHeartbeat() {
    this.send({ type: 'heartbeat_ack' })
  }

  private handleNotification(data: any) {
    console.log('Received notification:', data)
  }
}
