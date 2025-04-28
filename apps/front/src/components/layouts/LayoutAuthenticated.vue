<script setup lang="ts">
import { eventBus } from '@/composables/eventBus'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const shopOpen = ref(false)

const layoutAsidePadding = 'xl:pl-60'
const router = useRouter()
const settingsModal = ref(false)

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

const { orientation } = useScreenOrientation()
eventBus.on('settingsModal', (val) => {
  console.log(val)
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
onMounted(() => {})
</script>

<template>
  <!-- <OverlayLayer v-show="isLoading" @overlay-click="cancel" /> -->
  <div
    id="LayoutAuthenticated"
    class="overflow-hidden"
    :class="{ 'overflow-hidden lg:overflow-hidden': isAsideMobileExpanded }"
    style="max-height: 100vh; pointer-events: none"
  >
    <LobbyBackground />
    <div style="position: fixed" v-if="orientation === 'portrait-primary'">
      <TopBar class="animate__animated animate__slideInDown animate__delay-1s" />
    </div>
    <div
      :class="[
        layoutAsidePadding,
        { 'ml-60 lg:ml-0': isAsideMobileExpanded },
        orientation === 'portrait-primary' ? 'pt-12' : 'pt-0',
      ]"
      class="min-h-screen w-screen transition-position lg:w-auto dark:text-slate-100"
    >
      <slot />
    </div>
    <SettingsView :has-cancel="false" :model-value="settingsModal" />
    <OverlayLayer v-if="shopOpen" :model-value="shopOpen">
      <ShopView v-if="shopOpen" />
    </OverlayLayer>

    <FooterBar
      v-if="orientation === 'portrait-primary'"
      class="animate__animated animate__slideInUp animate__delay-1s"
    />
  </div>
</template>
