<script setup lang="ts">
import { useFullscreen } from '@vueuse/core'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import nolimit from './nolimit.js'

const store = useStore()
const pageMounted = ref(false)
const router = useRouter()
let gameName = router.currentRoute.value.query.gameName as string
gameName = gameName?.replace('NLC', '')
// console.log(gameName)
// const myIframe = ref<InstanceType<typeof HTMLIFrameElement>>()
const loaded = ref(false)
const route = useRoute()
const { isFullscreen } = useFullscreen()
const showUI = ref(false)
const isConvertDialogVisible = ref(false)
const currentUser = store.currentUser
let coinsbalanceAtStart: number = 0

async function updateRemoteUser(_params: any) {
  // console.log(_params)
}
async function updateConversion(amt: number) {
  // console.log('dsfjdsfklj', amt)
  // console.log(currentUser.id)
  await updateRemoteUser('coins,crystals')
}

watch(isFullscreen, (val) => {
  if (val) {
    // console.log(val)
    if (val) {
      loaded.value = true
      showUI.value = false
      setTimeout(() => {
        showUI.value = true
        loaded.value = true
      }, 300)
    }
  } else {
    showUI.value = false
    setTimeout(() => {
      showUI.value = true
    }, 300)
  }
})
const loading = ref(true)
// @ts-ignore
const title = ref(route.query.title?.replace('NLC', ''))
//   const data = { userId: user.value.id }
//   myIframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
// }

// function onIframeClick() {
//   //console.log('wd')
// }
let lastBalance: number = 0
let newBalance: number = 0
let sessionTotalWin: number = 0

function openConvert() {
  isConvertDialogVisible.value = !isConvertDialogVisible.value
}
function loadData(_data: any) {
  // console.log(_data)
  const game = nolimit.load(_data)
  // console.log(game)
  game.on('exit', () => {
    if (sessionStorage.getItem('demo.username') != null) {
      parent.location.href = '/operator/'
    } else {
      parent.location.href = '/'
    }
  })

  game.on('ready', (x: any) => {
    // console.log(options.game, options.device, 'is loaded')
    // console.log(x)
    // //console.log(window.axios)
    // const iframes = document.querySelectorAll('iframe')
    // iframes[0].contentWindow.axios = window.axios
    // //console.log(iframes[0])
    // const tbl = window.document.querySelector('top-bar-left')
    // //console.log(tbl)
    const gameIframeDiv = document.getElementById('game')
    // console.log(gameIframeDiv)
    window.parent.postMessage(JSON.stringify({ event: 'ready' }), '*')
  })
  game.on('*', (x: any) => {
    // console.log('some message', x)
    //  window.postMessage('game_message', x)
    window.parent.postMessage(JSON.stringify({ event: 'message' }), '*')
  })
  game.on('message', (x: any) => {
    // console.log('some messagex')
    window.postMessage('game_message', x)
    window.parent.postMessage(JSON.stringify({ event: 'message' }), '*')
  })
  game.on('balance', (balance: any) => {
    loading.value = false

    // console.log('some balance', balance)
    // window.parent.postMessage(JSON.stringify({ event: 'balance', data: balance }), '*')
    const incomingBalance = Number.parseFloat(Number.parseFloat(balance.toString()).toFixed(2))
    // console.log(incomingBalance)

    // console.log(lastBalance)
    if (lastBalance === incomingBalance) {
      // console.log('nothing')
      return
    }
    const win = incomingBalance > lastBalance
    // console.log('incoming ', incomingBalance, 'last ', lastBalance)
    if (lastBalance === incomingBalance) {
      // console.log('not updating topbar')
      lastBalance = incomingBalance
      return
    }
    if (win) {
      // sessionTotalWin = incomingBalance - 10000
      const delta = incomingBalance - lastBalance
      // //console.log('delta ', delta)
      // //console.log('stw1 ', sessionTotalWin)
      // console.log(Number.parseFloat(Number.parseFloat(delta.toString()).toFixed(2)))

      sessionTotalWin += Number.parseFloat(Number.parseFloat(delta.toString()).toFixed(2))
      // console.log('stw2 ', sessionTotalWin)

      newBalance += Number.parseFloat(Number.parseFloat(delta.toString()).toFixed(2))
      eventBus.emit('updateUser', {
        data: {
          coins:
            coinsbalanceAtStart + Number.parseFloat(Number.parseFloat(delta.toString()).toFixed(2))
        }
      })
    }
    if (lastBalance > incomingBalance) {
      const delta = lastBalance - incomingBalance
      newBalance -= Number.parseFloat(Number.parseFloat(delta.toString()).toFixed(2))
      eventBus.emit('updateUser', {
        data: { crystals: newBalance }
      })
    }
    lastBalance = incomingBalance
  })
}
onMounted(async () => {
  // const setBaseHref = (newBase) => {
  //   // For regular Vue 3 applications
  //   // document.querySelector('base').href = newBase
  // }

  // Example usage:
  // setBaseHref('https://slots.andrewscarpetcleaning.com/')

  pageMounted.value = true

  coinsbalanceAtStart = store.currentUser.balance
  // const plugin = document.createElement('script')
  // plugin.setAttribute(
  //   "src",
  //   "//api.myplugincom/widget/mykey.js"
  // );
  // plugin.async = true;
  // document.head.appendChild(plugin);
  ;(window as any).userId = currentUser.id
  const options: any = {}
  options.target = 'game'
  const query = window.location.search.substring(1)
  const pairs = query.split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    options[pair[0]] = decodeURIComponent(pair[1])
    // console.log(pair)
  }
  options.hideExitButton = true
  options.showExitButtonDesktop = true
  // console.log(title.value)
  options.game = gameName
  options.device = options.device || 'mobile'
  options.playForFunCurrency = 'USD'
  const extra = ''

  // console.log(`Token: ${options.token}`)
  // console.log(`Options: ${options}`)
  options.fullscreen = false
  let data: any = {}
  if (sessionStorage.getItem('demo.username') != null && options.token) {
    data = {
      operator: 'HOMEPAGE_RESTRICTED',
      environment: 'demo',
      game: options.game,
      device: options.device,
      fullscreen: options.fullscreen,
      extra,
      quality: 'high'
    }
  } else {
    data = {
      operator: 'HOMEPAGE_PUBLIC',
      environment: 'demo',
      game: options.game,
      fullscreen: options.fullscreen,
      device: options.device,
      extra,
      quality: 'high'
    }
  }
  if (options.token) {
    data.token = options.token
    data.demo = options.demo
  }
  // console.log(nolimit)
  // game.axios = window.axios

  // window.onmessage = function (e) {
  //   // //console.log(e)
  //   loaded.value = true
  // }
  loadData(data)
})
onBeforeUnmount(() => {
  for (let x = 0; x < 5; x++) {
    const youtubeDiv = document.querySelector('iframe[name*="Nolimit"]')
    youtubeDiv?.remove()
  }
  pageMounted.value = false
})
</script>

<template>
  <div v-if="title !== undefined">
    <div
      style="
        display: inline-block;
        width: auto;
        margin: 0 auto;
        position: relative;
        border: 0px solid black;
        border-radius: 10px;
      "
    >
      <div
        id="scaleContainer"
        style="
          background: black;
          box-shadow: rgb(51, 51, 51) 0px 5px 50px;
          transform-origin: left top;
        "
      >
        <!-- Expected Canvas Dimensions -->
        <div
          id="gameCanvas"
          width="480"
          height="720"
          class="container"
          tabindex="99"
          style="
            text-align: center;
            aspect-ratio: auto 480 / 720;
            outline: none;
            -webkit-user-select: none;
            user-select: none;
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
          "
        >
          <div v-if="!loading" id="gamewrapper" class="gamewrapper">
            <div v-if="pageMounted" id="game" class="game" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading">
      loading ...
      <!-- <Loading /> -->
    </div>
    <TopBar
      v-if="loaded"
      :player="currentUser"
      style="z-index: 9999; position: absolute; top: 0px; left: 0px; right: 0px; w-100"
      @show-convert="openConvert"
    />
  </div>
  <!-- <ConverCoinsDialog
    v-if="isConvertDialogVisible && isConvertDialogVisible !== undefined"
    v-model:is-convert-dialog-visible="isConvertDialogVisible"
    :coins="state.activeProfile.balance!"
    @conversionupdate="updateConversion"
  /> -->
</template>
