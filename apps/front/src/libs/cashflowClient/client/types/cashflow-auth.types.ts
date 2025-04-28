import { CashflowInfo } from './cashflow-info.types'

export type CashflowHelloRequest = {
  request: 'Hello'
  info: CashflowInfo
  authentication: {
    challenge: string
    salt: string
  }
  timestamp: string
  session: string
}
