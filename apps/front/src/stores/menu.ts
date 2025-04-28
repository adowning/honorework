import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct

export const useMenuStore = defineStore('mobile_menu', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const selectedItem = ref('Promo')
  const semiCircleShow = ref(false)
  const rewardNavShow = ref(false)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getSelectedItem = computed(() => selectedItem.value)
  const getSemiCircleShow = computed(() => semiCircleShow.value)
  const getRewardNavShow = computed(() => rewardNavShow.value)

  // Actions converted to regular functions
  const setSelectedItem = (item: string) => {
    selectedItem.value = item
  }

  const setSemiCircleShow = (show: boolean) => {
    semiCircleShow.value = show
  }

  const setRewardNavShow = (show: boolean) => {
    rewardNavShow.value = show
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    selectedItem,
    semiCircleShow,
    rewardNavShow,

    getSuccess,
    getErrMessage,
    getSelectedItem,
    getSemiCircleShow,
    getRewardNavShow,

    setSelectedItem,
    setSemiCircleShow,
    setRewardNavShow,
  }
})
