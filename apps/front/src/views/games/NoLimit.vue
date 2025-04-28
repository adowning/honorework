<template>
  <GameLayout>
    <Teleport to="body">
      <iframe class="sse-div h-0 w-0" :src="url" />
    </Teleport>
    <iframe
      v-show="frameShow"
      id="nolimit-game-target"
      ref="gameFrameRef"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden"
      frameborder="0"
      allowfullscreen="true"
      allow="autoplay; fullscreen"
      sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
      name="nolimit-game-target"
      :src="`https://api.cashflowcasino.com/games/nolimit/index.html?token=${token}&api_exit=https://mobile.cashflowcasino.com&gameName=${gameName}`"
      @load="handleIframeLoad"
      allowfullScreen
    />
    <!-- <div v-if="showGameBar" style="position: fixed; top: 0px; left: 0; width: 100vw; height: 5vh; z-index: 990"> -->
    <!-- <GameTopBar :current-balance developer="nolimit"
        style="position: fixed; top: 0; left: 0; z-index: 999; width: 100vw; height: 80px" /> -->
    <!-- {{ currentUser.name }} -->
    <div
      v-if="currentUser.name != 'ash' && currentUser.name != 'admin'"
      class="fixed bottom-0 w-full"
      style="
        background-image: url(/images/bottomdark.avif);
        background-size: contain;
        height: 30px;
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 999;
        width: 100vw;
      "
    />
    <!-- <ExpStars /> -->
    <!-- </div> -->
    <ShopView v-if="shopOpen" />
    <GlobalLoading v-if="isLoading" />
  </GameLayout>
</template>

<script setup lang="ts">
import { useWebSockets } from '@/composables'
import { eventBus } from '@/composables/eventBus'
import GameLayout from '@/layouts/GameLayout.vue'
import { useUserStore } from '@/stores/user'
import destr from 'destr'

const userStore = useUserStore()
const { startLoading, stopLoading, isLoading } = useLoading()
const currentUser = userStore.currentUser
const gameFrameRef = ref<any>(null)
const frameShow = ref<boolean>(false)
const showGameBar = ref<boolean>(false)
const loading = ref(true)
const shopOpen = ref(false)
var url = `https://realtime.ably.io/event-stream?channels=${currentUser.activeProfileId}&v=1.2&key=nfET_A.QjvYvA:FPKPdLUkzdvRZHNc`
watch(userStore.currentUser, (newuser) => {
  console.log(newuser)
})
const router = useRouter()
let gameName = router.currentRoute.value.query.gameName as string
gameName = gameName.replace('NLC', '')
const token = ref()
token.value = userStore.token
function handleMessageFromIframe(event: any) {
  const message: any = destr(event.data)
  let d: any = destr(event.data)
  if (d !== undefined)
    if (d.event === 'balance') {
      stopLoading()
    }
  if (message.type === 'nolimit_decrement_crystals') {
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

function handleIframeLoad() {
  if (gameFrameRef.value) {
    window.addEventListener('*', handleMessageFromIframe)
    window.addEventListener('message', handleMessageFromIframe)
    frameShow.value = true
    loading.value = false
    showGameBar.value = true
    gameFrameRef.value.addEventListener = (ev: any) => {
      console.info(ev)
    }
  }
}
const { status, data, close } = useEventSource(url, [], {
  autoReconnect: {
    retries: 3,
    delay: 1000,
    onFailed() {
      alert('Failed to connect EventSource after 3 retries')
    },
  },
})
console.log(data)
watch(data, (newData) => {
  console.log(newData)
})
watch(status, (currentStatus) => {
  console.log(currentStatus)
})
onMounted(async () => {
  startLoading()
  console.log('mounted')
  const channel = await userStore.startSubscription()
  console.log(channel.state)

  // const channel = await store.startSubscription()
  // console.log(channel.state)
})

onBeforeUnmount(() => {
  if (gameFrameRef.value) {
    gameFrameRef.value.remove()
  }
  close()
})
</script>
