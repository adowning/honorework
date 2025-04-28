<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { eventBus } from "@/composables/eventBus";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const currentUser = userStore.currentUser;
const gaining_exp = ref(false);
eventBus.on("gainingExp", () => {
  setTimeout(() => {
    gaining_exp.value = true;
  }, 500);
});

// --- Props ---
interface Props {
  progress?: number; // Progress percentage (0-100)
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  progress: 1, // Default to 0% progress
});

// --- SVG Dimensions and Calculations ---
const svgSize = 45; // ViewBox size (can be scaled by parent CSS)
const strokeWidth = 4; // Width of the outer progress ring
const center = svgSize / 2;
const outerRadius = svgSize / 2 - strokeWidth / 2; // Radius for the outer rings
const innerRadius = outerRadius - strokeWidth / 2 - 2; // Radius for inner circle (adjust gap: -2)
const circumference = computed(() => 2 * Math.PI * outerRadius);

// Clamp progress value between 0 and 100
const clampedProgress = computed(() => {
  return Math.min(Math.max(props.progress, 0), 100);
});

// Calculate SVG stroke offset for the progress ring
const strokeDashoffset = computed(() => {
  return circumference.value * (1 - clampedProgress.value / 100);
});

// const glowFrame = ref()
async function showProfile() {
  eventBus.emit("profileOpen", true);
}
// const animateCSS = (element: any, animation: any, prefix = 'animate__') =>
//   new Promise((resolve, reject) => {
//     const animationName = `${prefix}${animation}`
//     glowFrame.value.style.add(`${prefix}animated`, animationName)
//     function handleAnimationEnd(event: { stopPropagation: () => void }) {
//       event.stopPropagation()
//       glowFrame.value.style.remove(`${prefix}animated`, animationName)
//       resolve('Animation ended')
//     }
//     glowFrame.value.addEventListener('animationend', handleAnimationEnd, {
//       once: true,
//     })
//   })
</script>

<template>
  <div v-if="currentUser !== undefined" class="player" style="
      position: relative;
      /* height: 60px; */
      width: 55px;
      z-index: 99213;
      left: -4px;
      top: 14px;
      /* background-image: url('/images/avatars/avatar-3.webp');
      background-size: 100%;
      background-position: center;
      border-radius: 999px;
      background-repeat: no-repeat; */
    ">
    <!-- <div
      :style="`${gaining_exp === true ? 'box-shadow: 0 0 5px 3px #fff,0 0 15px 6px #f0f, 0px  -2px 1px 4px #0ff;;' : 'box-shadow: 0,0,0,0;'}`"
      class="flex" style="
        width: 100%;
        height: 100%;
        z-index: 999;
        /* background-image: url('/images/avatars/avatar-1.webp'); */

        margin-top: 2px;
        border-radius: 999px;
        margin-left: 0px;
        left: 0px;
        top: 0px;
        position: absolute;
        /* outer cyan */
      "> -->
    <!-- <div class="flex items-center justify-center -m-8 overflow-hidden rounded-full"> -->
    <!-- <div
          class="rounded-full"
          style="
            height: 100%;
            width: 100%;
            position: absolute;
            background-image: url('/images/avatars/avatar-1.webp');
            background-size: cover;
            top: 0px;
            left: 3px;
          "
          @click="showProfile()"
        ></div> -->
    <!-- <svg class="w-27 h-27" x-cloak aria-hidden="true">
          <circle class="text-gray-300" stroke-width="6" stroke="currentColor" fill="transparent" r="25" cx="60"
            cy="55" />
          <circle class="text-blue-600" stroke-width="6" stroke-linecap="round" stroke="currentColor" fill="transparent"
            r="25" cx="60" cy="55" />
        </svg> -->
    <svg class="button-svg" :viewBox="`0 0 ${svgSize} ${svgSize}`">
      <circle class="inner-circle" :cx="center" :cy="center" :r="innerRadius" />

      <circle class="outer-track" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth" fill="none" />

      <circle class="outer-progress" :cx="center" :cy="center" :r="outerRadius" :stroke-width="strokeWidth"
        :stroke-dasharray="circumference" :stroke-dashoffset="strokeDashoffset" fill="none"
        :transform="`rotate(-90 ${center} ${center})`" />
    </svg>
  </div>
  <img v-if="gaining_exp" style="
      z-index: 99999;
      position: absolute;
      top: -6px;
      left: 0px;
      width: 40px;
      height: 60px;
      width: 100px;
      transform: scaleX(1.2);
    " src=" /images/avatars/avatar-modal___xp-glow.png" alt="" />

  <div class="absolute left-0" style="
      width: 100%;
      height: 20%;
      margin: auto;
      justify-content: center;
      text-align: center;
      font-size: medium;
      font-weight: 700;
      margin: auto;
      color: black;
    " />
  <!-- </div> -->
  <div v-if="gaining_exp" style="
      position: absolute;
      width: 60px;
      height: 30px;
      background: transparent;
      left: -5px;
      top: -4px;
      z-index: 99999;
    ">
    <SparklesSprite />
    <!-- </div> -->
  </div>
  <!-- </div> -->
  <!-- </div> -->
</template>

<style scoped>
  .progress-start-button {
    /* Reset button defaults */
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: inline-block;
    /* Allow setting width/height */
    width: 100px;
    /* Default size, can be overridden */
    height: 100px;
    position: relative;
    /* If needed for pseudo-elements or tooltips */
    transition: transform 0.1s ease;
    /* Add slight press effect */
  }

  .progress-start-button:active {
    transform: scale(0.97);
    /* Press down effect */
  }

  .button-svg {
    display: block;
    /* Remove extra space below SVG */
    width: 100%;
    height: 100%;
    overflow: visible;
    /* Allow potential stroke glow to show */
  }

  /* 1. Inner Purple Circle */
  .inner-circle {
    fill: #4a0e98;
    /* Purple color from image */
  }

  /* 2. Outer Ring Background Track */
  .outer-track {
    stroke: #374151;
    /* Dark grey/blue track color */
  }

  /* 3. Outer Ring Progress Fill */
  .outer-progress {
    stroke: #facc15;
    /* Yellow/gold progress color */
    stroke-linecap: round;
    /* Optional: makes the start/end of the progress arc rounded */
    transition: stroke-dashoffset 0.5s cubic-bezier(0.65, 0, 0.35, 1);
    /* Smooth animation */
    filter: drop-shadow(0 0 2px rgba(250, 204, 21, 0.5));
    /* Subtle glow */
  }

  /* 4. "START" Text */
  .button-text {
    fill: #facc15;
    /* Yellow/gold text color */
    font-size: 20px;
    /* Adjust font size as needed */
    font-weight: bold;
    text-transform: uppercase;
    font-family: sans-serif;
    /* Choose a suitable font */
    /* Prevent text selection */
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  :root {
    --border: 6px;
    --border2: 5px;
    --color1: yellow;
    --color2: red;
    --from: -110deg;
    --distance: 16%;
    --distance2: 156%;
  }

  .img-wrap {
    position: relative;
    padding: 1px;
  }

  .img-wrap::after {
    content: "";
    border-radius: 999px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 60px;
    width: 60px;
    /* background: color1; */
    background: conic-gradient(from var(--from),
        var(--color1),
        var(--color1) var(--distance),
        transparent var(--distance));
    -webkit-mask: radial-gradient(farthest-side,
        transparent calc(100% - var(--border)),
        #fff calc(100% - var(--border) + 1px));
    mask: radial-gradient(farthest-side,
        transparent calc(100% - var(--border)),
        #fff calc(100% - var(--border) + 1px));
  }

  .img-wrap2 {
    position: relative;
    padding: 1px;
  }

  .img-wrap2::after {
    content: "";
    border-radius: 999px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    height: 60px;
    width: 60px;
    /* background: color1; */
    background: conic-gradient(from var(--from),
        var(--color2),
        var(--color2) var(--distance2),
        transparent var(--distance2));
    -webkit-mask: radial-gradient(farthest-side,
        transparent calc(100% - var(--border2)),
        #fff calc(100% - var(--border2) + 1px));
    mask: radial-gradient(farthest-side,
        transparent calc(100% - var(--border2)),
        #fff calc(100% - var(--border2) + 1px));
  }

  img {
    border-radius: 999px;
    display: block;
    /* width: calc(100vw - 80px); */
    max-width: 60px;
    height: auto;
  }
</style>
