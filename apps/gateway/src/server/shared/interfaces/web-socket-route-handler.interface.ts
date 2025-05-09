import type { WebSocketMiddleware } from "../types";
import type { ServerWebSocket } from "bun";
import { ICashflowWebSocketData } from "./thanh-hoa-web-socket-data.interface";

/**
 * Interface for WebSocket route handler.
 */
export interface IWebSocketRouteHandler {
  /**
   * Called when the WebSocket connection is opened.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {Record<string, string>} query - The query parameters.
   * @param {Record<string, string>} params - The route parameters.
   * @returns {void | Promise<void>} - The result of the callback.
   */
  onOpen?: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    query?: Record<string, string>,
    params?: Record<string, string>
  ) => void | Promise<void>;

  /**
   * Called when a message is received.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {string | Uint8Array} message - The message.
   * @returns {void | Promise<void>} - The result of the callback.
   */
  onMessage?: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    message: string | Buffer
  ) => void | Promise<void>;

  /**
   * Called when the WebSocket connection is closed.
   * @param {ServerWebSocket} ws - The WebSocket connection.
   * @param {number} code - The close code.
   * @param {string} reason - The close reason.
   * @returns {void | Promise<void>} - The result of the callback.
   */
  onClose?: (
    ws: ServerWebSocket<ICashflowWebSocketData>,
    code: number,
    reason: string
  ) => void | Promise<void>;

  /**
   * Set of middlewares to be applied to this route.
   * @param {Set<WebSocketMiddleware>} middlewares - Set of middlewares.
   */
  middlewares?: Set<WebSocketMiddleware>;
}
