import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct
import { type TransactionHistoryResponse } from '@/interface/transaction'
import type * as Transaction from '@/interface/transaction'
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'

export const useBonusTransactionStore = defineStore('bonusTransaction', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const bonusTabIndex = ref(0)
  const transactionTab = ref('')
  const transactionHistoryItem = ref<TransactionHistoryResponse>({
    total_pages: 0,
    record: [],
  })
  const moreTransactionHistoryFlag = ref(true)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getBonusTabIndex = computed(() => bonusTabIndex.value)
  const getTransactionTab = computed(() => transactionTab.value)
  const getTransactionHistoryItem = computed(() => transactionHistoryItem.value)
  const getMoreTransactionHistoryFlag = computed(() => moreTransactionHistoryFlag.value)

  // Actions converted to regular functions
  const setBonusTabIndex = (index: number) => {
    bonusTabIndex.value = index
  }

  const setTransactionTab = (tab: string) => {
    console.log(tab) // Keeping original console log
    transactionTab.value = tab
  }

  const setTransactionHistoryItem = (item: TransactionHistoryResponse) => {
    if (item.record.length == 0) {
      moreTransactionHistoryFlag.value = false
    } else {
      // Concatenate records
      transactionHistoryItem.value.record = [...transactionHistoryItem.value.record, ...item.record]
      transactionHistoryItem.value.total_pages = item.total_pages
      moreTransactionHistoryFlag.value = true
    }
  }

  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  // transaction history api response
  const dispatchTransactionHistory = async (data: any) => {
    setSuccess(false)
    const route: string = NETWORK.TRANSACTION_PAGE.TRANSACTION_HISTORY
    const network: Network = Network.getInstance()

    const next = (response: Transaction.GetTransactionHistoryResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setTransactionHistoryItem(response.data)
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
    bonusTabIndex,
    transactionTab,
    transactionHistoryItem,
    moreTransactionHistoryFlag,

    getSuccess,
    getErrMessage,
    getBonusTabIndex,
    getTransactionTab,
    getTransactionHistoryItem,
    getMoreTransactionHistoryFlag,

    setBonusTabIndex,
    setTransactionTab,
    setTransactionHistoryItem,
    setSuccess,
    setErrorMessage,
    dispatchTransactionHistory,
  }
})
s
