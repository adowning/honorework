import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { handleException } from './exception' // Assuming this path is correct

export const useAgentStore = defineStore('agent', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const agentNavBarToggle = ref(false)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getAgentNavBarToggle = computed(() => agentNavBarToggle.value)

  // Actions converted to regular functions
  const setAgentNavBarToggle = (toggle: boolean) => {
    agentNavBarToggle.value = toggle
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    agentNavBarToggle,

    getSuccess,
    getErrMessage,
    getAgentNavBarToggle,

    setAgentNavBarToggle,
  }
})
