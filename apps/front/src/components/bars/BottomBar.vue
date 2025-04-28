<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import LeaderJson from "@/assets/anim/leadernew.json";
import { eventBus } from "@/composables/eventBus";
import { useGeneralStore } from "@/stores/general";

const generalStore = useGeneralStore();
const { generalSidebarMobile } = storeToRefs(generalStore);
const { generalSetSidebarMobile } = generalStore;

const userStore = useUserStore();
const currentUser = userStore.currentUser;
// const iconBar = ref()
// const bottomBar = ref()
// const chatBarRef = ref()
const sprite = ref<any>();
// const chatIsOpen = ref(false)
// const showChatBar = ref(false)
// const showBottomBar = ref(true)
const showFab = ref(true);
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
// const active = ref(0)
const shopOpen = ref(false);
const leaderBoardOpen = ref(false);
// const wheelPageOpen = ref(false)
const pressed = ref(false);
function changeShopOpen() {
  shopOpen.value = true;
  console.log(shopOpen.value);
  eventBus.emit("shopOpen", shopOpen.value);
}
function changeLeaderBoardOpen() {
  leaderBoardOpen.value = true;
  eventBus.emit("leaderBoardOpen", leaderBoardOpen.value);
}
function changeWheelPageOpen() {
  pressed.value = !pressed.value;
  // leaderBoardOpen.value = true
  // eventBus.emit('wheelPageOpen', wheelPageOpen.value)
}
// function toggleChat() {
//   chatIsOpen.value = !chatIsOpen.value
//   showChatBar.value = !showChatBar.value
//   showBottomBar.value = !showBottomBar.value
//   showFab.value = !showFab.value
//   if (chatIsOpen.value) {
//     // eventBus.emit('chatOpen')
//   }
// }
// const shakeIt = ref(false)
export interface Path {
  name: string;
  path: string;
  params?: {
    [k in string]: string;
  };
  query?: {
    [k in string]: string;
  };
}

export interface WindowsOption {
  id: number | string;
  title?: string;
  badge?: number | string;
  selected?: boolean;
  deselect?: boolean;
  path?: Path | string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  component?: any;
  jsonData?: Array<number | string | boolean | object | null>;
  imageSrc?: Array<string>;
}

// function handleChat(val: number) {
//   if (val === 0) {
//     console.log('bottom bar pressed active value: ', active.value)
//     if (active.value === 1) {
//       // return $bus.$emit(eventTypes.close_battles)
//     }
//     if (active.value === 3) {
//       // return $bus.$emit(eventTypes.closeShop)
//     }
//     console.log(chatIsOpen.value)
//     if (chatIsOpen.value === true) {
//       iconBar.value.classList.remove('animate__animated', 'animate__fadeOutDown')
//       iconBar.value.classList.add('animate__animated', 'animate__fadeInUp')
//       chatBarRef.value.classList.remove('animate__animated', 'animate__fadeInUp')
//       chatBarRef.value.classList.add('animate__animated', 'animate__fadeOutDown')
//       setTimeout(() => {
//         // $bus.$emit(eventTypes.close_chat)
//         active.value = 0
//         showChatBar.value = false
//         // showBottomBar.value = true
//         chatIsOpen.value = false
//       }, 500)
//       return
//     }

//     if (chatIsOpen.value === false) {
//       console.log('herer')
//       iconBar.value.classList.add('animate__animated', 'animate__fadeOutDown')
//       chatBarRef.value.classList.add('animate__animated', 'animate__fadeInUp')
//       showChatBar.value = true
//       // $bus.$emit(eventTypes.change_page, 2)
//       setTimeout(() => {
//         active.value = 2
//         // showBottomBar.value = false
//         chatIsOpen.value = true
//         console.log(chatIsOpen.value)
//       }, 500)
//       return
//     }
//   }
//   if (val !== 0) {
//     // if (chatIsOpen.value === true) {
//     // iconBar.value.classList.remove('animate__animated', 'animate__fadeOutDown')
//     // iconBar.value.classList.add('animate__animated', 'animate__fadeInUp')
//     iconBar.value.classList.remove('animate__animated', 'animate__fadeInUp')
//     iconBar.value.classList.add('animate__animated', 'animate__fadeOutDown')
//     setTimeout(() => {
//       // $bus.$emit(eventTypes.change_page, val)
//       active.value = 0
//       showChatBar.value = false
//       showBottomBar.value = false
//       chatIsOpen.value = false
//     }, 500)
//   }
// }

// const { height, width: w } = useWindowSize()
</script>

<template>
  <!-- <Chat v-show="chatIsOpen" ref="chatRef" /> -->
  <div class="flex flex-row justify-center gap-12 px-8" style="
      width: 100%;
      position: absolute;
      max-height: 100px;
      left: 0px;
      bottom: 0px;
      z-index: 9999;
      background-image: url('/images/bottom/slice.avif');
      background-size: contain;
      height: 37px;
    ">
    <div class="items-end justify-center" style="
        width: 100%;
        display: flex;
        padding-top: 10px;
        overflow: hidden;
        height: 80px;
        flex-wrap: nowrap;
        grid-gap: 0px;
        padding: 2px;
      ">
      <!-- <div
        class="flex flex-row"
        style="
          background-image: url('/images/bottom/slice.avif');
          background-size: contain;
          margin-left: 6px;
          width: 100vw;
          height: 37px;
          z-index: 899;
        "
      > -->
      <!-- <div
          v-show="chatIsOpen === true"
          ref="chatBarRef"
          class="animate__animated animate__fadeInUp items-center justify-center"
          style="
            background-size: contain;
            padding-left: 2px;
            min-width: 75vw;
            width: 75vw;
            height: 37px;
            z-index: 999;
          "
        /> -->
      <!-- <div
v-show="chatIsOpen === false" ref="iconBar"
      class="animate__animated animate__fadeInUp ml-2 flex flex-row items-center justify-stretch gap-2" style="
            background-size: contain;
            padding-left: 2px;
            /* min-width: 75vw; */

            height: 37px;
            z-index: 999;
            padding-right: 25vw;
          "
> -->
      <div class="wn-btn-item" @click="changeWheelPageOpen">
        <WheelIcon :pressed="pressed" :current-user="currentUser" style="z-index: 999; margin-bottom: 35px" />
      </div>
      <div class="flex" />

      <div class="wn-btn-item mx-3" @click="changeLeaderBoardOpen()">
        <VGSprite id="leader" ref="sprite" class="flex" image-src="/images/bottom/leadernew.png"
          :sprite-sheet-data="LeaderJson" style="
            background-repeat: no-repeat;
            z-index: 10;
            margin-top: 3px;
            margin-right: -5px;
          " :speed="30" :delay="3500" :offset="12000" :autoplay="true" />
        <span class="glow rounded-lg bg-black px-1" style="font-size: 16px; line-height: 1.1">Battles</span>
      </div>

      <!-- <div class="wn-btn-item ml-2">
            <VGSprite
              id="leader"
              ref="sprite"
              class="flex"
              image-src="/images/bottom/rewards.png"
              :sprite-sheet-data="RewardsJson"
              style="
                background-repeat: no-repeat;
                z-index: 10;
                margin-top: -90px;
                z-index: 10;

                /* padding-left: 31px;
                padding-right: 31px; */
                transform: scale(0.6, 0.6) translate(55px, 33px);
              "
              :speed="30"
              :delay="8500"
              :offset="6500"
              :autoplay="true"
            />
            <span class="glow rounded-lg bg-black px-1 text-center" style="font-size: 16px; line-height: 1.3; ">Rewards</span>
          </div> -->
      <div class="wn-btn-item mr-3" @click="changeShopOpen()">
        <img src="/images/deposit.avif" style="
            background-repeat: no-repeat;
            z-index: 10;
            height: 70px;
            padding-top: 1px;
            margin-bottom: 2px;
          " />
        <span class="glow align-center justify-center rounded-lg bg-black px-1"
          style="font-size: 16px; line-height: 1.3">Deposit</span>
      </div>
      <!-- </div> -->
      <!-- </div> -->
      <!-- <div
        class="flex flex-row"
        style="
            background-image: url('/images/bottom/slice.avif');
            background-size: contain;
            padding-left: 2px;
            width: 101%;
            max-width: 480px  ;
            height: 37px;
            z-index: 700;
          "
      /> -->
      <!-- </div> -->
    </div>
    <div v-if="showFab" class="chatbutton w-full items-end justify-end"
      @click="generalSetSidebarMobile(generalSidebarMobile === 'Chat' ? null : 'Chat')">
      <div style="
          position: absolute;
          right: 4px;
          bottom: 3px;
          background-repeat: no-repeat;
          padding: 0px;
          margin-top: -55px;
          background-size: cover;
          min-height: 90px;
          height: 90px;
          z-index: 99999;
          width: 90px;
          background-image: url('/images/bottom/bottombarback-center2.avif');
        " />
    </div>
  </div>
</template>

<style scoped>
  .wn-btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-basis: 100%;
    transition: all 0.3s;
    box-sizing: border-box;
  }

  @media (min-width: 576px) {
    .wn-btn-container {
      cursor: pointer;
    }
  }

  .wn-btn-item {
    width: 62px;
    max-width: 62px;
    min-width: 62px;
    color: white;
    height: 90%;
    max-height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    align-items: end;
    position: relative;
  }

  .wn-btn-icon {
    position: relative;
    font-size: 22px;
  }

  .wn-btn-icon-active {
    animation: windows-button-selected 0.7s ease-out forwards;
  }

  .wn-btn-icon-deselect {
    animation: windows-button-deselect 0.2s ease-in forwards;
  }

  .wn-btn-badge {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 2px;
    right: -3px;
    width: 12px;
    height: 12px;
    border-radius: 100px;
    font-size: 10px;
    color: #ffffff;
    background-color: var(--badge-color);
  }

  @keyframes windows-border-bottom {
    0% {
      width: 0px;
    }

    100% {
      width: 14px;
    }
  }

  @keyframes windows-border-bottom-deselect {
    0% {
      width: 14px;
    }

    100% {
      width: 0px;
    }
  }

  @keyframes windows-button-selected {
    0% {
      transform: scale(1);
    }

    10% {
      transform: scale(0.6);
    }

    40% {
      transform: scale(1) translateY(-4px);
    }

    60% {
      transform: scale(1.2);
    }

    80% {
      transform: scale(1.2) translateY(2px);
    }

    100% {
      transform: scale(1.2) translateY(0px);
    }
  }

  @keyframes windows-button-deselect {
    0% {
      transform: scale(0.9);
    }

    100% {
      transform: scale(1);
    }
  }
</style>
