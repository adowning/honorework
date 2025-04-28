import { AppEvents } from './events'
import { DeepWriteable, JsonObject } from './util.types'

export type AppEventsType = typeof AppEvents
export type AppEventsTypeWriteable = DeepWriteable<AppEventsType>
export type AppEventsource = keyof typeof AppEvents
export type CashflowEventType<TSource = AppEventsource> =
  AppEventsType[TSource extends AppEventsource
    ? TSource
    : AppEventsource][number]

type AppEventsourceValue<T extends AppEventsource> = T extends AppEventsource
  ? `${T}.${AppEventsType[T][number] | '*'}`
  : string

export type CashflowEventName = `${AppEventsourceValue<AppEventsource>}`

type AppEventsSubscriptionType<T extends AppEventsource> =
  T extends AppEventsource ? Array<AppEventsType[T][number]> : string[]
export type AppEventsSubscription = Partial<{
  [P in AppEventsource]: AppEventsSubscriptionType<P>
}>

export type CashflowEventPayload<TEvent extends CashflowEventName> =
  (TEvent extends `${infer Source extends AppEventsource}.${infer Type extends
    | CashflowEventType
    | '*'}`
    ? Type extends CashflowEventType
      ? {
          event: { source: Source; type: Type }
          data: AppEventsBySource[Source][Type]
        }
      : {
          event: { source: Source; type: CashflowEventType<Source> }
          data: AppEventsBySource[Source][CashflowEventType<Source>]
        }
    : {
        event: { source: string; type: string }
        data: unknown
      }) & {
    timeStamp: string
  }

export type CashflowEventData<TEvent extends CashflowEventName> =
  TEvent extends `${infer Source extends AppEventsource}.${infer Type extends
    | CashflowEventType
    | '*'}`
    ? Type extends '*'
      ? AppEventsBySource[Source][CashflowEventType<Source>]
      : AppEventsBySource[Source][Type]
    : unknown

/**
 * Fallback type for unknown Streamer.bot event data
 */
export type UnknownEventData = JsonObject | undefined

/**
 * All possible Streamer.bot events indexed by source and type
 */
export type AppEventsBySource = VerifyEventSources<{
  Application: any
  Command: any
  Custom: any
  FileWatcher: any
  General: any
  Group: any
  Misc: any
  Raw: any
  StreamElements: any
  CashflowRemote: any
  ThrowingSystem: any
  WebsocketClient: any
  WebsocketCustomServer: any
  FileTail: {
    EventType1: JsonObject
    EventType2: JsonObject
    // 定义其他事件类型
  }
  Quote: any
  Pallygg: any
  StreamerbotRemote: any
  // 定义其他缺少的属性
}>

/**
 * Type guard for Streamer.bot event sources
 *
 * This will check that all Streamer.bot event sources are defined as types
 */
type EventSourceGuard<TSource extends AppEventsource> = Record<
  TSource,
  EventTypeGuard<TSource> | unknown
>
export type VerifyEventSources<
  T extends EventSourceGuard<AppEventsource> & {
    [U in Exclude<keyof T, CashflowEventType>]: unknown
  },
> = T

/**
 * Type guard for Streamer.bot event types
 *
 * This will check that all possible event types are defined within a given event source
 */
type EventTypeGuard<TSource> = Record<
  CashflowEventType<TSource>,
  JsonObject | undefined
>
export type VerifyEventTypes<
  TSource,
  T extends EventTypeGuard<TSource> & {
    [U in Exclude<keyof T, CashflowEventType<TSource>>]: never
  },
> = T
