import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct

export const useAboutStore = defineStore('about_us', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const activeAboutIndex = ref(0)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getActiveAboutIndex = computed(() => activeAboutIndex.value)

  // Actions converted to regular functions
  const setActiveAboutIndex = (index: number) => {
    activeAboutIndex.value = index
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    activeAboutIndex,

    getSuccess,
    getErrMessage,
    getActiveAboutIndex,

    setActiveAboutIndex,
  }
})
