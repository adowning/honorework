import type { ServerWebSocket } from "bun";
import { ICashflowWebSocketData, IEventEmitter } from "../shared/interfaces";
import { EventHandler } from "../shared/types";

/**
 * EventEmitter class for managing events.
 * @implements {IEventEmitter}
 */
export class EventEmitter implements IEventEmitter {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on<T = any>(event: string, listener: EventHandler<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener as EventHandler);
  }

  emit<T = any>(
    event: string,
    data: T,
    ws: ServerWebSocket<ICashflowWebSocketData>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data, ws));
    }
  }
}
