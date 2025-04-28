<script setup>
import LeaderJson from '@/assets/anim/leadernew.json'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { eventBus } from '@/composables/eventBus'

const target = ref()

const userStore = useUserStore
const currentUser = userStore.currentUser
const showFab = ref(true)
const pressed = ref(false)
const isMobile = useIsMobile()
const shopOpen = ref(false)
const leaderBoardOpen = ref(false)

function changeShopOpen() {
  shopOpen.value = true
  console.log(shopOpen.value)
  eventBus.emit('shopOpen', shopOpen.value)
}
function changeLeaderBoardOpen() {
  console.log(leaderBoardOpen)
  leaderBoardOpen.value = true
  eventBus.emit('leaderBoardOpen', leaderBoardOpen.value)
}
function changeWheelPageOpen() {
  pressed.value = !pressed.value
  leaderBoardOpen.value = true
  eventBus.emit('wheelPageOpen', wheelPageOpen.value)
}
</script>

<template>
  <div
    ref="target"
    class="bbar animate__animated animate__slideInUp flex"
    style="width: 100vw"
    :style="isMobile === false ? 'max-width: 480px' : ''"
  >
    <!-- <BaseLevel> -->
    <div
      class="animate__animated animate__slideInUp animate__delay-1s flex flex-row justify-center gap-12 px-8"
      style="
        width: 100%;
        z-index: 888;
        background-image: url('/images/slice.avif');
        background-size: contain;
      "
    >
      <div
        class="items-end justify-center"
        style="display: flex; flex-wrap: nowrap; grid-gap: 0px; padding: 2px"
      >
        <div class="wn-btn-item" @click="changeWheelPageOpen">
          <WheelIcon
            :pressed="pressed"
            :current-user="currentUser"
            style="z-index: 999; margin-bottom: 35px; margin-left: -32px"
          />
        </div>
        <div class="flex" />

        <div class="wn-btn-item mx-3" @click="changeLeaderBoardOpen()">
          <VGSprite
            id="leader"
            class="flex"
            image-src="/images/bottom/leadernew.png"
            :sprite-sheet-data="LeaderJson"
            style="background-repeat: no-repeat; z-index: 10; margin-top: -63px; margin-right: -1px"
            :speed="30"
            :delay="3500"
            :offset="12000"
            :autoplay="true"
          />
          <span class="glow rounded-lg bg-black px-1" style="font-size: 16px; line-height: 1.3"
            >Battles</span
          >
        </div>
        <div class="wn-btn-item mr-3" @click="changeShopOpen">
          <img
            src="/images/deposit.avif"
            style="
              background-repeat: no-repeat;
              z-index: 10;
              height: 70px;
              padding-top: 1px;
              margin-bottom: 2px;
            "
          />
          <span
            class="glow align-center justify-center rounded-lg bg-black px-1"
            style="font-size: 16px; line-height: 1.3"
            >Deposit</span
          >
        </div>
      </div>

      <div
        v-if="showFab"
        class="chatbutton w-full items-end justify-end"
        @click="generalSetSidebarMobile(generalSidebarMobile === 'Chat' ? null : 'Chat')"
      >
        <div
          style="
            position: absolute;
            right: 4px;
            bottom: 10px;
            background-repeat: no-repeat;
            padding: 0px;
            margin-top: -55px;
            background-size: cover;
            min-height: 90px;
            height: 90px;
            z-index: 99999;
            width: 90px;
            /* margin-left: 50px; */
            background-image: url('/images/bottom/bottombarback-center2.avif');
          "
        />
      </div>
    </div>
    <!-- </BaseLevel> -->
  </div>
</template>

<style scoped>
.bbar {
  background-size: cover;
  position: absolute;
  height: 47px;
  background-position: center;
  bottom: 0px;
  left: 0px;
  background-repeat: no-repeat;
}

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
  height: 70%;
  max-height: 70px;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
  position: relative;
}
</style>
