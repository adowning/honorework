import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import type * as Reward from '@/interface/reward'
import { handleException } from './exception' // Assuming this path is correct

export const useRewardStore = defineStore('reward', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')

  const rewardList = ref<Reward.GetRewardCenterList>({} as Reward.GetRewardCenterList) // Keeping type assertion as in original

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getRewardList = computed(() => rewardList.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setRewardList = (list: Reward.GetRewardCenterList) => {
    rewardList.value = list
  }

  const dispatchRewardList = async () => {
    setSuccess(false)
    const route: string = NETWORK.Reward.REWARD_LIST
    const network: Network = Network.getInstance()

    const next = (response: Reward.GetRewardCenterListResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setRewardList(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  const dispatchReceiveAchievementBonus = async () => {
    setSuccess(false)
    const route: string = NETWORK.Reward.RECIEVE_ACHIV_BONUS
    const network: Network = Network.getInstance()

    const next = (response: Reward.GetBonusResponse) => {
      if (response.code == 200) {
        setSuccess(true)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    rewardList,

    getSuccess,
    getErrMessage,
    getRewardList,

    setSuccess,
    setErrorMessage,
    setRewardList,
    dispatchRewardList,
    dispatchReceiveAchievementBonus,
  }
})
