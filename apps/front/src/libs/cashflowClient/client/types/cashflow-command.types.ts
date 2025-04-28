export type CashflowCommand = {
  id: string
  enabled: boolean
  name: string
  group: string
  commands: Array<string>
  caseSensitive: boolean
  ignoreInternal: boolean
  ignoreBotAccount: boolean
  sources: Array<string>
}
