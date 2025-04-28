import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import type * as Withdraw from '@/interface/withdraw'
import { handleException } from './exception' // Assuming this path is correct

export const useWithdrawStore = defineStore('withdraw', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const withdrawConfig = ref<any>({}) // Keeping 'any' type as in original
  const withdrawSubmit = ref<any>({}) // Keeping 'any' type as in original
  const withdrawHistoryItem = ref<Withdraw.WithdrawalHistoryResponse>({
    total_pages: 0,
    record: [],
  })

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getWithdrawCfg = computed(() => withdrawConfig.value)
  const getWithdrawSubmit = computed(() => withdrawSubmit.value)
  const getWithdrawHistoryItem = computed(() => withdrawHistoryItem.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setWithdrawCfg = (config: any) => {
    // Keeping 'any' type as in original
    withdrawConfig.value = config
  }

  const setWithdrawSubmit = (submit: any) => {
    // Keeping 'any' type as in original
    withdrawSubmit.value = submit
  }

  const setWithdrawHistoryItem = (item: Withdraw.WithdrawalHistoryResponse) => {
    // Concatenate records as in original
    withdrawHistoryItem.value.record = [...withdrawHistoryItem.value.record, ...item.record]
    withdrawHistoryItem.value.total_pages = item.total_pages
  }

  // user withdraw configuration
  const dispatchUserWithdrawCfg = async () => {
    setSuccess(false)
    const route: string = NETWORK.WITHDRAW_PAGE.WITHDRAWAL_CONFIG
    const network: Network = Network.getInstance()

    const next = (response: Withdraw.GetWithdrawResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setWithdrawCfg(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  // user withdraw submit
  const dispatchUserWithdrawSubmit = async (data: Withdraw.WithdrawItem) => {
    setSuccess(false)
    const route: string = NETWORK.WITHDRAW_PAGE.WITHDRAWAL_SUBMIT
    const network: Network = Network.getInstance()

    const next = (response: Withdraw.SubmitWithdrawResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setWithdrawSubmit(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // user withdrawal history api response
  const dispatchWithdrawalHistory = async (data: any) => {
    // Keeping 'any' type as in original
    setSuccess(false)
    const route: string = NETWORK.WITHDRAW_PAGE.WITHDRAWAL_HISTORY
    const network: Network = Network.getInstance()

    const next = (response: Withdraw.GetWithdrawalHistoryResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setWithdrawHistoryItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // user withdrawal refund api response
  const dispatchWithdrawalRefund = async (data: any) => {
    // Keeping 'any' type as in original
    setSuccess(false)
    const route: string = NETWORK.WITHDRAW_PAGE.WITHDRAWAL_REFUND
    const network: Network = Network.getInstance()

    const next = (response: Withdraw.GetWithdrawalHistoryResponse) => {
      // Note: response type is GetWithdrawalHistoryResponse in original, check if correct
      if (response.code == 200) {
        // Manually update the status in the existing history record
        withdrawHistoryItem.value.record.forEach((item: Withdraw.WithdrawalHistoryItem) => {
          if (item.id == data.id) {
            item.status = 3 // Assuming status 3 means refunded based on original logic
          }
        })
        setSuccess(true)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    withdrawConfig,
    withdrawSubmit,
    withdrawHistoryItem,

    getSuccess,
    getErrMessage,
    getWithdrawCfg,
    getWithdrawSubmit,
    getWithdrawHistoryItem,

    setSuccess,
    setErrorMessage,
    setWithdrawCfg,
    setWithdrawSubmit,
    setWithdrawHistoryItem,
    dispatchUserWithdrawCfg,
    dispatchUserWithdrawSubmit,
    dispatchWithdrawalHistory,
    dispatchWithdrawalRefund,
  }
})
