import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import * as Bonus from '@/interface/bonus'
import { handleException } from './exception' // Assuming this path is correct

export const useBonusStore = defineStore('bonus', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const bonusList = ref<Bonus.GetBonusList>({
    list: [],
  })

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getBonusList = computed(() => bonusList.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setBonusList = (list: Bonus.GetBonusList) => {
    bonusList.value = list
  }

  // user bonus
  const dispatchUserBonus = async () => {
    setSuccess(false)
    const route: string = NETWORK.BONUS_PAGE.USER_BONUS
    const network: Network = Network.getInstance()

    const next = (response: Bonus.GetUserBonusResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setBonusList(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // bonus cancel
  const dispatchBonusCancel = async (data: any) => {
    setSuccess(false)
    const route: string = NETWORK.BONUS_PAGE.BONUS_CANCEL
    const network: Network = Network.getInstance()

    const next = (response: any) => {
      // Note: response type is 'any' in original
      if (response.code == 200) {
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
    bonusList,

    getSuccess,
    getErrMessage,
    getBonusList,

    setSuccess,
    setErrorMessage,
    setBonusList,
    dispatchUserBonus,
    dispatchBonusCancel,
  }
})
