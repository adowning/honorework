export type CashflowRequestName =
  | 'Authenticate'
  | 'Socket'
  | 'Login'
  | 'Register'
  | 'Subscribe'
  | 'UnSubscribe'
  | 'GetEvents'
  | 'GetActions'
  | 'DoAction'
  | 'GetBroadcaster'
  | 'GetCredits'
  | 'GetInfo'
  | 'GetActiveViewers'
  | 'ExecuteCodeTrigger'
  | 'GetCodeTriggers'
  | 'GetCommands'
  | 'GetGlobals'
  | 'GetGlobal'
  | 'SendMessage'
// export type CashflowRequestRoute = 'LOGIN'
export type CashflowRequest = {
  request: CashflowRequestName
  [key: string]: any
}
