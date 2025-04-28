<template>
  <div ref="pixiContainer" id="pixiContainer"></div>
  <ComponentLastWinners
    :winners="winners"
    @close="HandleCloseWinList"
    @close-modal="HandleCloseModal"
    v-if="showWinList"
  ></ComponentLastWinners>
</template>

<script setup>
import ComponentLastWinners from '@/Components/LandingSpin/LastWinners.vue'
import * as PIXI from 'pixi.js'
import { Howl, Howler } from 'howler'
import TweenMax from 'gsap/TweenMax'
import HttpApi from '@/Services/HttpApi.js'
import { useSpinStoreData } from '@/Stores/SpinStoreData'
import { reactive, ref, computed, watch, onMounted } from 'vue'

// Data
const app = ref(null)
const pixiWidth = ref(420)
const pixiHeight = ref(633)
const radius = ref(0)
const numberOfSectors = ref(20)
const radiansPerSector = ref(0.39)
const premioPositions = reactive([
  0, 0.39, 0.79, 1.18, 1.57, 1.96, 2.35, 2.74, 3.14, 3.526, 3.92, 4.32, 4.71, 5.1,
  5.489999999999999, 5.880000000000001, 6.280000000000001,
])
const positionsReverse = reactive([])
const wheelPrizes = reactive({})
const spinVelocityStart = ref(0.5)
const spinVelocity = ref(0)
const spinning = ref(false)
const wheel = reactive(new PIXI.Container())
const pixiIsLoading = ref(true)
const pixiLoadingProgress = ref(0)
const pixiLoader = reactive(PIXI.loader)
const centerContainer = reactive(new PIXI.Container())
const stopSpinningInterval = ref(null)
const spinPoint = ref(null)
const lightTurn = ref(false)
const buttonSprite = ref(null)
const buttonSpriteScale = ref(0.383)
const circle = ref(null)
const circleSprite = ref(null)
const circleSpriteLight = ref(null)
const textContainer = reactive(new PIXI.Container())
const selectedPrize = ref(null)
const sounds = reactive(
  new Howl({
    src: ['/assets/sounds/spin/b8fb8ba1.mp3'],
    volume: 1,
    sprite: {
      rooling: [2400, 2000, true],
      stopping: [100, 1700],
      winner: [5900, 3700],
    },
  }),
)
const prize = ref(null)
const spinStoreData = reactive(useSpinStoreData())

// Props
const props = defineProps(['showWinList', 'winners'])

// Computed

// Methods
const startSpinning = async function () {
  sounds.play('rooling')
  spinVelocity.value = 0.01
  const vm = this
  stopSpinningInterval.value = setInterval(() => {
    if (vm.spinVelocity < vm.spinVelocityStart) {
      vm.spinVelocity += 0.01
    } else {
      vm.spinVelocity = vm.spinVelocityStart
      clearInterval(vm.stopSpinningInterval)
    }
  }, 100)
  app.value.ticker.add(spinUpdate)

  await HttpApi.post('spin/result?sessionId=1', {
    action: 'start',
  }).then((resp) => {
    vm.selectedPrize = resp.data.data.index
    vm.spinStoreData.set(resp.data)
    setTimeout(() => {
      sounds.stop()
      vm.sounds.play('stopping')
      setTimeout(() => {
        vm.stopSpinning()
      }, 1000)
    }, 2000)
  })
}

const spinUpdate = function (delta) {
  if (spinVelocity.value > 0) {
    wheel.rotation += spinVelocity.value * delta
    if (wheel.rotation >= 6.28) {
      wheel.rotation = 0
    }
  } else {
    clearInterval(stopSpinningInterval.value)
    finalPosition()
  }
}

const calculateTargetRotation = function (resultIndex) {
  const validIndex = Math.max(0, Math.min(resultIndex, premioPositions.length - 1))
  return positionsReverse[validIndex]
}

const handleWinnerEffects = function () {
  sounds.stop()

  spinPoint.value.scale.set(0.43)
  spinning.value = false
  sounds.play('winner')
  const vm = this
  TweenMax.to(spinPoint.value.scale, 1, {
    x: 0.45,
    y: 0.45,
    yoyo: true,
    ease: Elastic.easeOut.config(1, 0.3),
    onComplete: () => {
      const pz = wheelPrizes[selectedPrize.value]
      buttonSprite.value.tint = 0xffffff
      spinning.value = false
      this.$emit('prized', pz)
    },
  })
}

const normalizeRotation = function (rotation) {
  const twoPI = 2 * Math.PI
  return ((rotation % twoPI) + twoPI) % twoPI
}

const finalPosition = function () {
  app.value.ticker.remove(spinUpdate)

  const currentRotation = normalizeRotation(wheel.rotation)
  const targetRotation = calculateTargetRotation(selectedPrize.value)

  TweenMax.to(wheel, 2, {
    rotation: `+=${targetRotation - currentRotation}`,
    ease: Elastic.easeOut.config(1, 0.3),
    onComplete: () => {
      handleWinnerEffects()
    },
  })
}

const stopSpinning = function () {
  clearInterval(stopSpinningInterval.value)
  spinVelocity.value = 0
}

const animatePoint = function () {}

const rotateLightsImage = function () {
  if (lightTurn.value) {
    circleSpriteLight.value.rotation = Math.PI * 2
  } else {
    circleSpriteLight.value.rotation = (Math.PI / 180) * 22
  }

  lightTurn.value = !lightTurn.value
}

const startRotation = function () {
  const vm = this
  setInterval(() => {
    rotateLightsImage()
  }, 1000)
}

const formatNumber = function (num, size) {
  if (!size) {
    size = 6
  }
  num = num.toString()
  if (
    (num.length > size && num.indexOf('.') < 0) ||
    (num.length + 1 > size && num.indexOf('.') >= 0)
  ) {
    //num.splice()
  } else {
    const arr = num.split('.')
    size = size - arr[0].length
    num = Number(num).toFixed(size)
  }
  return num
}

const createSectorText = function (sectorNum, icon) {
  const prizeIcon = icon
  prizeIcon.width = prizeIcon.height = 24
  prizeIcon.anchor.set(1)
  prizeIcon.x = 61
  prizeIcon.y = 12
  const text = new PIXI.Text(Number(wheelPrizes[sectorNum].value).toFixed(2).replace('.', ','), {
    fill: '#FFF',
    fontSize: 16,
  })

  const rotation = premioPositions[sectorNum]
  const textAnchorPercentage = (radius.value - 40 / 2) / radius.value

  text.anchor.set(0.5, 0.5)
  text.rotation = rotation + Math.PI

  text.position.x = 200 + radius.value * 0.41 * Math.cos(rotation)

  text.position.y = 200 + radius.value * 0.41 * Math.sin(rotation)

  text.scale.set(text.scale.x * -1, text.scale.y * -1)

  text.addChild(prizeIcon)

  textContainer.addChild(text)
}

const HandleCloseWinList = function () {
  this.$emit('hide-win-list')
}

const HandleCloseModal = function () {
  this.$emit('close-modal')
}

const OpenWinList = function () {
  props.showWinList = true
}

const GetWheelPrizes = async function () {
  const vm = this
  await HttpApi.get('spin/prizes?sessionId=3', {
    action: 'get-winners',
  }).then((resp) => {
    vm.wheelPrizes = resp.data

    BuildWheel()
  })
}

const BuildWheel = function () {
  radius.value = pixiWidth.value / 2
  app.value = new PIXI.Application({
    width: pixiWidth.value,
    height: pixiHeight.value,
    antialias: true,
    transparent: true,
    resolution: 1,
  })
  pixiLoader.add('spinPoint', '/assets/images/spin/spin-point.png')
  pixiLoader.add('spinBtn', '/assets/images/spin/spin-btn.png')
  pixiLoader.add('spinBackground', '/assets/images/spin/spin-background.png')
  pixiLoader.add('spinLight', '/assets/images/spin/spin-light.png')
  pixiLoader.add('spinHand', '/assets/images/spin/spin-hand.png')
  pixiLoader.add('spinHead', '/assets/images/spin/spin-head.png')
  pixiLoader.add('spinIcon_brl', '/assets/images/spin/spin-icon-brl.png')

  const vm = this

  pixiLoader.load((loader, resources) => {
    vm.spinPoint = new PIXI.Sprite.from(resources.spinPoint.texture)
    vm.buttonSprite = new PIXI.Sprite.from(resources.spinBtn.texture)
    vm.circleSprite = new PIXI.Sprite.from(resources.spinBackground.texture)
    vm.circleSpriteLight = new PIXI.Sprite.from(resources.spinLight.texture)

    vm.positionsReverse = vm.premioPositions.slice()
    vm.positionsReverse.reverse()

    vm.$refs.pixiContainer.appendChild(vm.app.view)

    vm.circle = new PIXI.Graphics()

    const wPositionX = vm.radius + 10
    const wPositionY = 633 - vm.pixiWidth

    vm.wheel.pivot.set(vm.pixiWidth / 2, vm.pixiHeight / 2)
    vm.wheel.position.set(vm.radius, vm.pixiHeight / 2)
    vm.centerContainer.addChild(vm.wheel)
    vm.centerContainer.width = vm.centerContainer.height = 400
    vm.centerContainer.position.set(wPositionY, wPositionX)
    vm.centerContainer.fill = vm.centerContainer.x = vm.app.screen.width / 2
    vm.centerContainer.y = vm.app.screen.height / 2
    window.wheel = vm.wheel

    for (let sector = 0; sector <= vm.numberOfSectors; sector++) {
      if (wheelPrizes[sector]) {
        vm.createSectorText(
          sector,
          new PIXI.Sprite.from(
            resources['spinIcon_'.concat(wheelPrizes[sector].currency.toLowerCase())].texture,
          ),
        )
      }
    }

    const textOptions = {
      fontFamily:
        'Inter,-apple-system,Framedcn,Helvetica Neue,Condensed,DisplayRegular,Helvetica,Arial,PingFang SC,Hiragino Sans GB,WenQuanYi Micro Hei,Microsoft Yahei,sans-serif',
      fill: '#cfbbf3',
      align: 'center',
      stroke: '#34495e',
      strokeThickness: 1,
      lineJoin: 'lineJoin',
      fontSize: 60,
      fontWeight: '900',
    }
    const topText = new PIXI.Text('GIRE E GANHE', textOptions)
    const topTextAmount = new PIXI.Text('R$100 mil', {
      ...textOptions,
      dropShadow: true,
      dropShadowAlpha: 0.8,
      dropShadowAngle: 1.5,
      dropShadowBlur: 3,
      dropShadowColor: '#ae731e',
      dropShadowDistance: 4,
      fill: ['#ffda66', '#ffb118'],
      fontSize: 80,
    })
    topText.position.set(110)
    topText.scale.set(1.25)
    topTextAmount.position.set(210, 190)
    const topImage = new PIXI.Sprite.from(resources.spinHead.texture)
    topImage.position.y = -11
    topImage.addChild(topText)
    topImage.addChild(topTextAmount)
    topImage.scale.set(0.52)
    window.topText = topText
    window.topTextAmount = topTextAmount
    window.topImage = topImage

    vm.circleSprite.anchor.set(0.5)
    vm.circleSprite.x = vm.app.screen.width / 2
    vm.circleSprite.y = vm.app.screen.height / 2
    vm.circleSprite.scale.set(0.4834)

    vm.circleSpriteLight.anchor.set(0.5)
    vm.circleSprite.addChild(vm.circleSpriteLight)

    vm.textContainer.position.set(10, 115)

    window.textContainer = vm.textContainer

    vm.wheel.addChild(vm.circleSprite)
    vm.wheel.addChild(vm.textContainer)

    vm.buttonSprite.anchor.set(0.5)
    vm.buttonSprite.position.set(vm.circleSprite.x, vm.circleSprite.y)
    vm.buttonSprite.scale.set(vm.buttonSpriteScale)
    vm.buttonSprite.x = vm.buttonSprite.y = 0
    vm.buttonSprite.interactive = true
    vm.buttonSprite.buttonMode = true
    vm.buttonSprite.eventMode = 'static'
    vm.buttonSprite.cursor = 'pointer'

    vm.centerContainer.addChild(vm.spinPoint)
    vm.spinPoint.anchor.set(0)
    vm.spinPoint.scale.set(0.45)
    vm.spinPoint.x = 47
    vm.spinPoint.y = -41

    vm.buttonSprite
      .on('pointerover', () => {
        if (!vm.spinning) {
          TweenMax.to(vm.buttonSprite.scale, 2, {
            x: vm.buttonSpriteScale + 0.05,
            y: vm.buttonSpriteScale + 0.05,
            yoyo: true,
            ease: Elastic.easeOut.config(1, 0.3),
          })
        }
      })
      .on('pointerout', () => {
        if (!vm.spinning) {
          TweenMax.to(vm.buttonSprite.scale, 2, {
            x: vm.buttonSpriteScale,
            y: vm.buttonSpriteScale,
            yoyo: true,
            ease: Elastic.easeOut.config(1, 0.3),
          })
        }
      })
      .on('pointertap', () => {
        if (!vm.spinning) {
          vm.buttonSprite.tint = 0xc9c9c9
          vm.buttonSprite.scale.set(vm.buttonSpriteScale - 0.04)
          setTimeout(() => {
            TweenMax.to(vm.buttonSprite.scale, 2, {
              x: vm.buttonSpriteScale,
              y: vm.buttonSpriteScale,
              yoyo: true,
              ease: Elastic.easeOut.config(1, 0.3),
            })
          }, 50)
          vm.spinning = true
          vm.startSpinning()
        }
      })

    vm.centerContainer.addChild(vm.buttonSprite)
    vm.app.stage.addChild(topImage)
    vm.app.stage.addChild(vm.wheel)
    vm.app.stage.addChild(vm.centerContainer)

    vm.startRotation()
    window.wheel = vm.wheel
    window.premioPositions = vm.premioPositions
    window.buttonSprite = vm.buttonSprite
    window.sounds = vm.sounds
  })
  pixiLoader.onProgress.add((loader, resource) => {
    vm.pixiLoadingProgress = loader.progress
  })
  pixiLoader.onComplete.add(() => {
    vm.pixiIsLoading = false
    this.$emit('loaded')
  })
}

// Watch

// Created

// Mounted
onMounted(() => {
  ;(async () => await GetWheelPrizes())()
})
</script>

<style scoped>
@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff2)
    format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa0ZL7SUc.woff2)
    format('woff2');
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2ZL7SUc.woff2)
    format('woff2');
  unicode-range: U+1F00-1FFF;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7SUc.woff2)
    format('woff2');
  unicode-range: U+0370-03FF;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2pL7SUc.woff2)
    format('woff2');
  unicode-range:
    U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301,
    U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7SUc.woff2)
    format('woff2');
  unicode-range:
    U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF,
    U+2113, U+2C60-2C7F, U+A720-A7FF;
}

@font-face {
  font-family: 'Inter';
  font-style: normal;
  font-weight: 400 900;
  src: url(https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2)
    format('woff2');
  unicode-range:
    U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329,
    U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
html,
body {
  user-select: none;
}
#pixiContainer {
  width: 420px;
  height: 633px;
}
.s11yeso3 .bg {
  opacity: 0.65;
  -webkit-filter: blur(26px);
  filter: blur(26px);
  position: absolute;
}
.s11yeso3 .bg-a {
  width: 12.5rem;
  height: 12.5rem;
  background-image: radial-gradient(circle at 50% 50%, #8729ff, rgba(25, 26, 27, 0));
  top: 10rem;
  right: 0;
}
.s11yeso3 .bg-b {
  width: 9.375rem;
  height: 9.375rem;
  top: 23.125rem;
  left: 0;
  background-image: radial-gradient(circle at 50% 50%, #7803ff, rgba(25, 26, 27, 0));
}
.s11yeso3 .bg-c {
  width: 26.875rem;
  height: 12.5rem;
  background-image: radial-gradient(circle at 50% 50%, #4f19b1, rgba(25, 26, 27, 0));
  top: -6.875rem;
  left: -3.125rem;
}
#loading-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  z-index: 10;
}
#loading-bar {
  position: relative;
  top: calc(50% - 7.5px);
  left: calc(50% - 100px);
  width: 200px;
  height: 15px;
  padding: 2px;
  border-radius: 25px;
  background-color: red;
}
#loading-bar-inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 15px;
  overflow: hidden;
}
#loading-progress {
  position: relative;
  top: 0px;
  left: 0px;
  width: 0%;
  height: 100%;
  background-color: orange;
  transition: width 0.4s linear;
}
</style>
