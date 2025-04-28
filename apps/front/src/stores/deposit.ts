import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import type * as Deposit from '@/interface/deposit'
import { handleException } from './exception' // Assuming this path is correct

export const useDepositStore = defineStore('deposit', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const depositConfig = ref<any>({
    // Keeping 'any' type as in original
    bonus: [
      {
        type: 0,
      },
    ],
  })
  const depositSubmit = ref<any>({}) // Keeping 'any' type as in original
  const pixInfo = ref<Deposit.GetPixInfo>({} as Deposit.GetPixInfo) // Keeping type assertion as in original
  const pixInfoToggle = ref(false)
  const depositHistoryItem = ref<Deposit.DepositHistoryResponse>(
    {} as Deposit.DepositHistoryResponse,
  ) // Keeping type assertion as in original

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getDepositCfg = computed(() => depositConfig.value)
  const getDepositSubmit = computed(() => depositSubmit.value)
  const getPixInfo = computed(() => pixInfo.value)
  const getPixInfoToggle = computed(() => pixInfoToggle.value)
  const getDepositHistoryItem = computed(() => depositHistoryItem.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setDepositCfg = (config: any) => {
    // Keeping 'any' type as in original
    depositConfig.value = config
  }

  const setDepositSubmit = (submit: any) => {
    // Keeping 'any' type as in original
    depositSubmit.value = submit
  }

  const setPixInfo = (info: Deposit.GetPixInfo) => {
    pixInfo.value = info
  }

  const setPixInfoToggle = (toggle: boolean) => {
    pixInfoToggle.value = toggle
  }

  const setDepositHistoryItem = (item: Deposit.DepositHistoryResponse) => {
    depositHistoryItem.value = item
  }

  // user deposit configuration
  const dispatchUserDepositCfg = async () => {
    setSuccess(false)
    const route: string = NETWORK.DEPOSIT_PAGE.DEPOSIT_CONFIG
    const network: Network = Network.getInstance()

    const next = (response: Deposit.GetDepositResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setDepositCfg(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  // user deposit submit
  const dispatchUserDepositSubmit = async (data: Deposit.DepositItem) => {
    setSuccess(false)
    const route: string = NETWORK.DEPOSIT_PAGE.DEPOSIT_SUBMIT
    const network: Network = Network.getInstance()

    const next = (response: Deposit.SubmitDepositResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setDepositSubmit(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // user deposit history
  const dispatchUserDepositHistory = async (data: any) => {
    // Keeping 'any' type as in original
    setSuccess(false)
    const route: string = NETWORK.DEPOSIT_PAGE.DEPOSIT_HISTORY
    const network: Network = Network.getInstance()

    const next = (response: Deposit.GetDepositHistoryResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setDepositHistoryItem(response.data)
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
    depositConfig,
    depositSubmit,
    pixInfo,
    pixInfoToggle,
    depositHistoryItem,

    getSuccess,
    getErrMessage,
    getDepositCfg,
    getDepositSubmit,
    getPixInfo,
    getPixInfoToggle,
    getDepositHistoryItem,

    setSuccess,
    setErrorMessage,
    setDepositCfg,
    setDepositSubmit,
    setPixInfo,
    setPixInfoToggle,
    setDepositHistoryItem,
    dispatchUserDepositCfg,
    dispatchUserDepositSubmit,
    dispatchUserDepositHistory,
  }
})
