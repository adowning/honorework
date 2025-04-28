<script lang="ts" setup>
const active = ref('home')
function setActive(tab: string) {
  console.log(tab)
  active.value = tab
  eventBus.emit('changeStaffView', tab)
  // $bus.$emit(eventTypes.change_agent_tab, tab)
}
</script>

<template>
  <div
    class="fixed flex w-full bottom-0 left-0 z-50 items-end"
    style="
      height: 80px;
      background-image: url('/images/bottom/agent/staff-nav-bg.avif');
      background-size: 100% 100%;
      background-repeat: no-repeat;
    "
  >
    <div name="orders" @click="setActive('orders')">
      <div
        v-if="active === 'orders'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
      <div v-else class="flex flex-col justify-end items-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
    </div>
    <div name="players" @click="setActive('players')">
      <div
        v-if="active === 'players'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/friends-icon.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/friends-icon.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
    </div>
    <div name="home" @click="setActive('home')">
      <div
        v-if="active === 'home'"
        class="flex flex-col items-end justify-end"
        style="
          background-image: url('/images/bottom/agent/lobby-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 80px;
          width: 100%;
        "
      >
        <img
          src="/images/bottom/agent/lobby-icon.png"
          style="width: 90%; margin: auto; margin-top: 25px"
        >
      </div>
      <div
        v-else
        class="flex flex-col items-end justify-end"
        style="background-size: 100% 100%; width: 100%; height: 80px; width: 100%"
      >
        <img
          src="/images/bottom/agent/lobby-icon.png"
          style="width: 90%; margin: auto; margin-top: 25px"
        >
      </div>
    </div>
    <div name="games" @click="setActive('games')">
      <div
        v-if="active === 'games'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
    </div>
    <div name="" @click="setActive('settings')">
      <div
        v-if="active === 'settings'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/clubs-icon.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/clubs-icon.png"
          height="55"
          style="width: 95%; margin: auto; margin-top: 15px"
        >
      </div>
    </div>
  </div>
  <!-- <div
    v-model="active"
    style="
      background-image: url('/images/bottom/agent/staff-nav-bg.avif');
      background-size: 100% 100%;
      background-repeat: no-repeat;
      height: 80px;
    "
    class="items-end"
  >
    <div name="orders" @click="setActive('orders')">
      <div
        v-if="active === 'orders'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
    </div>
    <div name="players" @click="setActive('players')">
      <div
        v-if="active === 'players'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/friends-icon.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/friends-icon.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
    </div>
    <div name="home" @click="setActive('home')">
      <div
        v-if="active === 'home'"
        class="flex flex-col items-end justify-end"
        style="
          background-image: url('/images/bottom/agent/lobby-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 80px;
          width: 100%;
        "
      >
        <img
          src="/images/bottom/agent/lobby-icon.png"
          height="78"
          style="padding-top: 10px; width: 100%; margin-left: 15px"
        />
      </div>
      <div
        v-else
        class="flex flex-col items-end justify-end"
        style="width: 100%; height: 80px; width: 100%"
      >
        <img
          src="/images/bottom/agent/lobby-icon.png"
          height="78"
          style="padding-top: 10px; width: 100%; margin-left: 15px"
        />
      </div>
    </div>
    <div name="games" @click="setActive('games')">
      <div
        v-if="active === 'games'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/shop-icon_1.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
    </div>
    <div name="" @click="setActive('settings')">
      <div
        v-if="active === 'settings'"
        class="flex flex-col justify-end"
        style="
          background-image: url('/images/bottom/agent/btn-active.png');
          background-size: 100% 100%;
          width: 100%;
          height: 74px;
        "
      >
        <img
          src="/images/bottom/agent/clubs-icon.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
      <div v-else class="flex flex-col justify-end" style="width: 100%; height: 74px">
        <img
          src="/images/bottom/agent/clubs-icon.png"
          height="55"
          style="width: 100%; margin-right: 15px"
        />
      </div>
    </div>
  </div> -->
</template>

<style>
.div--active {
  background-color: transparent !important;
}
.div {
  background-color: transparent !important;
}
.div {
  background-color: transparent !important;
}
</style>
