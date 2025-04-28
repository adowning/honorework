import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { type GetMailData } from '@/interface/mail' // Assuming this path is correct
import { handleException } from './exception' // Assuming this path is correct

export const useMailStore = defineStore('mail', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const mailList = ref<GetMailData[]>([
    {
      id: 1,
      icon: new URL('@/assets/public/svg/icon_public_14.svg', import.meta.url).href,
      offset: 0,
      mail_content_1: {
        color: 'text-color-white text-500-12',
        content: 'Subscribe to notifications',
      },
      mail_content_2: {
        color: 'text-color-gray text-500-10',
        content: 'Enable push notifications to receive exclusive bonuses!',
      },
      mail_rail_1: {
        color: '',
        content: '',
      },
      mail_rail_2: {
        color: '',
        content: '',
      },
    },
    {
      id: 2,
      icon: new URL('@/assets/public/svg/icon_public_15.svg', import.meta.url).href,
      offset: 0,
      mail_content_1: {
        color: 'text-color-white text-500-12',
        content: 'Refer a friend',
      },
      mail_content_2: {
        color: 'text-color-gray text-500-10',
        content: 'lnvite Friends, Earn $10 Per lnvite',
      },
      mail_rail_1: {
        color: '',
        content: '',
      },
      mail_rail_2: {
        color: '',
        content: '',
      },
    },
  ])
  const mailMenuShow = ref(false)
  const mobileMenuMailToggle = ref(false)

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getMailList = computed(() => mailList.value)
  const getMailMenuShow = computed(() => mailMenuShow.value)
  const getMobileMenuMailToggle = computed(() => mobileMenuMailToggle.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setMailList = (mailItem: GetMailData) => {
    mailList.value.unshift(mailItem)
  }

  const setMailMenuShow = (show: boolean) => {
    mailMenuShow.value = show
  }

  const setMobileMenuMailToggle = (toggle: boolean) => {
    mobileMenuMailToggle.value = toggle
  }

  // Return all state, getters, and actions
  return {
    success,
    errMessage,
    mailList,
    mailMenuShow,
    mobileMenuMailToggle,

    getSuccess,
    getErrMessage,
    getMailList,
    getMailMenuShow,
    getMobileMenuMailToggle,

    setSuccess,
    setErrorMessage,
    setMailList,
    setMailMenuShow,
    setMobileMenuMailToggle,
  }
})
