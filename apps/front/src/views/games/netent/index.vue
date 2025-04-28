<script lang="ts" setup>
const router = useRouter()
// console.log(router.currentRoute.value.query.gameName)
const loading = ref(true)
const gameFrameRef = ref<any>(null)
const frameShow = ref<boolean>(false)
const showGameBar = ref<boolean>(false)
// const startingBalance = ref<number>(state.value.currentBalance)
// const currentBalance = ref<number>(startingBalance.value)
const gameName = router.currentRoute.value.query.gameName
const token = localStorage.getItem('laravel_session')
function handleMessageFromIframe(event: any) {
  // console.log(event.data.payload)
  // console.log(destr(event.data.payload))
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
    frameShow.value = true
    loading.value = false
    showGameBar.value = true
    gameFrameRef.value.addEventListener = (ev: any) => {
      console.info(ev)
    }
  }
}

function ResizeHandler() {
  const frm = document.getElementById('game')
  if (frm !== null) {
    frm.style.height = `${window.innerHeight}px`
  }
}
onBeforeUnmount(() => {
  window.removeEventListener('*', handleMessageFromIframe)
  window.removeEventListener('*', handleMessageFromIframe2)
  gameFrameRef.value.removeEventListener('*', handleMessageFromIframe)
  gameFrameRef.value.removeEventListener('*', handleMessageFromIframe2)
})
onBeforeMount(async () => {
  // await ScreenOrientation.lock({ orientation: 'landscape' })
})
</script>

<template>
  <div v-show="!loading" style="color: white">
    <!-- <iframe
      id="game"
      style="margin: 0px; border: 0px; width: 100%; height: 100vh"
      :src="`https://php.cashflowcasino.com/games/${gameName}/games/fortunerangers-client/game/fortunerangers-client.xhtml?flashParams.bgcolor=000000&gameId=fortunerangers_not_mobile&mobileParams.lobbyURL=&server=/game/${gameName}/server&lang=en&sessId=DEMO-3901711636-EUR&operatorId=netent`"
      allowfullscreen
    > -->
    <!-- <iframe
      id="game"
      style="margin: 0px; border: 0px; width: 100vw; height: 100vh"
      :src="`https://php.cashflowcasino.com/game/${gameName}/index.html?token=${token}&output=embed`"
      allowfullscreen
    ></iframe> -->
    <iframe ref="gameFrameRef" class="myFrame"
      :src="`https://api.cashflowcasino.com/games/${gameName}/index.html?token=${token}&api_exit=https://mobile.cashflowcasino.com`"
      :style="{ height: frameShow ? 'calc(100vh - 45px)' : '0px', position: 'fixed' }"
      style="width: 100vw; bottom: 0; border-width: 0px !important" allowfullscreen @load="handleIframeLoad" />
    <div v-if="showGameBar" style="position: absolute; top: 0px; left: 0; width: 100vw; height: 5vh; z-index: 990">
      <GameTopBar :current-balance
        style="position: absolute; top: 0; left: 0; z-index: 999; width: 100vw; height: 80px" />
    </div>
  </div>
  <div v-if="loading" class="relative flex flex-col items-center justify-center"
    style="min-width: 100vw; min-height: 100vh">
    <FallingStarsBg class="bg-white dark:bg-black" color="#FFF" style="min-width: 100vw; min-height: 100vh" />
    <div class="z-[1] flex items-center">
      <!-- <span class="text-6xl font-bold text-black dark:text-white">Inspira UI</span> -->
    </div>
  </div>
</template>
