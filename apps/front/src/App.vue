<script setup lang="ts">
import { onMounted } from 'vue'
import LevelUpPopup from './components/LevelUpPopup.vue'
import LoginView from '@/views/LoginView.vue'
// import { initializeWebSocket } from './composables/useWebsocket' // Adjust path
// import { hydrateStores } from './stores'
// import { useUserStore } from './stores/user'
// import { router } from './router'
// import { loadingFadeOut } from 'virtual:app-loading'
// import { EventManager } from './composables/EventManager'
import { useCashflowStore } from './stores/cashflow.store'
import { useUserStore } from './stores/user'

// const levelPopup = ref()
// // Get access to the shared state/functions
const { isLoading, stopLoading } = useLoading()
const { isMobile } = useIsMobile()
// const storesHydrated = ref(false)
const showLevelUp = ref(false)
// const userStore = useUserStore()
const { currentUser, vipLevel } = useUserStore()
// const eventManager = EventManager.getInstance()
// const currentUser = userStore.currentUser
// eventManager.on(
//   'level-up',
//   (level) => {
//     if (currentUser.vipRankLevel >= level) return
//     showLevelUp.value = true
//   },
//   levelPopup.value,
// )
const store = useCashflowStore()
onMounted(async () => {
  stopLoading()
  console.log(isLoading.value)

  // try {
  //   // // Replace with your actual WebSocket server URL
  //   let WEBSOCKET_URL = 'wss://mobile.cashflowcasino.com/api/setup' // Test echo server
  //   // // Call this only ONCE!
  //   console.log(userStore.isAuthenticated)
  //   if (userStore.isAuthenticated == true) {
  //     storesHydrated.value = await hydrateStores()
  //     if (storesHydrated.value == true) {
  //       let token = userStore.token
  //       if (!token) token = localStorage.getItem('access_token')
  //       WEBSOCKET_URL += `?token=${token}`
  //       initializeWebSocket(WEBSOCKET_URL)
  //     } else {
  //       console.log('pushing to login')
  //       localStorage.clear()
  //       router.push('/login')
  //       loadingFadeOut()
  //     }
  //   } else {
  //     console.log('pushing to login')
  //     localStorage.clear()
  //     // stopLoading()
  //     router.push('/login')
  //     loadingFadeOut()
  //   }
  // } catch (e) {
  //   console.log(e)
  // }
})
</script>

<template>
  <template v-if="(store.isConnected || !store.isNewConnection) && store.instance">
    <DesktopSection v-if="!isMobile">
      <RouterView />
    </DesktopSection>
    <MobileSection v-if="isMobile">
      <RouterView />
    </MobileSection>
  </template>
  <template v-else-if="!store.isConnected">
    <LoginView />
  </template>
  <LevelUpPopup ref="levelPopup" v-if="showLevelUp" :vipLevel="currentUser.vipRankLevel" />
  <ShowToasts />
</template>

<style scoped></style>
