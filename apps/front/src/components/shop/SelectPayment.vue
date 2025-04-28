<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import { onMounted, ref } from 'vue'

const { api } = useRequest()
const userStore = useUserStore()
const currentUser = userStore.currentUser
const shop = store.shop
const activeProfile = store.currentUser
// const $bus = useEventsBus()
// const userStore = useUserStore()
const router = useRouter()
const target = ref()
// const transactionStore = useTransactionStore()
const method = ref(0)
const cashappSelected = ref(false)
const cashinstore = ref(false)
const hasPendingBalanceTransaction = ref(false)
const balancetransactionsCanceled = ref(false)
async function close() {
  // await dispatchGetCurrentUser()
  // await queryClient.invalidateQueries({ queryKey: ['user'] })
  // $bus.$emit(eventTypes.setPending)
  // target!.value!.classList.add(`animate__animated`, 'animate__bounceOut')
  // nextTick(() => {
  //   $bus.$emit(eventTypes.change_page, 0)
  //   // delay(300)
  //   $bus.$emit(eventTypes.show_bars, true)
  // })
}
async function setMethod(_method: number) {
  if (_method === 1) {
    cashappSelected.value = true
    cashinstore.value = false
    // console.log(state)
    store.shop.selectedPaymentMethod = 'CASHAPP'
  } else {
    cashappSelected.value = false
    cashinstore.value = true
    store.shop.selectedPaymentMethod = 'INSTORE'
  }
  method.value = _method
}
async function cancelBalanceTransactions() {
  await api.transactionControllerCancelPending.send()
  // // //console.log(canceled)
  await loaduser()
  // $bus.$emit(eventTypes.transaction_updated, [])
  // // //console.log(canceled)
  // // eslint-disable-next-line ts/ban-ts-comment
  // @ts-ignore
  // if (typeof canceled === 'number') {
  balancetransactionsCanceled.value = true
  setTimeout(() => {
    hasPendingBalanceTransaction.value = false
    balancetransactionsCanceled.value = false
    close()
  }, 2000)
  // }
}

onMounted(async () => {
  // const purchases = currentUser.activeAccount.purchases
  const _transactions = activeProfile.purchases
  const transactions: any[] = []
  _transactions.forEach((tran: any) => {
    // console.log(tran.status)
    if (tran.status === 'PENDING_PAYMENT') {
      transactions.push(tran)
    }
  })
  // console.log('transactions', transactions)
  if (transactions.length > 0) {
    transactions.forEach((p) => {
      if (p.status === 'PENDING_PAYMENT') {
        hasPendingBalanceTransaction.value = true
      }
    })
  }
})
</script>

<template>
  <div ref="target" class="flex flex-col w-90vw gap-4 items-center justify-center mx-4">
    <div v-if="!hasPendingBalanceTransaction">
      <div
        :class="`${store.shop.acceptedPaymentMethods.includes('CASHAPP') ? '' : 'grayscale'}`"
        class="relative my-2 w-[85vw] m-auto flex flex-row justify-start p-2 py-2 color-white"
        :style="`background-repeat: no-repeat;background-size: 100% 100%; background-image: url(${
          !cashappSelected ? '/images/shop/shopbar.avif' : '/images/shop/shopbar-selected.avif'
        });`"
        @click="setMethod(1)"
      >
        <div class="flex flex-row items-center pa-0" style="width: 20%; min-height: 40px">
          <img
            src="/images/cashappicon.avif"
            class="ml-1 px-0"
            style="width: 40px; height: 40px; margin-left: 8px"
          >
        </div>
        <div class="flex flex-row items-center pa-0 mr-12" style="min-height: 50px">
          <div style="font-size: 22px; font-weight: 600">
use cashapp
</div>
        </div>
      </div>
      <div
        :class="`${store.shop.acceptedPaymentMethods.includes('INSTORE') ? '' : 'grayscale'}`"
        class="relative my-0.5 mb-12 w-[85vw] m-auto flex flex-row justify-start p-2 py-2 color-white"
        :style="`background-repeat: no-repeat;background-size: 100% 100%; background-image: url(${
          !cashinstore ? '/images/shop/shopbar.avif' : '/images/shop/shopbar-selected.avif'
        });`"
        @click="setMethod(2)"
      >
        <div class="flex flex-row w-full items-center pa-0" style="width: 20%; min-height: 40px">
          <img
            src="/images/storebag.avif"
            class="ml-1 px-0"
            style="width: 40px; height: 50px; margin-left: 4px"
          >
        </div>
        <div class="flex flex-row items-center pa-0 mr-8" style="min-height: 40px">
          <div style="font-size: 22px; font-weight: 600">
pay in store
</div>
        </div>
        <div class="flex grow-1" />
        <div
          class="flex grow-1 flex-col items-start justify-start pa-0"
          style="position: absolute; top: 10px; right: 9px; min-height: 40px"
        >
          <div class="flex flex-col items-end">
            <div style="font-size: 12px; line-height: 1; font-weight: 600; font-style: italic">
              {{ shop.name }}
            </div>
            <div
              style="
                font-size: 12px;
                line-height: 1;
                font-weight: 700;
                color: lightskyblue;
                text-decoration: underline;
              "
            >
              change
            </div>
          </div>
        </div>
      </div>
      <div class="mb-12 flex w-full flex-row justify-center" style="margin-bottom: 150px">
        <div @click="eventBus.emit('activeName', 'shopConfirm')">
          <GlassButton :disabled="method === 0 ? true : false">
            Next
            <span class="loading loading-spinner loading-lg" />
          </GlassButton>
        </div>
      </div>
    </div>
    <div v-else>
      <div v-if="!balancetransactionsCanceled">
        <div class="futex-cell-2 glow-light">
          You already have a pending balancetransaction. Would you like to cancel it?
        </div>
        <div
          class="mx-16 mb-12 flex flex-row justify-center gap-3"
          style="margin-bottom: 150px; margin-top: 16px"
        >
          <div @click="close()">
            <GlassButton color="red">
No
</GlassButton>
          </div>
          <div @click="cancelBalanceTransactions()">
            <GlassButton color="green">
Yes
</GlassButton>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="futex-cell-2 glow-light">
BalanceTransaction cancelled
</div>
      </div>
    </div>
  </div>

  <!-- </div> -->
</template>
