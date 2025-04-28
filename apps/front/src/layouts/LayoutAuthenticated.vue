<script setup lang="ts">
// import { useWebSockets } from '@/composables'
import { eventBus } from '@/composables/eventBus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppBarStore } from '@/stores/appBar';

// const { api } = useRequest()
const shopOpen = ref(false)
const appBarStore = useAppBarStore()
// const { connectionStatus } = useWebSockets()
const router = useRouter()
const settingsModal = ref(false)
const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)
// const isConnected = computed(() => connectionStatus.value === 'OPEN')
const isMobile = useIsMobile()
const orientation = useScreenOrientation()
const overlayScrimBackground = ref<string>('rgb(var(--v-theme-on-surface))')

watch(orientation, async (newOrienation) => {
  console.log(newOrienation)
})

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

eventBus.on('settingsModal', (val) => {
  settingsModal.value = val
})
eventBus.on('shopOpen', (val) => {
  console.log('shopOpen', val)
})
// watch(
//   toRef(socketStore, 'socketData'),
//   (newValue) => {
//     // console.log('myItems changed:', newValue, oldValue)
//     playerBalance.value = newValue.new_balance

//     // Perform actions based on the change
//   },
//   { deep: true }
// )

// main blur effect
const mainBlurEffectShow = computed(() => {
  const { getMainBlurEffectShow } = storeToRefs(appBarStore);
  return getMainBlurEffectShow.value
})

// overlay scrim show
const overlayScrimShow = computed(() => {
  const { getOverlayScrimShow } = storeToRefs(appBarStore);
  return getOverlayScrimShow.value;
})
watch(overlayScrimShow, (newValue) => {
  if (newValue) {
    overlayScrimBackground.value = "transparent";
  } else {
    overlayScrimBackground.value = "rgb(var(--v-theme-on-surface))";
  }
  document.documentElement.style.setProperty('--background-color', overlayScrimBackground.value);
})

function runTest() {
  // api.appControllerGetHealth.send()
}
onMounted(() => {})
</script>

<template>
  <!-- <div v-if="!mobile" id="LayoutAuthenticated" class="overflow-hidden" style="height: 100vh"> -->
  <div
    v-if="isConnected"
    style="z-index: 999999; position: absolute; top: -2px; right: -6px; width: 25px"
  >
    <img src="/images/connection-high.png" h="10" w="15" @click="runTest" />
  </div>
  <div v-else style="z-index: 999999; position: absolute; top: -2px; right: -6px; width: 25px">
    <img src="/images/connection-off.png" h="10" w="15" />
  </div>
  <!-- <div id="LayoutAuthenticated" class="overflow-hidden"
    :class="{ 'overflow-hidden lg:overflow-hidden': isAsideMobileExpanded }" style="max-height: 100vh"> -->
  <LobbyBackground />
  <!-- <div style="position: fixed" v-if="orientation === 'portrait-primary'"> -->
  <!-- {{ orientation.orientation }} -->

  <div style="position: fixed">
    <div class="flex flex-col gap-3 h-screen">
      <AppBar2 />
      <!-- <TopBar class="animate__animated animate__slideInDown animate__delay-1s"> -->
        <!-- <NavBar
          :menu="menuNavBar"
          :class="[(layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded })]"
          @menu-click="menuClick"
        ></NavBar> -->
      <!-- </TopBar> -->
      <!-- </div> -->

      <!-- <div :class="[
    layoutAsidePadding,
    { 'ml-60 lg:ml-0': isAsideMobileExpanded },
    orientation === 'portrait-primary' ? 'pt-13' : 'pt-0',
  ]" class="min-h-screen w-screen transition-position lg:w-auto dark:text-slate-100"> -->
      <div class="flex flex-col mt-12 w-screen">
        <slot />
      </div>
      <!-- </div> -->
      <SettingsView :has-cancel="false" :model-value="settingsModal" />
      <OverlayLayer v-if="shopOpen" :model-value="shopOpen">
        <ShopView v-if="shopOpen" />
      </OverlayLayer>

      <FooterBar v-if="isMobile" class="animate__animated animate__slideInUp animate__delay-1s" />
    </div>
  </div>
  <!-- </div> -->
</template>
<style scoped></style>
