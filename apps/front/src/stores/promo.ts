import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct
import type * as Promo from '@/interface/promo' // Assuming this path is correct
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'

export const usePromoStore = defineStore('promo', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const userActivityList = ref<Promo.PromoGroupData>({
    group_data: [
      {
        group_id: 0,
        group_name: '',
        list_data: [],
      },
    ],
  })

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getUserActivityList = computed(() => userActivityList.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setUserActivityList = (activityList: any) => {
    // Keeping 'any' type as in original
    userActivityList.value = activityList
  }

  // user activity list api
  const dispatchUserActivityList = async () => {
    setSuccess(false)
    const route: string = NETWORK.ACTIVITY.USER_ACTIVITY_LIST
    const network: Network = Network.getInstance()

    const next = (response: any) => {
      // Note: response type is 'any' in original
      if (response.code == 200) {
        setSuccess(true)
        setUserActivityList(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1, 4)
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    userActivityList,

    getSuccess,
    getErrMessage,
    getUserActivityList,

    setSuccess,
    setErrorMessage,
    setUserActivityList,
    dispatchUserActivityList,
  }
})
