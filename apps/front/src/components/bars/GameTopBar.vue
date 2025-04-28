<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { eventBus } from "@/composables/eventBus";
import { useUserStore } from "@/stores/user";
import { ref } from "vue";
const props = defineProps({
  developer: {
    type: String,
  },
  currentBalance: {
    type: Number,
    default: 0,
  },
});

const noMoney = ref(false);
const router = useRouter();
const { api } = useRequest();
const countdownActive = ref(false);
const userStore = useUserStore();
const currentUser = userStore.currentUser;
console.log("cu", currentUser);
const playerBalance = ref<number>(0);
playerBalance.value = props.currentBalance;
const pendingTransactions = computed(() =>
  currentUser.purchases.filter((t) => t.status === "PENDING_PAYMENT")
);
const incomingMessage = ref<"string" | null>(null);
const target = ref();
const { width: w } = useWindowSize();
const trans = currentUser.purchases;
const remaining_minutes = ref(0);
const remaining_seconds_display = ref(0);
const interval = ref();
const vipPointsChange = ref();
const sparkle = ref(false);
const fired = ref(false);
const currentVipPoints = ref(0);

function confirm() {
  noMoney.value = false;
  router.push("/");
}
function countdownTimer(start_date: Date): void {
  // Calculate the end date, which is one hour after the start date
  const end_date = new Date(start_date.getTime() + 3600000); // One hour later

  // Calculate the difference between the end date and now
  const now = new Date();
  const time_difference = end_date.getTime() - now.getTime();

  // Convert the time difference to seconds
  const total_seconds = Math.floor(time_difference / 1000);

  // Calculate minutes and seconds
  const minutes = Math.floor(total_seconds / 60);
  const seconds = total_seconds % 60;

  // Print the initial countdown
  console.log(`Countdown: ${minutes} minutes and ${seconds} seconds`);

  // Start the countdown
  let remaining_seconds = total_seconds;
  interval.value = setInterval(() => {
    // Calculate remaining minutes and seconds
    remaining_minutes.value = Math.floor(remaining_seconds / 60);
    remaining_seconds_display.value = remaining_seconds % 60;

    // Print the remaining time
    // console.log(
    //   `Countdown: ${remaining_minutes.value} minutes and ${remaining_seconds_display.value} seconds`,
    // )

    // Decrease the remaining seconds by one
    remaining_seconds -= 1;

    // Stop the countdown when it reaches zero
    if (remaining_seconds < 0) {
      clearInterval(interval.value);
      console.log("Countdown finished!");
      pendingTransactions.value.splice(0, 3);
      api.transactionControllerCancelPending.send();
    }
  }, 1000);
  countdownActive.value = true;
}
eventBus.on("noMoney", () => {
  console.log("nomoney ", currentUser.cashtag);
  if (
    currentUser.cashtag !== "" &&
    currentUser.cashtag !== undefined &&
    currentUser.cashtag !== null
  ) {
    noMoney.value = true;
  } else {
    console.log("shopOpen ");
    eventBus.emit("shopOpen", true);
  }
});

if (trans !== undefined) {
  trans.forEach((purch) => { });
}
watch(currentUser, (oldVal, newVal) => {
  console.log(oldVal.vipPoints);
  console.log(newVal.vipPoints);
  console.log(newVal.vipPoints - oldVal.vipPoints);
  if (newVal.vipPoints - currentVipPoints.value > 0) {
    if (fired.value === false) {
      console.log("spark it up ");
      eventBus.emit("startExpStarAnimation", "true");
      fired.value = true;
      setTimeout(() => {
        fired.value = false;
      }, 3500);
    }
    sparkle.value = true;
    currentVipPoints.value = newVal.vipPoints;
    setTimeout(() => {
      sparkle.value = false;
    }, 1500);
    setTimeout(() => {
      fired.value = false;
    }, 3500);
  }
  if (newVal.cashtag !== oldVal.cashtag) {
  }
  // if (newVal < 0) {
  //   noMoney.value = true
  // }
});
watch(userStore.currentUser.purchases, (newVal) => {
  console.log(newVal);
  const pendings = newVal.find(
    (purch: { status: string }) => purch.status === "PENDING_PAYMENT"
  );
  if (pendings) {
    countdownTimer(new Date(pendings.createdAt));
  }
});
eventBus.on("updatePurchases", (newVal) => {
  console.log(newVal);
  console.log(pendingTransactions.value);
  if (newVal.status !== "PENDING_PAYMENT") {
    if (newVal.id === pendingTransactions.value[0].id) {
      clearInterval(interval.value);
      console.log("Countdown finished!");
      pendingTransactions.value.splice(0, 3);
      console.log(pendingTransactions.value);
      countdownActive.value = false;
    }
  } else {
    pendingTransactions.value.push(newVal);
    countdownTimer(new Date(newVal.createdAt));
  }
});
eventBus.on("updateBalanceSpinCost", (newVal) => {
  playerBalance.value = newVal;
});
eventBus.on("updateBalanceWin", (newVal) => {
  playerBalance.value = newVal;
});
onMounted(() => {
  if (pendingTransactions.value.length > 0) {
    countdownTimer(new Date(pendingTransactions.value[0].createdAt));
  }
  playerBalance.value = userStore.currentUser.balance;
});
onUnmounted(() => {
  noMoney.value = false;
  // currentVipPoints.value = currentUser.value.vipPoints;
});
// const socketStore = useSocket()
function exit() {
  router.push("/");
  // location.reload();
}
</script>

<template>
  <div style="
      position: absolute;
      top: -3px;
      right: -2px;
      gap: 0px;
      margin: 0px;
      padding: 0px;
      background-size: cover;
      z-index: 2;
      height: 50px;
    " class="animate__animated animate__slideInDown animate__delay-1s" />
  <div v-if="currentUser !== undefined" ref="target" class="tbar animate__animated animate__slideInDown flex"
    :style="`z-index: 2; max-width: ${w}px; width: ${w + 2}px`">
    <div v-if="currentUser !== undefined" class="flex flex-row bg-transparent" style="background: transparent">
      <PlayerAvatar :sparkle :current-user @click="console.log('fixme') /*$bus.$emit(eventTypes.change_page, 5)*/" />

      <div class="flex flex-col color-white pl-1 pb-1 text-center">
        <div v-if="countdownActive" class="w-full flex flex-row"
          style="height: 20px; font-size: 16px; font-weight: 600">
          <img src="/images/cashappicon.avif" width="20px" style="margin-right: 7px" />
          ends:
          {{
            remaining_minutes > 1
              ? `${remaining_minutes}m`
              : `0m:${remaining_seconds_display}`
          }}
        </div>
        <div v-else class="w-full flex flex-row" style="height: 10px; font-size: 26px; font-weight: 600" />
        <div class="glow-light flex flex-row items-center justify-center" style="
            z-index: 999;
            line-height: 24px;
            text-align: center;
            height: 30px;
            min-width: 100px;
            font-size: 23px;
            padding-top: 0px;
            padding-left: 10px;
            margin-top: 4px;
            margin-left: 6px;
            font-weight: 600;
            background-size: cover;
            background-image: url('/images/money_backing.png');
          ">
          <div class="flex justify-center glow" style="line-height: 0.7; text-align: center">
            <div class="flex justify-center glow">
              {{ currentUser.balance > 0 ? currentUser.balance : 0 }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="" style="
        position: absolute;
        top: -3px;
        right: 5px;
        gap: 0px;
        margin: 0px;
        padding: 0px;
        background-size: cover;
        z-index: 99;
        height: 50px;
      ">
      <img style="width: 52px; height: 52px; z-index: 999999" src="@/assets/bars/exit.avif" @click="exit" />
    </div>
  </div>
  <div v-if="incomingMessage !== null" class="futex-cell-2 glow-light animate__animated animate__slideInDown"
    style="position: absolute; top: 10px; width: 90vw; margin: auto; z-index: 9999">
    Payment status changed to: <br />
    <h3>{{ incomingMessage }}</h3>
    <!-- <SnowFlake /> -->
  </div>
  <!-- <div v-if="noMoney"> -->
  <CardBoxModal title="Out of Coins" button="green" @confirm="confirm" button-label="OK" :has-cancel="false"
    :model-value="noMoney">
    <TableProducts />
  </CardBoxModal>

  <!-- </div> -->
</template>

<style scoped>
  .tbar {
    background-size: 100% 100%;
    position: absolute;
    height: 57px;
    /* background-position: center; */
    top: 0px;
    left: 0px;
    background-repeat: no-repeat;
    background-image: url("/images/topback.png");
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
