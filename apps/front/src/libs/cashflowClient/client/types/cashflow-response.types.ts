import { CashflowAction } from './cashflow-action.types'

import { CashflowCommand } from './cashflow-command.types'
import { AppEventsSubscription, AppEventsType } from './cashflow-event.types'
import {
  CashflowGlobalVariable,
  CashflowGlobalVariableName,
  CashflowUserGlobalVariable,
  CashflowVariableValue,
} from './cashflow-global.types'
import { CashflowInfo } from './cashflow-info.types'
import { CashflowViewer } from './cashflow-viewer.types.ts'
import { Prettify } from './util.types'

export type CashflowResponse<T, TStatus = 'ok' | 'error'> = T & {
  id: string
  status: TStatus
}

export type CashflowOkResponse<T> = CashflowResponse<T, 'ok'>
export type CashflowErrorResponse = CashflowResponse<{ error: string }, 'error'>
export type MaybeCashflowResponse<T> =
  | CashflowOkResponse<T>
  | CashflowErrorResponse

export type SubscribeResponse = CashflowResponse<{
  events: AppEventsSubscription
}>

export type UnsubscribeResponse = CashflowResponse<{
  events: AppEventsSubscription
}>

export type GetEventsResponse = CashflowResponse<{
  events: AppEventsType
}>

export type GetActionsResponse = CashflowResponse<{
  actions: Array<CashflowAction>
  count: number
}>

export type DoActionResponse = CashflowResponse<{}>

export type ClearCreditsResponse = CashflowResponse<{}>

export type GetInfoResponse = CashflowResponse<{
  info: CashflowInfo
}>

export type ExecuteCodeTriggerResponse = CashflowResponse<unknown>

export type GetCodeTriggersResponse = CashflowResponse<{
  triggers: Array<{
    name: string
    eventName: string
    category: string
  }>
  count: number
}>

export type GetCommandsResponse = CashflowResponse<{
  commands: Array<CashflowCommand>
  count: number
}>

export type GetGlobalsResponse = CashflowResponse<{
  variables: Record<CashflowGlobalVariableName, CashflowGlobalVariable>
  count: number
}>

export type GetGlobalResponse<
  T extends CashflowVariableValue,
  K extends string = string,
> = MaybeCashflowResponse<{
  variables: Record<K, Prettify<CashflowGlobalVariable<T, K>>>
  count: number
}>

export type GetUserGlobalsResponse<
  T extends CashflowVariableValue = CashflowVariableValue,
  K extends string = string,
> = CashflowResponse<{
  variables: CashflowUserGlobalVariable<T, K, string>[]
  count: number
}>

export type GetUserGlobalResponse<
  T extends CashflowVariableValue = CashflowVariableValue,
  K extends string = string,
> = MaybeCashflowResponse<{
  variables: CashflowGlobalVariable<T, K>[]
  count: number
}>

export type GetActiveViewersResponse = CashflowResponse<{
  viewers: Array<CashflowViewer>
  count: number
}>

export type SendMessageResponse = MaybeCashflowResponse<{}>

export type CashflowResponseTypes =
  | CashflowResponse<unknown>
  | SubscribeResponse
  | UnsubscribeResponse
  | GetEventsResponse
  | GetActionsResponse
  | DoActionResponse
  | ClearCreditsResponse
  | GetInfoResponse
  | ExecuteCodeTriggerResponse
  | GetCodeTriggersResponse
  | GetCommandsResponse
  | GetGlobalsResponse
  | GetGlobalResponse<CashflowVariableValue>
  | GetUserGlobalsResponse
  | GetUserGlobalResponse
  | SendMessageResponse
  | GetActiveViewersResponse
