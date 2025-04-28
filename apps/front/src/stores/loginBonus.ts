import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct

export const useLoginBonusStore = defineStore('loginBonus', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const loginBonusDialogVisible = ref(false)
  const rouletteBonusDialogVisible = ref(false)
  const getBonusDialogVisible = ref(false) // Renamed from getBonusDialogVisible in getters

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getLoginBonusDialogVisible = computed(() => loginBonusDialogVisible.value)
  const getRouletteBonusDialogVisible = computed(() => rouletteBonusDialogVisible.value)
  const getDepositAndBonusDialogVisible = computed(() => getBonusDialogVisible.value) // Using the ref name

  // Actions converted to regular functions
  const setLoginBonusDialogVisible = (visible: boolean) => {
    console.log(visible) // Keeping original console log
    loginBonusDialogVisible.value = visible
  }

  const setRouletteBonusDialogVisible = (visible: boolean) => {
    rouletteBonusDialogVisible.value = visible
  }

  const setGetBonusDialogVisible = (visible: boolean) => {
    getBonusDialogVisible.value = visible
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    loginBonusDialogVisible,
    rouletteBonusDialogVisible,
    getBonusDialogVisible, // Expose the ref with the original getter name if needed for consistency, or use the ref name directly

    getSuccess,
    getErrMessage,
    getLoginBonusDialogVisible,
    getRouletteBonusDialogVisible,
    getDepositAndBonusDialogVisible,

    setLoginBonusDialogVisible,
    setRouletteBonusDialogVisible,
    setGetBonusDialogVisible,
  }
})
