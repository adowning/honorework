<script setup>
import { useShopStore } from '@/stores/shop'
import Autoplay from 'embla-carousel-autoplay'
import emblaCarouselVue from 'embla-carousel-vue'
import { onMounted } from 'vue'

const [emblaRef, emblaApi] = emblaCarouselVue({ loop: false, delay: 2000, axis: 'y' }, [Autoplay()])
const loaded = ref(false)
const TWEEN_FACTOR_BASE = 0.52
let tweenFactor = 0
let tweenNodes = []
const shopStore = useShopStore()
const bigWins = shopStore.bigWins
const numberWithinRange = (number, min, max) => Math.min(Math.max(number, min), max)

function setTweenNodes(emblaApi) {
  if (emblaApi) {
    tweenNodes = emblaApi.slideNodes().map((slideNode) => {
      // return slideNode.querySelector('.embla__slide')
      return slideNode
    })
  }
}

function setTweenFactor(emblaApi) {
  if (emblaApi) {
    tweenFactor = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }
}

function tweenScale(emblaApi, eventName) {
  if (emblaApi) {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'
    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }
        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor)
        const scale = numberWithinRange(tweenValue, 0, 1).toString()
        const tweenNode = tweenNodes[slideIndex]
        tweenNode.style.transform = `scale(${scale})`
      })
    })
  }
}

function setupTweenScale(emblaApi) {
  if (emblaApi.value) {
    setTweenNodes(emblaApi.value)
    setTweenFactor(emblaApi.value)
    tweenScale(emblaApi.value)

    emblaApi.value
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)

    return () => {
      tweenNodes.forEach((slide) => slide.removeAttribute('style'))
    }
  }
}
const duration = ref(100)

onMounted(async () => {
  setupTweenScale(emblaApi)
  if (bigWins.length > 0) {
    loaded.value = true
  }
  console.log(bigWins)
  duration.value = 80
  console.log(duration)
})
</script>

<template>
  <div class="animate__animated animate__fadeIn" style="pointer-events: none">
    {{ loaded }}{{ bigWins.length }}
    <div
      v-if="loaded"
      class="flex bg-transparent bigWins"
      style="max-height: 62px; height: 62px; margin-top: 62px; z-index: 0"
    >
      <Vue3Marquee :vertical="true" :duration style="">
        <div
          v-for="win in bigWins"
          :key="win.id"
          style="margin-bottom: 12px; height: 60px; border-radius: 9999px; padding: 0.125rem"
          class=""
        >
          <div class="gradient-border-mask">
            <div
              :key="win.id"
              class="relative flex h-[56px] flex-row items-center justify-between rounded-full"
            >
              <div
                style="
                  z-index: 1;
                  line-height: 1;
                  padding-bottom: 0px;
                  padding-left: 3px;
                  padding-right: 3px;
                "
                class="absolute left-1/2 top-0 flex flex-shrink -translate-x-1/2 -translate-y-1/2 justify-start items-start overflow-hidden whitespace-nowrap bg-black px-1 text-2xs font-light text-gray-200"
              >
                <span data-state="closed">2 minutes ago</span>
              </div>
              <div class="relative">
                <img
                  alt="game logo"
                  loading="lazy"
                  class="cursor-pointer rounded-full hover:brightness-150"
                  :src="`/images/games/${win.developer}/${win.gameId}.avif`"
                  style="
                    color: transparent;
                    margin-bottom: 1px;
                    margin-left: 3px;
                    margin-right: 0px;
                    height: 52px;
                    width: 52px;
                    min-width: 52px;
                  "
                />
              </div>
              <!-- <div
                class="flex justify-start items-start flex-col flex-grow-1"
                style="margin-bottom: 2px; margin-left: 10px"
              > -->
              <div
                class="flex grow-1 flex-row justify-start items-start"
                style="margin-left: 10px; z-index: 1; line-height: 1; padding-top: 0px"
              >
                <div
                  class="flex-shrink-0 flex-shrink-0 truncate text-xs text-gray-500"
                  style="
                    color: yellow;
                    font-weight: 700;
                    line-height: 1;
                    font-size: 18px;
                    margin: 0;
                    padding: 0;
                  "
                >
                  {{ win.username }}
                </div>
                <div
                  class="flex-shrink-0 flex-shrink-0 truncate text-xs text-gray-300"
                  style="font-weight: 700; font-size: 18px; line-height: 1; margin-left: 4px"
                >
                  won
                </div>
                <div
                  class="ml-4 flex-shrink-0 text-lg font-sm text-text ml-4"
                  style="font-weight: 900; line-height: 1; margin-left: 4px"
                >
                  ${{ win.winAmount }}
                </div>
                <div
                  class="flex grow-1 truncate text-xs text-gray-300"
                  style="
                    margin-left: 10px;
                    margin-right: 10px;
                    font-weight: 700;
                    font-size: 18px;
                    line-height: 1;
                    margin-left: 4px;
                  "
                >
                  -
                </div>
                <div
                  class="flex w-full justify-start items-center truncate text-xs text-gray-300"
                  style="
                    font-weight: 600;
                    font-size: 16px;
                    line-height: 0.8;
                    margin: auto;
                    line-height: 1;
                  "
                >
                  {{ win.gameId }}
                </div>
              </div>
              <!-- </div> -->
              <div class="relative flex items-center justify-end">
                <div
                  class="flex h-4 w-5 items-center justify-center rounded"
                  style="margin-right: 4px"
                  data-state="closed"
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    version="1"
                    viewBox="0 0 48 48"
                    enable-background="new 0 0 48 48"
                    class="text-gray-400"
                    height="22"
                    width="22"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#7CB342"
                      d="M24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20S35,4,24,4z"
                    ></path>
                    <path
                      fill="#0277BD"
                      d="M45,24c0,11.7-9.5,21-21,21S3,35.7,3,24S12.3,3,24,3S45,12.3,45,24z M23.8,33.7c0-0.4-0.2-0.6-0.6-0.8 c-1.3-0.4-2.5-0.4-3.6-1.5c-0.2-0.4-0.2-0.8-0.4-1.3c-0.4-0.4-1.5-0.6-2.1-0.8c-0.8,0-1.7,0-2.7,0c-0.4,0-1.1,0-1.5,0 c-0.6-0.2-1.1-1.1-1.5-1.7c0-0.2,0-0.6-0.4-0.6c-0.4-0.2-0.8,0.2-1.3,0c-0.2-0.2-0.2-0.4-0.2-0.6c0-0.6,0.4-1.3,0.8-1.7 c0.6-0.4,1.3,0.2,1.9,0.2c0.2,0,0.2,0,0.4,0.2c0.6,0.2,0.8,1,0.8,1.7c0,0.2,0,0.4,0,0.4c0,0.2,0.2,0.2,0.4,0.2 c0.2-1.1,0.2-2.1,0.4-3.2c0-1.3,1.3-2.5,2.3-2.9c0.4-0.2,0.6,0.2,1.1,0c1.3-0.4,4.4-1.7,3.8-3.4c-0.4-1.5-1.7-2.9-3.4-2.7 c-0.4,0.2-0.6,0.4-1,0.6c-0.6,0.4-1.9,1.7-2.5,1.7c-1.1-0.2-1.1-1.7-0.8-2.3c0.2-0.8,2.1-3.6,3.4-3.1c0.2,0.2,0.6,0.6,0.8,0.8 c0.4,0.2,1.1,0.2,1.7,0.2c0.2,0,0.4,0,0.6-0.2c0.2-0.2,0.2-0.2,0.2-0.4c0-0.6-0.6-1.3-1-1.7c-0.4-0.4-1.1-0.8-1.7-1.1 c-2.1-0.6-5.5,0.2-7.1,1.7s-2.9,4-3.8,6.1c-0.4,1.3-0.8,2.9-1,4.4c-0.2,1-0.4,1.9,0.2,2.9c0.6,1.3,1.9,2.5,3.2,3.4 c0.8,0.6,2.5,0.6,3.4,1.7c0.6,0.8,0.4,1.9,0.4,2.9c0,1.3,0.8,2.3,1.3,3.4c0.2,0.6,0.4,1.5,0.6,2.1c0,0.2,0.2,1.5,0.2,1.7 c1.3,0.6,2.3,1.3,3.8,1.7c0.2,0,1-1.3,1-1.5c0.6-0.6,1.1-1.5,1.7-1.9c0.4-0.2,0.8-0.4,1.3-0.8c0.4-0.4,0.6-1.3,0.8-1.9 C23.8,35.1,24,34.3,23.8,33.7z M24.2,14.3c0.2,0,0.4-0.2,0.8-0.4c0.6-0.4,1.3-1.1,1.9-1.5c0.6-0.4,1.3-1.1,1.7-1.5 c0.6-0.4,1.1-1.3,1.3-1.9c0.2-0.4,0.8-1.3,0.6-1.9c-0.2-0.4-1.3-0.6-1.7-0.8c-1.7-0.4-3.1-0.6-4.8-0.6c-0.6,0-1.5,0.2-1.7,0.8 c-0.2,1.1,0.6,0.8,1.5,1.1c0,0,0.2,1.7,0.2,1.9c0.2,1-0.4,1.7-0.4,2.7c0,0.6,0,1.7,0.4,2.1L24.2,14.3z M41.8,29 c0.2-0.4,0.2-1.1,0.4-1.5c0.2-1,0.2-2.1,0.2-3.1c0-2.1-0.2-4.2-0.8-6.1c-0.4-0.6-0.6-1.3-0.8-1.9c-0.4-1.1-1-2.1-1.9-2.9 c-0.8-1.1-1.9-4-3.8-3.1c-0.6,0.2-1,1-1.5,1.5c-0.4,0.6-0.8,1.3-1.3,1.9c-0.2,0.2-0.4,0.6-0.2,0.8c0,0.2,0.2,0.2,0.4,0.2 c0.4,0.2,0.6,0.2,1,0.4c0.2,0,0.4,0.2,0.2,0.4c0,0,0,0.2-0.2,0.2c-1,1.1-2.1,1.9-3.1,2.9c-0.2,0.2-0.4,0.6-0.4,0.8 c0,0.2,0.2,0.2,0.2,0.4c0,0.2-0.2,0.2-0.4,0.4c-0.4,0.2-0.8,0.4-1.1,0.6c-0.2,0.4,0,1.1-0.2,1.5c-0.2,1.1-0.8,1.9-1.3,2.9 c-0.4,0.6-0.6,1.3-1,1.9c0,0.8-0.2,1.5,0.2,2.1c1,1.5,2.9,0.6,4.4,1.3c0.4,0.2,0.8,0.2,1.1,0.6c0.6,0.6,0.6,1.7,0.8,2.3 c0.2,0.8,0.4,1.7,0.8,2.5c0.2,1,0.6,2.1,0.8,2.9c1.9-1.5,3.6-3.1,4.8-5.2C40.6,32.4,41.2,30.7,41.8,29z"
                    ></path>
                  </svg>
                </div>
                <button
                  type="button"
                  class="group relative inline-flex h-6 w-6 items-center rounded-full border-2 border-gray-200 bg-gray-150 hover:bg-gray-200"
                  aria-label="Open replay"
                  data-state="closed"
                  style="margin-right: 8px"
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    stroke-width="0"
                    viewBox="0 0 512 512"
                    class="h-4 w-full text-gray-400 group-hover:text-gray-450"
                    aria-hidden="true"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="256" cy="256" r="64"></circle>
                    <path
                      d="M490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96c-42.52 0-84.33 12.15-124.27 36.11-40.73 24.43-77.63 60.12-109.68 106.07a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416c46.71 0 93.81-14.43 136.2-41.72 38.46-24.77 72.72-59.66 99.08-100.92a32.2 32.2 0 00-.1-34.76zM256 352a96 96 0 1196-96 96.11 96.11 0 01-96 96z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <!-- </div> -->
            <!-- <div
              :key="win.id"
              class="flex flex-row justify-stretch w-full"
              style="
                margin-right: 15px;
                height: 50px;
                overflow: hidden;
                border-radius: 8px;
                background: #25244e;
                z-index: 1;
              "
            >
              <img :src="`/images/games/${win.developer}/${win.gameId}.avif`" alt="win" />
              <div class="flex flex-col justify-start items-start">
                <div class="flex flex-row">
                  <span class="knight" style="font-weight: 900">{{ win.username }}</span>
                </div>
                <div class="flex justify-start items-start" style="color: white">
                  <span style="font-weight: 100">won &nbsp;&nbsp;</span>
                  <img
                    :key="win.id"
                    src="/images/money.webp"
                    :alt="win.title"
                    width="24"
                    height="24"
                    style="padding-right: 3px"
                  />
                  ${{ win.winAmount }}
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </Vue3Marquee>
    </div>
  </div>
</template>

<style scoped>
@charset "UTF-8";
/* .gradient-box {
  display: flex;
  align-items: center;
  width: 100%;
  margin: auto;
  max-width: 22em;
  position: relative;
  padding: 30% 2em;
  box-sizing: border-box;
  color: #fff;
  background: #000;
  background-clip: padding-box;
  border: solid 5px transparent;
  border-radius: 1em;
}
.gradient-box:before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  margin: -5px;
  border-radius: inherit;
  background: linear-gradient(to right, red, orange);
} */

.gradient-border-mask {
  display: block;
  position: relative;
  padding: 2px;
  max-width: 600px;
  /* -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px); */
}

.gradient-border-mask::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 45px;
  border: 5px solid transparent;
  background: linear-gradient(to right, red, orange) border-box;
  -webkit-mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  mask:
    linear-gradient(#fff 0 0) padding-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
}

.bigwin {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  max-width: 22em;

  pointer-events: none;
  font-family:
    Roboto,
    ui-sans-serif,
    system-ui,
    sans-serif,
    Apple Color Emoji,
    Segoe UI Emoji,
    Segoe UI Symbol,
    Noto Color Emoji;
  font-feature-settings: normal;
  margin-bottom: 3px;
  font-variation-settings: normal;
  border-width: 0;
  border-style: solid;
  border-image-slice: 7 12 14 5;
  border-color: rgba(var(--gray-200));
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--gray-700) / 0.3) transparent;
  background-image: linear-gradient(68deg, #da0000, #fe5000 22%, #fe8c00 84%, #fff800);
  height: 50px;
  border-radius: 9999px;
  padding: 0.125rem;
  .rounded-full {
    border-radius: 9999px;
  }
  .h-\[30px\] {
    height: 30px;
  }
  .bg-gradient-orange-red {
    background-image: linear-gradient(68.3deg, #f5b161 0.4%, #ec366e 100.2%);
  }
  * {
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--gray-700) / 0.3) transparent;
  }
  * {
    box-sizing: border-box;
  }
  *,
  :after,
  :before {
    box-sizing: border-box;
    border-width: 0;
    border-style: solid;
    border-color: rgba(var(--gray-200));
  }
}
@font-face {
  font-family: knight;
  src:
    local('Pixel'),
    url('/Kanit-ExtraBold.ttf') format('truetype');
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.knight {
  font-family: 'knight', serif;
}

.bigWins {
  /* margin: 1rem;
  padding-bottom: 30px; */
  display: flex;
  justify-content: end;
  align-items: center;
  overflow: hidden;
  /* background-image: url('/images/ads/promo-dock.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom; */
}

.embla {
  overflow: hidden;
}

.embla__container {
  display: flex;
}

.embla__slide {
  flex: 0 0 100%;
  min-width: 0;
  /* margin-left: 36px;
  margin-right: 36px; */
}
</style>
