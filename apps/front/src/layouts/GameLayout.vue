<!-- eslint-disable vue/max-attributes-per-line -->
<script setup lang="ts">
import { eventBus } from '@/composables/eventBus'
import { useWebSockets } from '@/composables/useWebsocket'
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const shopOpen = ref(false)
const { connectionStatus } = useWebSockets()
const settingsModal = ref(false)
const isConnected = computed(() => connectionStatus.value === 'OPEN')
const { isMobile } = useIsMobile()
eventBus.on('settingsModal', (val) => {
  settingsModal.value = val
})
eventBus.on('shopOpen', (val) => {
  console.log('shopOpen', val)
})
onMounted(async() => {
  console.log('mounted')
  const channel = await userStore.startSubscription()
  console.log(channel.state)

})
</script>

<template>
  <!-- <div v-if="!mobile" id="LayoutAuthenticated" class="overflow-hidden" style="height: 100vh"> -->
  <div v-if="isConnected"
    style="z-index: 999999; position: fixed; top: -2px; right: -6px; width: 25px; pointer-events: none">
    <img src="/images/connection-high.png" h="10" w="15"></img>
  </div>
  <div v-else style="z-index: 999999; position: fixed; top: -2px; right: -6px; width: 25px; pointer-events: none ">
    <img src="/images/connection-off.png" h="10" w="15"></img>
  </div>
  <div id="GameLayout" class="overflow-hidden">
    <GameTopBar v-if="isMobile === true">
    </GameTopBar>
    <GameLeftBar v-else>
    </GameLeftBar>
    <slot />
    <SettingsView :has-cancel="false" :model-value="settingsModal" />
    <OverlayLayer v-if="shopOpen" :model-value="shopOpen">
      <ShopView v-if="shopOpen" />
    </OverlayLayer>
  </div>
</template>
