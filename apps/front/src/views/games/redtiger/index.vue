<script lang="ts" setup>
import GameTopBar from '@/components/bars/GameTopBar.vue'
import { eventBus } from '@/composables/eventBus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const currentUser = userStore.currentUser
const router = useRouter()
const frameShow = ref<boolean>(false)
const balanceStream = ref('0')
const gameName = router.currentRoute.value.query.gameName
const showGameBar = ref<boolean>(false)
const token = ref()
const { width } = useWindowSize()
const mobileHeight = ref<number | undefined>(0)
const gameFrameRef = ref<any>(null)
const currentStake = ref<number>(200)
const currentWinAmount = ref<number>(0)
const rtp = ref<number>(0)
const currentBalance = currentUser.balance

const mobileWidth = computed(() => {
  return width.value
})

function handleIframeLoad() {
  if (gameFrameRef.value) {
    window.addEventListener('message', handleMessageFromIframe)
    frameShow.value = true
    gameFrameRef.value.addEventListener = (ev: any) => {
      console.info(ev)
    }
  }
}

function handleMessageFromIframe(event: any) {
  if (event.data.type && event.data.type.includes('animation')) {
    return
  }
  if (event.data.type === undefined) {
    return
  }
  if (event.data.type === 'gameStarted') {
    showGameBar.value = true
    balanceStream.value = `${currentBalance.value.toString()}-`
  }
  if (event.data.url === 'bluesite:exit') {
    router.push({ name: 'Dashboard' })
  }
  if (event.data.type === 'stakeChanged') {
    currentStake.value = event.data.payload.value * 100
  }
  if (event.data.type === 'winChange') {
    currentWinAmount.value = event.data.payload.total * 100
  }
  if (event.data.type === 'playStart') {
    currentBalance.value = currentBalance.value - currentStake.value
    balanceStream.value = balanceStream.value + ' ' + currentBalance.value.toString()
    eventBus.emit('updateBalanceSpinCost', currentBalance.value)
  }
  if (event.data.type === 'netPositionChanged') {
    if (event.data.payload.value !== currentStake.value * 100 * -1) {
      const balance = userStore.currentUser.balance
      currentBalance.value = balance
      balanceStream.value = balanceStream.value + ' ' + currentBalance.value.toString()
      eventBus.emit('updateBalanceWin', balance)
    }
  }
}

function handleResize() {
  mobileHeight.value = window.innerHeight
}

onMounted(async () => {
  token.value = localStorage.getItem('access_token')
    (window as any).token = token.value
  const t = token.value
  gameFrameRef.value.src = `https://api.cashflowcasino.com/games/${gameName}?token=${t}&gameName=${gameName}&userId=${store.currentUser.id}`
  window.addEventListener('resize', handleResize)
  mobileHeight.value = window.innerHeight
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  setTimeout(() => {
    if (mobileWidth.value < 600) {
    }
  }, 300)
})
onBeforeUnmount(() => {
  if (gameFrameRef.value) {
    gameFrameRef.value.remove()
    gameFrameRef.value = null
  }
})
</script>

<template>
  <div>
    <iframe ref="gameFrameRef" class="myFrame"
      :style="{ height: frameShow ? `${mobileHeight}px` : '0px', position: 'fixed' }" @load="handleIframeLoad" />
    <div v-if="showGameBar" class="flex flex-col"
      style="position: absolute; top: 0px; left: 0; width: 100vw; height: 5vh; z-index: 990">
      <GameTopBar :current-balance developer="redtiger"
        style="position: absolute; top: 0; left: 0; z-index: 999; width: 100vw; height: 80px" />
      <div class="fixed bottom-0 w-full" style="
          background-image: url(/images/bottomdark.avif);
          background-size: contain;
          height: 27px;
          position: fixed;
          bottom: 0;
          left: 0;
          z-index: 999;
          width: 100vw;
        " />
      <div style="
          border-radius: 30%;
          background-color: transparent;
          height: 6vh;
          position: fixed;
          bottom: 9%;
          right: 12%;
          z-index: 999;
          width: 24vw;
        " />
      <div style="
          background-color: transparent;
          position: fixed;
          bottom: 1%;
          right: 1%;
          z-index: 999;
          width: 24vw;
          color: white;
          font-size: 1.5rem;
          text-align: center;
          font-weight: bold;
        ">rtp: {{ rtp }}</div>
    </div>
  </div>
</template>

<style scoped>
  .myFrame {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    z-index: 99;
  }

  .game-body {
    width: 100%;
    height: 100vh;

    .game-frame-body {
      width: 95%;
      margin: auto;

      .home-game-frame-area {
        background: #15161c;
        border: none;
        z-index: 2;
        margin-top: 20px;
        width: 100vw;
        height: 100vh;
        border-radius: 16px;
        box-shadow:
          0px 2px 4px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)),
          0px 4px 5px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)),
          0px 1px 10px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12));
      }
    }
  }

  .m-game-frame-body {
    .home-game-frame-area {
      background: #15161c;
      position: absolute;
      top: 0px;
      border: none;
      width: 100%;
      opacity: 1;
      z-index: 20000000;
      overflow: unset;
    }

    .m-loading-container {
      position: fixed;
      top: 0px;
      border: none;
      width: 100%;
      height: 100vh;
      opacity: 1;
      z-index: 20000000;
      background: #15161c;
    }
  }
</style>
