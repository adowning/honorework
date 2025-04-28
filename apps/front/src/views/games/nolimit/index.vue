<script setup lang="ts">
import { eventBus } from '@/composables/eventBus'
import { useUserStore } from '@/stores/user'
import destr from 'destr'

const store = useUserStore()
const currentUser = store.currentUser
const gameFrameRef = ref<any>(null)
const frameShow = ref<boolean>(false)
const showGameBar = ref<boolean>(false)
const startingBalance = ref<number>(store.currentUser.balance)
const currentBalance = ref<number>(startingBalance.value)
const loading = ref(true)
const shopOpen = ref(false)

const router = useRouter()
let gameName = router.currentRoute.value.query.gameName as string
console.log(gameName)
gameName = gameName.replace('NLC', '')
const token = ref()
token.value = store.access_token
console.log(token.value)
function handleMessageFromIframe(event: any) {
  const message: any = destr(event.data)

  if (message.type === 'nolimit_decrement_crystals') {
    frameShow.value = true
    if (message.data.success === false) {
      frameShow.value = false

      if (
        currentUser.cashtag !== '' &&
        currentUser.cashtag !== undefined &&
        currentUser.cashtag !== null
      ) {
        eventBus.emit('noMoney', message.data.message)
      } else {
        console.log('opening shop')
        shopOpen.value = true
        eventBus.emit('shopOpen', true)
      }
    }
  }
  eventBus.emit('decrementBalance', Number.parseFloat(message.val) * 100)
  eventBus.emit('startExpStarAnimation', 'start')
}
function handleMessageFromIframe2(event: any) {
  // console.log(event.data.payload)
  // console.log(destr(event.data.payload))
}

function handleIframeLoad() {
  // console.log('iframe load')
  // console.log(gameFrameRef.value)
  if (gameFrameRef.value) {
    window.addEventListener('*', handleMessageFromIframe)
    gameFrameRef.value.addEventListener('*', handleMessageFromIframe2)
    window.addEventListener('message', handleMessageFromIframe)
    gameFrameRef.value.addEventListener('message', handleMessageFromIframe2)
    // frameShow.value = true
    loading.value = false
    showGameBar.value = true
    gameFrameRef.value.addEventListener = (ev: any) => {
      console.info(ev)
    }
  }
}
onBeforeUnmount(() => {
  if (gameFrameRef.value) {
    // Safely remove the iframe element from the DOM
    gameFrameRef.value.remove()
    // Optionally, clear the reference
    // gameFrameRef.value = null
  }
})
onMounted(() => {
  frameShow.value = false
})
</script>

<template>
  <iframe
    v-show="frameShow"
    id="nolimit-game-target"
    ref="gameFrameRef"
    style="position: fixed; top: 0; left: 0; width: 100vw; overflow: hidden"
    frameborder="0"
    :style="frameShow ? 'height: 100vh' : 'height: 0'"
    allowfullscreen="false"
    allow="autoplay; "
    sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
    name="nolimit-game-target"
    :src="`https://api.cashflowcasino.com/games/nolimit/index.html?token=${token}&api_exit=https://mobile.cashflowcasino.com&gameName=${gameName}`"
    @load="handleIframeLoad"
  />
  <div
    v-if="showGameBar"
    style="position: fixed; top: 0px; left: 0; width: 100vw; height: 5vh; z-index: 990"
  >
    <GameTopBar
      :current-balance
      developer="nolimit"
      style="position: fixed; top: 0; left: 0; z-index: 999; width: 100vw; height: 80px"
    />
    <div
      class="fixed bottom-0 w-full"
      style="
        background-image: url(/images/bottomdark.avif);
        background-size: contain;
        height: 35px;
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 999;
        width: 100vw;
      "
    />
  </div>

  <ShopView v-if="shopOpen" />
</template>
