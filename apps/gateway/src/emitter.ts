import ee2 from 'eventemitter2'
import { db } from './db'
import { Logger } from '@thanhhoajs/logger'
const logger = Logger.get('EMITTER')

// Define the interface for the Emitter class
export interface IEmitter {
  emitFilter<T>(
    event: string | string[],
    payload: T,
    meta: Record<string, any>,
    context?: any,
  ): Promise<T>
  emitAction(
    event: string | string[],
    meta: Record<string, any>,
    context?: any,
  ): void
  emitInit(event: string, meta: Record<string, any>): Promise<void>
  onFilter<T>(event: string, handler: FilterHandler<T>): void
  onAction(event: string, handler: ActionHandler): void
  onInit(event: string, handler: InitHandler): void
  offFilter<T>(event: string, handler: FilterHandler<T>): void
  offAction(event: string, handler: ActionHandler): void
  offInit(event: string, handler: InitHandler): void
  offAll(): void
}
export type FilterHandler<T = unknown> = (
  payload: T,
  meta: Record<string, any>,
  context: any,
) => T | Promise<T>
export type ActionHandler = (meta: Record<string, any>, context: any) => void
export type InitHandler = (meta: Record<string, any>) => void

export class Emitter implements IEmitter {
  private filterEmitter
  private actionEmitter
  private initEmitter

  constructor() {
    const emitterOptions = {
      wildcard: true,
      verboseMemoryLeak: true,
      delimiter: '.',

      // This will ignore the "unspecified event" error
      ignoreErrors: true,
    }

    this.filterEmitter = new ee2(emitterOptions)
    this.actionEmitter = new ee2(emitterOptions)
    this.initEmitter = new ee2(emitterOptions)
  }

  private getDefaultContext(): any {
    return {
      database: db,
      accountability: null,
      schema: null,
    }
  }

  public async emitFilter<T>(
    event: string | string[],
    payload: T,
    meta: Record<string, any>,
    context: any | null = null,
  ): Promise<T> {
    const events = Array.isArray(event) ? event : [event]

    const eventListeners = events.map((event) => ({
      event,
      listeners: this.filterEmitter.listeners(event) as FilterHandler<T>[],
    }))

    let updatedPayload = payload

    for (const { event, listeners } of eventListeners) {
      for (const listener of listeners) {
        const result = await listener(
          updatedPayload,
          { event, ...meta },
          context ?? this.getDefaultContext(),
        )

        if (result !== undefined) {
          updatedPayload = result
        }
      }
    }

    return updatedPayload
  }

  public emitAction(
    event: string | string[],
    meta: Record<string, any>,
    context: any | null = null,
  ): void {
    // const logger = useLogger();
    // //console.log(event);
    const events = Array.isArray(event) ? event : [event]

    for (const event of events) {
      //console.log(event);
      //console.log(meta);
      // //console.log(this.getDefaultContext());

      this.actionEmitter
        .emitAsync(
          event,
          { event, ...meta },
          context ?? this.getDefaultContext(),
        )
        .catch((err) => {
          logger.warn(`An error was thrown while executing action "${event}"`)
          logger.warn(err)
        })
    }
  }

  public async emitInit(
    event: string,
    meta: Record<string, any>,
  ): Promise<void> {
    // const logger = useLogger();

    try {
      await this.initEmitter.emitAsync(event, { event, ...meta })
    } catch (err: any) {
      logger.warn(`An error was thrown while executing init "${event}"`)
      logger.warn(err)
    }
  }

  public onFilter<T = unknown>(event: string, handler: FilterHandler<T>): void {
    this.filterEmitter.on(event, handler)
  }

  public onAction(event: string, handler: ActionHandler): void {
    this.actionEmitter.on(event, handler)
  }

  public onInit(event: string, handler: InitHandler): void {
    this.initEmitter.on(event, handler)
  }

  public offFilter<T = unknown>(
    event: string,
    handler: FilterHandler<T>,
  ): void {
    this.filterEmitter.off(event, handler)
  }

  public offAction(event: string, handler: ActionHandler): void {
    this.actionEmitter.off(event, handler)
  }

  public offInit(event: string, handler: InitHandler): void {
    this.initEmitter.off(event, handler)
  }

  public offAll(): void {
    this.filterEmitter.removeAllListeners()
    this.actionEmitter.removeAllListeners()
    this.initEmitter.removeAllListeners()
  }
}

const emitter = new Emitter()

export const useEmitter = () => emitter

export default emitter
