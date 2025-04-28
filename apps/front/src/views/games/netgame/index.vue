<script lang="ts" setup>
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { useUserStore } from '@/stores/user'

const router = useRouter()
// console.log(router.currentRoute.value.query.gameName)
const loading = ref(true)
const userStore = useUserStore()
const gameFrameRef = ref<any>(null)
const frameShow = ref<boolean>(false)
const showGameBar = ref<boolean>(false)
const startingBalance = ref<number>(userStore.currentUser.balance)
const currentBalance = ref<number>(startingBalance.value)
const gameName = router.currentRoute.value.query.gameName
const token = localStorage.getItem('access_token')
const { orientation } = useScreenOrientation()

watch(orientation, async (newOrienation) => {
  console.log(newOrienation)
  // if(newOrientation === 'landscape-primary' || newOrientation === 'landscape-secondary') {

  // }
})

function handleMessageFromIframe() {
  // console.log(event.data.payload)
  // console.log(destr(event.data.payload))
}
function handleMessageFromIframe2() {
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

// function ResizeHandler() {
//   let frm = document.getElementById('game')
//   if (frm !== null)
// { frm.style.height = `${window.innerHeight}px` }
// }
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
    <!--
      :src="`https://api.cashflowcasino.com/games/${gameName}/index.html?token=${token}&api_exit=https://mobile.cashflowcasino.com/home`"
    -->
    <iframe ref="gameFrameRef" class="myFrame"
      :src="`https://api.cashflowcasino.com/games/${gameName}/index.html?token=${token}&api_exit=https://mobile.cashflowcasino.com/home`"
      :style="{ height: frameShow ? 'calc(100vh)' : '0px', position: 'fixed' }"
      style="width: 100vw; bottom: 0; left: 0; position: 'fixed'; border-width: 0px !important" allowfullscreen="false"
      @load="handleIframeLoad" />
    <div v-if="showGameBar" style="position: absolute; top: 0px; left: 0; width: 100vw; height: 5vh; z-index: 990">
      <GameTopBar v-if="orientation === 'portrait-primary'" developer="netgame" :current-balance />
      <LeftTest v-else developer="netgame" :current-balance />
    </div>
  </div>
  <div v-if="loading" class="relative flex flex-col items-center justify-center"
    style="min-width: 100vw; min-height: 100vh">
    <!-- <FallingStarsBg class="bg-white dark:bg-black" color="#FFF" style="min-width: 100vw; min-height: 100vh" /> -->
    <div class="z-[1] flex items-center">
      <!-- <span class="text-6xl font-bold text-black dark:text-white">Inspira UI</span> -->
    </div>
  </div>
</template>
