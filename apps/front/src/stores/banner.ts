import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import type * as Banner from '@/interface/banner'
import { handleException } from './exception' // Assuming this path is correct

export const useBannerStore = defineStore('banner', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const bannerList = ref<Array<Banner.GetBannerList>>([])

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getBannerList = computed(() => bannerList.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setBannerList = (list: Array<Banner.GetBannerList>) => {
    bannerList.value = list
  }

  const dispatchBannerList = async () => {
    setSuccess(false)
    const route: string = NETWORK.Banner.BANNER_LIST
    const network: Network = Network.getInstance()

    const next = (response: Banner.GetBannerListResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setBannerList(response.data)
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
    bannerList,

    getSuccess,
    getErrMessage,
    getBannerList,

    setSuccess,
    setErrorMessage,
    setBannerList,
    dispatchBannerList,
  }
})
