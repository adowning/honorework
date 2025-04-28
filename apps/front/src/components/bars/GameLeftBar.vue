<script lang="ts" setup>
import { eventBus } from '@/composables/eventBus'
// import { useSocketStore } from '@/stores/socket'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'

defineProps(['currentUser', 'activeGame'])

const showNav = ref(false)
const activeViewId = ref('race')
const pendingTransactions = ref<any[]>([])
const userStore = useUserStore()
const incomingMessage = ref<'string' | null>(null)
const target = ref()
const timeToExpire = ref<any>({})
const currentUser = userStore.currentUser
const trans = currentUser.purchases

async function setPending(transaction?: string | undefined) {
  if (transaction === undefined) {
    console.log(userStore.getCurrentUser)
    let t
    if (userStore.getCurrentUser.activeAccount !== undefined) {
      t = userStore.getCurrentUser.activeAccount.purchases
    }
    if (t !== undefined) {
      t.forEach((purch: { status: string }) => {
        if (purch.status === 'PENDING_PAYMENT') {
          transaction = purch
        }
      })
    }
  }
  let p
  if (typeof transaction === 'string') {
    p = JSON.parse(transaction)
  } else {
    p = transaction
  }
  if (p === null || p === undefined) {
    return
  }
  if (p.status === 'PENDING_PAYMENT') {
    const created = new Date(p.createdAt)
    const time = created.getTime() + 3600000 - new Date().getTime()
    const countdown = useCountDown({
      time: +time,
      millisecond: true,
      onChange: (current) => $bus.$emit(eventTypes.update_player, current),
      // onFinish: () => $bus.$emit(eventTypes.is_loading, false),
    })
    countdown.start()
    timeToExpire.value = current
  }
}
if (trans !== undefined) {
  trans.forEach((purch) => {
    if (purch.status === 'PENDING_PAYMENT') {
      const created = new Date(purch.createdAt)
      const time = created.getTime() + 3600000 - new Date().getTime()
      console.log(created.getTime() + 3600000)
      const countdown = useCountDown({
        time: +time,
        millisecond: true,
        // onChange: current => $emit('change', current),
        // onFinish: () => emit('finish'),
      })
      countdown.start()
      current.value = countdown.current
      pendingTransactions.value.push(purch)
    }
    // incomingMessage.value = 'change'
    setTimeout(() => {
      incomingMessage.value = null
    }, 3000)
  })
}
</script>

<template>
  <div
    ref="target"
    id="leftBar"
    class="tbar animate__animated animate__slideInLeft justify-center items-center flex"
    style="
      position: absolute;
      top: 0px;
      left: 0px;
      gap: 0px;
      background-image: url('/images/leftbar-back.webp');
      background-size: contain;
      background-position: right;
      background-repeat: no-repeat;
      margin: 0px;
      padding: 0px;
      background-size: cover;
      z-index: 99;
      height: 100vh;
      width: 67px;
    "
  >
    <!-- <img v-if="showExit === true" style="width: 52px; height: 52px" src="/images/exit.avif" /> -->
    <div ref="target" class="tbar animate__animated animate__slideInUp flex">
      <div v-if="currentUser !== undefined" class="flex flex-row">
        <div class="m-1" @click="showNav = !showNav">
          <GameLeftAvatar
            :current-user
            active-game="null"
            @click="eventBus.emit('change_page', 5)"
          />
        </div>
        <div class="flex flex-col color-white justify-end items-end">
          <div
            v-if="pendingTransactions.length !== 0"
            class="w-full flex flex-row"
            style="height: 20px; font-size: 16px; font-weight: 600"
          >
            <img src="/images/cashappicon.avif" width="20px" style="margin-right: 7px" />
            expires: {{ timeToExpire.minutes }}m
          </div>
          <div
            v-else
            class="w-full flex flex-row justify-end"
            style="height: 30px; font-size: 26px; font-weight: 600"
          />
          <!-- <div class="glow-light flex flex-row items-end justify-end ml-2 pt-2 absolute bottom-0 left-17" style="
              z-index: 999;
              line-height: 1;
              max-height: 30px;
              font-size: 23px;
              font-weight: 600;
            ">
            <img src="/images/shopcoin.avif" width="30px" height="30px" style="margin-right: 2px; padding-bottom: 2px">
            <div class="flex pt-2 mt-2 justify-end items-end absolute bottom-0 left-9 zIndex-22">
              {{ playerBalance }}
            </div>
          </div> -->
        </div>
      </div>
      <div
        class=""
        style="
          position: absolute;
          bottom: 13px;
          margin: auto;
          margin-left: 3px;
          gap: 0px;
          z-index: 99;
          width: 90%;
        "
      >
        <img src="/images/settings.avif" @click="router.push('/agent')" />
      </div>
    </div>
    <ModalNav :showNav :activeViewId v-if="showNav" />
  </div>
</template>

<style scoped>
.tbar {
  background-size: cover;
  position: absolute;
  height: 100vh;
  /* background-position: center; */
  top: 0px;
  left: 0px;
  /* background-repeat: no-repeat; */
  /* background: #8E2DE2; */
  /* fallback for old browsers */
  /* background: -webkit-linear-gradient(to bottom, #4A00E0, #8E2DE2); */
  /* Chrome 10-25, Safari 5.1-6 */
  /* background: linear-gradient(to bottom, #4A00E0, #8E2DE2); */
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  /* background-image: url('/images/topback.png'); */
}

.moveout {
  animation: moveout 0.32s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate(50, 0, 0);
}

@keyframes moveout {
  100% {
    transform: translate3d(-50px, 0, 0);
  }
}
</style>
