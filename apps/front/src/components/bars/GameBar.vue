<script lang="ts" setup>
import { useSocket } from '@/stores/socket'
import { ref } from 'vue'

defineProps(['currentUser', 'activeGame'])

const pendingTransactions = ref<any[]>([])
const current = ref()
const userStore = useUserStore()
const incomingMessage = ref<'string' | null>(null)
const target = ref()
const timeToExpire = ref<any>({})
const w = useDomWidth()
const user = userStore.getCurrentUser
const trans = user.value?.activeAccount.purchases
const playerBalance = ref<number>(0)

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
      onChange: current => $bus.$emit(eventTypes.update_player, current)
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
        millisecond: true
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

// $bus.$on(eventTypes.setPending, setPending)

onActivated(() => {
  console.log('on activated')
})

const socketStore = useSocket()

watch(toRef(socketStore, 'socketData'), (newValue) => {
  // console.log('myItems changed:', newValue, oldValue)
  playerBalance.value = newValue.new_balance
  // Perform actions based on the change
}, { deep: true })
</script>

<template>
  <div>
    <div
class="" style="
        position: absolute;
        top: -3px;
        right: -2px;
        gap: 0px;
        margin: 0px;
        padding: 0px;
        background-size: cover;
        z-index: 99;
        height: 50px;
      "
>
      <!-- <img v-if="showExit === true" style="width: 52px; height: 52px" src="/images/exit.avif" /> -->
    </div>
    <div
ref="target" class="tbar animate__animated animate__slideInUp flex"
      :style="`z-index: 9999999; max-width: ${w + 5}px; width: ${w + 5}px`"
>
      <div v-if="currentUser !== undefined" class="flex flex-row">
        <div style="transform: translateY(-20px)">
          <GamePlayerAvatar :current-user active-game="null" @click="$bus.$emit(eventTypes.change_page, 5)" />
        </div>
        <div class="flex flex-col color-white justify-end items-end">
          <div
v-if="pendingTransactions.length !== 0" class="w-full flex flex-row"
            style="height: 20px; font-size: 16px; font-weight: 600"
>
            <img src="/images/cashappicon.avif" width="20px" style="margin-right: 7px">
            expires: {{ timeToExpire.minutes }}m
          </div>
          <div
v-else class="w-full flex flex-row justify-end"
            style="height: 30px; font-size: 26px; font-weight: 600"
/>
          <div
class="glow-light flex flex-row items-end justify-end ml-2 pt-2 absolute bottom-0 left-17" style="
              z-index: 999;
              line-height: 1;
              max-height: 30px;
              font-size: 23px;
              font-weight: 600;
            "
>
            <img src="/images/shopcoin.avif" width="30px" height="30px" style="margin-right: 2px; padding-bottom: 2px">
            <div class="flex pt-2 mt-2 justify-end items-end absolute bottom-0 left-9 zIndex-22">
              {{ playerBalance }}
            </div>
          </div>
        </div>
      </div>
      <div
class="" style="
          position: absolute;
          top: -3px;
          right: 2px;
          gap: 0px;
          margin: 0px;
          padding: 0px;
          background-size: cover;
          z-index: 99;
          height: 50px;
        "
>
        <img style="width: 52px; height: 52px" src="/images/settings.avif" @click="router.push('/agent')">
      </div>
    </div>
    <div
v-if="incomingMessage !== null" class="futex-cell-2 glow-light animate__animated animate__slideInDown"
      style="position: absolute; top: 10px; width: 90vw; margin: auto; z-index: 9999"
>
      Payment status changed to: <br>
      <h3>{{ incomingMessage }}</h3>
      <!-- <SnowFlake /> -->
    </div>
  </div>
</template>

<style scoped>
.tbar {
  background-size: cover;
  position: absolute;
  height: 47px;
  background-position: center;
  bottom: 0px;
  left: 0px;
  background-repeat: no-repeat;
  background-image: url('/images/topback.png');
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
