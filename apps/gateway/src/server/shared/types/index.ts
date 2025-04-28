import type { ICashflowWebSocketData } from "../interfaces";
import type {
  ServerWebSocket,
  WebSocketHandler,
  WebSocketServeOptions,
} from "bun";

/**
 * Type for event handler function.
 */
export type EventHandler<T = any> = (
  data: T,
  ws: ServerWebSocket<ICashflowWebSocketData>
) => void;

/**
 * Options for ThanhHoaWebSocket.
 */
export type ThanhHoaWebSocketOptions = Partial<
  Omit<WebSocketServeOptions<ICashflowWebSocketData>, "fetch" | "websocket">
> & {
  websocket?: Partial<WebSocketHandler<ICashflowWebSocketData>>;
};

/**
 * Type for WebSocket middleware.
 * @param ws - The WebSocket instance.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the middleware should continue.
 */
export type WebSocketMiddleware = (
  ws: ServerWebSocket<ICashflowWebSocketData>
) => Promise<boolean>;
