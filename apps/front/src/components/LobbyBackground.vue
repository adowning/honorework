<!-- eslint-disable style/indent-binary-ops -->
<!-- eslint-disable @typescript-eslint/ban-ts-comment -->
<script lang="ts" setup>
// console.log(sizes.width.value / 2 - 240)
import { useIsMobile } from '@/composables/useIsMobile'
import { onMounted, ref } from 'vue'

const showParticles = ref(true)
const sizes = useWindowSize()

const mobile = useIsMobile()
console.log(mobile)

const alt2SparkleParticles: any[] = []
let alt2SparkleParticleSize = 117
const alt2xRadius = 1365 / 2
const alt2yRadius = 768 / 2
let alt2SparkleSpiral = 200
let alt2SparkleSpiral2 = 0
function addAlt2Particles() {
  for (let i = 0; i < 3; i++) {
    addAlt2SparkleParticle(i)
  }
  setInterval(updateAlt2Particles, 30)
}

function updateAlt2Particles() {
  updateAlt2SparkleParticles()
}
let t = 'star'

function addAlt2SparkleParticle(round: number) {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const r = Math.floor(Math.random() * 2)
  if (round === 1) {
    t = 'star'
    alt2SparkleParticleSize = 117
  } else {
    alt2SparkleParticleSize = 110
    t = 'water_sparkle'
  }
  const particleDiv = document.getElementById('particleDiv')
  if (particleDiv === null) {
    return
  }
  const particle: any = document.createElement('div')
  // console.log(bgvideo.value.style.width)
  particle.style.backgroundImage = `url(/images/${t}.png)`
  particle.style.position = 'fixed'
  particle.style.width = `${alt2SparkleParticleSize}px`
  particle.style.height = `${alt2SparkleParticleSize}px`
  initAlt2SparkleParticle(particle)
  particleDiv.appendChild(particle)

  // @ts-ignore
  alt2SparkleParticles.push(particle)
}
// CSS Classes available
function initAlt2SparkleParticle(particle: any) {
  alt2SparkleSpiral -= 1.2
  if (alt2SparkleSpiral <= 0) {
    alt2SparkleSpiral = 100
  }
  const spiralRadius = alt2SparkleSpiral / 100
  alt2SparkleSpiral2 += 0.01
  particle.x
    = alt2xRadius
    + Math.cos(alt2SparkleSpiral + alt2SparkleSpiral2) * alt2xRadius * spiralRadius
    - alt2SparkleParticleSize / 2
  particle.y
    = alt2yRadius
    + Math.sin(alt2SparkleSpiral + alt2SparkleSpiral2) * alt2yRadius * spiralRadius
    - alt2SparkleParticleSize / 2
  particle.x = Math.floor(Math.random() * 390) + sizes.width.value / 2 - 240
  particle.y = Math.floor(Math.random() * 700)
  particle.speed = Math.random() * 0.004 + 0.002 + (1 - spiralRadius) * 0.0035
  particle.size = Math.random() * 0.1 + 0.5 + (1 - spiralRadius)
  particle.rotation = 0

  particle.style.top = `${particle.y}px`
  particle.style.left = `${particle.x}px`
  particle.style.transform = `rotate(${particle.rotation}deg) scale(${particle.size})`
  particle.style.color = 'white'
}

function updateAlt2SparkleParticles() {
  for (const i in alt2SparkleParticles) {
    const particle = alt2SparkleParticles[i]
    particle.size -= particle.speed
    if (particle.size < 0) {
      initAlt2SparkleParticle(particle)
    } else if (particle.style) {
      particle.rotation -= 0.9
      const size = Math.sin(particle.size * 15) * 0.3 + particle.size
      particle.style.transform = `rotate(${particle.rotation}deg) scale(${size})`
    }
  }
}
onMounted(() => {
  // addAlt2Particles()
  addAlt2Particles()
})
</script>

<template>
  <!-- <div style="height:100vh; width:100vw; resize:both; position:relative;">
<div id="contentDiv" style="visibility:hidden; width:100vw; height:768px; text-align:center; position: absolute; left:50%; top:50%; transform: translateX(-50%) translateY(-50%);"> -->
  <!-- <div id="backgroundDiv" style="width:100%; height:100%; background:no-repeat 50% 50%; transform-origin:center center; background-size:cover;" /> -->
  <!-- <div
      ref="bgvideo"
      class="bgvideo max-w-[480px]"
      style="width: 480px"
      :style="`height: ${w > 480 ? '780px' : '100vh'};
            top: ${w > 480 ? 'calc((100vh - 720px) /2)' : '0px'}`"
    /> -->

  <div v-if="mobile && showParticles" class="lobby-background absolute h-100vh overflow-hidden" id="particleDiv" style="
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      height: 100%;
      width: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-image: url('/images/starsbg.png');
      background-size: cover;
    " />
  <div v-if="!mobile && showParticles" class="lobby-background absolute h-[720px] overflow-hidden" id="particleDiv"
    style="
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      height: 720px;
      width: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;

    " />
</template>

<style scoped>
/* .main {
  position: absolute;
  top: 0;
  left: 0;
} */
</style>
