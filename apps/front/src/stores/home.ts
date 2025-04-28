import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct

export const useHomeStore = defineStore('home', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const searchDialogShow = ref(false)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getSearchDialogShow = computed(() => searchDialogShow.value)

  // Actions converted to regular functions
  const setSearchDialogShow = (show: boolean) => {
    searchDialogShow.value = show
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    searchDialogShow,

    getSuccess,
    getErrMessage,
    getSearchDialogShow,

    setSearchDialogShow,
  }
})
