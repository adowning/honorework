export type CashflowGlobalVariableName = string

export type CashflowVariableValue = string | number | boolean | null

export type CashflowGlobalVariable<
  T extends CashflowVariableValue = CashflowVariableValue,
  K extends string = string,
> = {
  name: K
  value: T
  lastWrite: string
}

export type CashflowUserGlobalVariable<
  T extends CashflowVariableValue = CashflowVariableValue,
  K extends string = string,
  U = string,
> = CashflowGlobalVariable<T, K> & {
  userId: U
  userLogin: string
  userName: string
}
