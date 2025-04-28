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
  <div
    v-if="currentUser !== undefined"
    class="player"
    style="
      position: relative;
      height: 50px;
      width: 50px;
      z-index: 99213;
      left: 0px;
      margin-left: 13px;
      background-image: url('/images/avatars/avatar-1.webp');
      background-size: 100%;
      border-radius: 999px;
      background-position: center;
      background-repeat: no-repeat;
    "
  >
    <div
      :style="`${
        gaining_exp === true
          ? 'box-shadow: 0 0 5px 3px #fff,0 0 15px 6px #f0f, 0px  -2px 1px 4px #0ff;;'
          : 'box-shadow: 0,0,0,0;'
      }`"
      class="flex"
      style="
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
      "
    >
      <div class="flex items-center justify-center -m-8 overflow-hidden rounded-full">
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
        <svg class="w-27 h-27" x-cloak aria-hidden="true">
          <circle
            class="text-gray-300"
            stroke-width="6"
            stroke="currentColor"
            fill="transparent"
            r="25"
            cx="60"
            cy="55"
          />
          <circle
            class="text-blue-600"
            stroke-width="6"
            stroke-linecap="round"
            stroke="currentColor"
            fill="transparent"
            r="25"
            cx="60"
            cy="55"
          />
        </svg>
      </div>
      <img
        v-if="gaining_exp"
        style="
          z-index: 99999;
          position: absolute;
          top: -6px;
          left: 0px;
          width: 40px;
          height: 60px;
          width: 100px;
          transform: scaleX(1.2);
        "
        src=" /images/avatars/avatar-modal___xp-glow.png"
        alt=""
      />
      <div
        class="absolute h-[19px] flex bg-white opacity-99"
        :style="`${
          currentUser.username.length <= 6 ? 'font-size: large' : 'font-size: medium'
        }`"
        style="
          border-radius: 5px;
          left: -10px;
          background: white;
          bottom: -8px;
          z-index: 999;
          color: black;
          border-radius: 4px;
          justify-content: start;
          min-width: 75px;
          text-align: center;
          font-weight: 800;
          margin: auto;
          border: 1px solid #6f14a3; /* some kind of blue border */

          -webkit-box-shadow: 0px 0px 4px #6f14a3;
          -moz-box-shadow: 0px 0px 4px #6f14a3;
          box-shadow: 0px 0px 4px #6f14a3; /* some variation of blue for the shadow */
          -webkit-border-radius: 4px;
          -moz-border-radius: 4px;
        "
      >
        <div
          class="flex flex-col mt--1"
          style="
            z-index: 999;
            margin: auto;
            justify-content: end;
            text-align: center;
            line-height: 1;
          "
        >
          {{ currentUser.username?.substring(0, 8) }}
        </div>
      </div>
      <div
        class=""
        style="
          height: 32px;
          width: 32px;
          position: absolute;
          background-image: url('/images/avatars/level-star.avif');
          background-size: cover;
          top: 10px;
          left: -10px;
          z-index: 10;
          z-index: 9999;
        "
        @click="showProfile()"
      >
        <!-- <img
          style="position: absolute"
          src="/images/avatars/level-star.avif"
          width="32"
          height="32"
          alt=""
        /> -->
        <div
          class="flex ml-2 mt-3 pl-3"
          style="
            padding-left: 5px;
            margin-left: 6px;
            margin-top: 4px;
            font-size: medium;
            font-weight: 800;
            color: black;
            z-index: 999999999;
          "
        >
          <!-- {{ currentUser.vipRank.rankLevel }} -->
          1
        </div>
      </div>
      <div
        class="absolute left-0"
        style="
          width: 100%;
          height: 20%;
          margin: auto;
          justify-content: center;
          text-align: center;
          font-size: medium;
          font-weight: 700;
          margin: auto;
          color: black;
        "
      />
    </div>
    <div
      v-if="gaining_exp"
      style="
        position: absolute;
        width: 60px;
        height: 30px;
        background: transparent;
        left: -5px;
        top: -4px;
        z-index: 99999;
      "
    >
      <SparklesSprite />
    </div>
  </div>
  <!-- </div> -->
  <!-- </div> -->
</template>

<style scoped>
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
  background: conic-gradient(
    from var(--from),
    var(--color1),
    var(--color1) var(--distance),
    transparent var(--distance)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border)),
    #fff calc(100% - var(--border) + 1px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border)),
    #fff calc(100% - var(--border) + 1px)
  );
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
  background: conic-gradient(
    from var(--from),
    var(--color2),
    var(--color2) var(--distance2),
    transparent var(--distance2)
  );
  -webkit-mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border2)),
    #fff calc(100% - var(--border2) + 1px)
  );
  mask: radial-gradient(
    farthest-side,
    transparent calc(100% - var(--border2)),
    #fff calc(100% - var(--border2) + 1px)
  );
}

img {
  border-radius: 999px;
  display: block;
  /* width: calc(100vw - 80px); */
  max-width: 60px;
  height: auto;
}
</style>
