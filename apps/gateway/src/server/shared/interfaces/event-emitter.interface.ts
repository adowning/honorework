import type { ServerWebSocket } from 'bun'
import { ICashflowWebSocketData } from './thanh-hoa-web-socket-data.interface'
import { EventHandler } from '..'

/**
 * Interface for EventEmitter.
 */
export interface IEventEmitter {
  /**
   * Register a listener for an event.
   * @param {string} event - The name of the event.
   * @param {EventHandler<T>} listener - The event handler function.
   * @template T
   */
  on<T = any>(event: string, listener: EventHandler<T>): void

  /**
   * Emit an event.
   * @param {string} event - The name of the event.
   * @param {T} data - The data associated with the event.
   * @param {ServerWebSocket<ICashflowWebSocketData>} ws - The WebSocket instance.
   * @template T
   */
  emit<T = any>(
    event: string,
    data: T,
    ws: ServerWebSocket<ICashflowWebSocketData>,
  ): void
}
