import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import * as Achievement from '@/interface/achievement'
import { handleException } from './exception' // Assuming this path is correct

export const useAchievementStore = defineStore('achievement', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const achievementItem = ref<Achievement.GetAchievementItem>({
    achievement_progress: 0,
    achievement_explain: [],
    award_progress: 0,
    award_explain: [],
    rate: 0,
  })

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getAchievementItem = computed(() => achievementItem.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setAchievementItem = (item: Achievement.GetAchievementItem) => {
    achievementItem.value = item
  }

  // get achievement list
  const dispatchAchievementList = async () => {
    setSuccess(false)
    const route: string = NETWORK.ACHIEVEMENT_PAGE.ACHIEVEMENT_LIST
    const network: Network = Network.getInstance()

    const next = (response: Achievement.GetAchievementResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setAchievementItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // get achievement config
  const dispatchAchievementConfig = async () => {
    setSuccess(false)
    const route: string = NETWORK.ACHIEVEMENT_PAGE.ACHIEVEMENT_CONFIG
    const network: Network = Network.getInstance()

    const next = (response: Achievement.GetAchievementResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setAchievementItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  // dispatch stage award
  const dispatchStageAward = async (data: any) => {
    setSuccess(false)
    const route: string = NETWORK.ACHIEVEMENT_PAGE.STAGE_AWARD
    const network: Network = Network.getInstance()

    const next = (response: Achievement.GetAchievementResponse) => {
      if (response.code == 200) {
        setSuccess(true)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // dispatch achievement award
  const dispatchAchievementAward = async (data: any) => {
    setSuccess(false)
    const route: string = NETWORK.ACHIEVEMENT_PAGE.ACHIEVEMENT_AWARD
    const network: Network = Network.getInstance()

    const next = (response: Achievement.GetAchievementResponse) => {
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
    achievementItem,

    getSuccess,
    getErrMessage,
    getAchievementItem,

    setSuccess,
    setErrorMessage,
    setAchievementItem,
    dispatchAchievementList,
    dispatchAchievementConfig,
    dispatchStageAward,
    dispatchAchievementAward,
  }
})
