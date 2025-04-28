import { defineStore } from 'pinia'
import { ref, computed } from 'vue' // Import reactive functions
import { NETWORK } from '@/net/NetworkCfg'
import { Network } from '@/net/Network'
import type * as Invite from '@/interface/invite'
import { handleException } from './exception' // Assuming this path is correct

export const useInviteStore = defineStore('invite', () => {
  // State properties converted to reactive references
  const success = ref(false)
  const errMessage = ref('')
  const inviteItem = ref<Invite.InviteData>({
    bonus_month: 0,
    bonus_today: 0,
    bonus_total: 0,
    bonus_yesterdays: 0,
    deposit_users: 0,
    deposit_users_month: 0,
    deposit_users_today: 0,
    deposit_users_yesterdays: 0,
    invite_code: '',
    invited_users: 0,
    web_invite_url: import.meta.env.VITE_BASE_URL,
    available_bonus: 0,
  })
  const personalInvitationInfo = ref<Invite.PersonalInvitationInformation>({
    total_profit: '19,34',
    invitation_bonus: 25.916,
    bettion_commission: '40.533,73',
    achievement_bonus: 3.225,
    deposited_users: 3972,
    profit_today: {
      profit: '19,34',
      bettion_commission: '19,34',
      invite_bonus: 0,
    },
    profit_week: {
      profit: '19,34',
      bettion_commission: '19,34',
      invite_bonus: 0,
    },
    profit_month: {
      profit: '19,34',
      bettion_commission: '19,34',
      invite_bonus: 0,
    },
  })
  const inviteHistoryConfig = ref<Invite.InviteHistoryConfig>({} as Invite.InviteHistoryConfig) // Keeping type assertion as in original
  const statisticsItem = ref<Invite.StatisticsData>({
    today_profit: {
      register_user: [],
      deposit_user: [],
      deposit_bonus: 0,
      deposit_amount: [],
      bet_amount: [],
      bet_bonus: [],
      achievement_award: 0,
    },
    week_profit: {
      register_user: [],
      deposit_user: [],
      deposit_bonus: 0,
      deposit_amount: [],
      bet_amount: [],
      bet_bonus: [],
      achievement_award: 0,
    },
    month_profit: {
      register_user: [],
      deposit_user: [],
      deposit_bonus: 0,
      deposit_amount: [],
      bet_amount: [],
      bet_bonus: [],
      achievement_award: 0,
    },
    receive_profit: 0,
  })
  const inviteHistoryItem = ref<Invite.InviteHistoryData>({
    total_pages: 0,
    list: [],
  })

  // Getters converted to computed properties
  const getSuccess = computed(() => success.value)
  const getErrMessage = computed(() => errMessage.value)
  const getInviteItem = computed(() => inviteItem.value)
  const getPersonalInvitationInfo = computed(() => personalInvitationInfo.value)
  const getInviteHistoryConfig = computed(() => inviteHistoryConfig.value)
  const getStatisticsItem = computed(() => statisticsItem.value)
  const getInviteHistoryItem = computed(() => inviteHistoryItem.value)

  // Actions converted to regular functions
  const setSuccess = (isSuccess: boolean) => {
    success.value = isSuccess
  }

  const setErrorMessage = (message: string) => {
    errMessage.value = message
  }

  const setInviteItem = (item: Invite.InviteData) => {
    inviteItem.value = item
  }

  const setPersonalInvitationInfo = (info: Invite.PersonalInvitationInformation) => {
    personalInvitationInfo.value = info
  }

  const setInviteHistoryConfig = (config: Invite.InviteHistoryConfig) => {
    inviteHistoryConfig.value = config
  }

  const setStatisticsItem = (item: Invite.StatisticsData) => {
    statisticsItem.value = item
  }

  const setInviteHistoryItem = (item: Invite.InviteHistoryData) => {
    inviteHistoryItem.value = item
  }

  // user invitation information
  const dispatchUserInvite = async () => {
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.INVITE_INFO
    const network: Network = Network.getInstance()

    const next = (response: Invite.GetInviteResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setInviteItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // get invitation activity commission record
  const dispatchUserInviteHistory = async (formData: Invite.InviteHistoryFormData) => {
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.INVITE_HISTORY
    const network: Network = Network.getInstance()

    const next = (response: Invite.InviteHistoryResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setInviteHistoryItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, formData, next, 1)
  }

  // get agent achievement information
  const dispatchStatisticsList = async () => {
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.STATISTICS_LIST
    const network: Network = Network.getInstance()

    const next = (response: Invite.GetStatisticsResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setStatisticsItem(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // receive invitation achievement commissions
  const dispatchInviteAward = async (data: any) => {
    // Keeping 'any' type as in original
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.INVITER_AWARD
    const network: Network = Network.getInstance()

    const next = (response: Invite.GetInviteResponse) => {
      if (response.code == 200) {
        setSuccess(true)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, data, next, 1)
  }

  // personal invitation information
  const dispatchInviteSelf = async () => {
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.INVITE_SELF
    const network: Network = Network.getInstance()

    const next = (response: Invite.GetInviteSelfResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setPersonalInvitationInfo(response.data)
      } else {
        setErrorMessage(handleException(response.code))
      }
    }
    await network.sendMsg(route, {}, next, 1)
  }

  // invitation event commission record configuration
  const dispatchInviteHistoryCfg = async () => {
    setSuccess(false)
    const route: string = NETWORK.INVITE_PAGE.INVITE_HISTORY_CONFIG
    const network: Network = Network.getInstance()

    const next = (response: Invite.GetInviteHistoryResponse) => {
      if (response.code == 200) {
        setSuccess(true)
        setInviteHistoryConfig(response.data)
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
    inviteItem,
    personalInvitationInfo,
    inviteHistoryConfig,
    statisticsItem,
    inviteHistoryItem,

    getSuccess,
    getErrMessage,
    getInviteItem,
    getPersonalInvitationInfo,
    getInviteHistoryConfig,
    getStatisticsItem,
    getInviteHistoryItem,

    setSuccess,
    setErrorMessage,
    setInviteItem,
    setPersonalInvitationInfo,
    setInviteHistoryConfig,
    setStatisticsItem,
    setInviteHistoryItem,
    dispatchUserInvite,
    dispatchUserInviteHistory,
    dispatchStatisticsList,
    dispatchInviteAward,
    dispatchInviteSelf,
    dispatchInviteHistoryCfg,
  }
})
