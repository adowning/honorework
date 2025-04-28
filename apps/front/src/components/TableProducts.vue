<script setup>
import { eventBus } from '@/composables/eventBus'
import { useShopStore } from '@/stores/shop'
import { computed, ref } from 'vue'

defineProps({
  checkable: Boolean
})

const shop = useShopStore()

const items = computed(() => shop.products)

const isModalActive = ref(false)

const isModalDangerActive = ref(false)

const perPage = ref(5)

const currentPage = ref(0)

const itemsPaginated = computed(() =>
  items.value.slice(perPage.value * currentPage.value, perPage.value * (currentPage.value + 1))
)

function purchase(product) {
  store.purchase(product)
  eventBus.emit('noMoney', false)
}

// function remove(arr, cb) {
//   const newArr = []

//   arr.forEach((item) => {
//     if (!cb(item)) {
//       newArr.push(item)
//     }
//   })

//   return newArr
// }

function checked(isChecked, product) {
  console.log(product)
  product.isSelected = true
  console.log(itemsPaginated)
  itemsPaginated.value.forEach((item) => {
    item.isSelected = false
    if (item.id === product.id) item.isSelected = true
  })
  // if (isChecked) {
  //   checkedRows.value.push(product)
  // } else {
  //   checkedRows.value = remove(checkedRows.value, (row) => row.id === product.id)
  // }
}
</script>

<template>
  <CardBoxModal v-model="isModalActive" title="Sample modal">
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <CardBoxModal v-model="isModalDangerActive" title="Please confirm" button="danger" has-cancel>
    <p>Lorem ipsum dolor sit amet <b>adipiscing elit</b></p>
    <p>This is sample modal</p>
  </CardBoxModal>

  <!-- <table> -->
  <!-- <thead> -->
  <!-- <tr> -->
  <!-- <th v-if="checkable" /> -->
  <!-- <th /> -->
  <!-- <th>Name</th>
        <th>Company</th>
        <th>City</th>
        <th>Progress</th>
        <th>Created</th>
        <th /> -->
  <!-- </tr> -->
  <!-- </thead> -->
  <!-- <tbody> -->
  <div class="flex flex-col relative h-[50vh] overflow-y-auto overflow-x-hidden">
    <div class="knight relative grid grid-cols-5 px-1 pl-2 my-1 pb-2 pt-1 items-center color-white"
      style="color: white; width: 98%; background-repeat: no-repeat; background-size: 100%" :style="{
        backgroundImage: `url(${product.bestValue === true ? '/images/shop/shopbar-selected.avif' : '/images/shop/shopbar.avif'})`,
      }" v-for="product in itemsPaginated" :key="product.id" @click="checked(true, product)">
      <!-- <td class="border-b-0 lg:w-6 before:hidden"> -->
      <!-- <UserAvatar :username="product.name" class="w-24 h-24 mx-auto lg:w-6 lg:h-6" /> -->
      <!-- </td> -->

      <div data-label="amountToReceiveInCredits" class="flex flex-row text-lg gap-2">
        <!-- <span> -->
        <!-- <div> -->
        <img src="/images/shop/shopcoin.avif" height="30" width="30">
        <!-- </div> -->
        <!-- <div style="font-size: 30px; font-weight: 700; color: white"> -->
        {{ product.amountToReceiveInCredits }}
        <!-- </div> -->
        <!-- </span> -->
      </div>
      <div />
      <div style="
          background-image: url('/images/freespins.png');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          /* width: 100px; */
          height: 90%;
          /* margin-left: 14px;
                  margin-right: 14px; */
        " :style="`filter: ${product.bonusSpins === 0 ? 'grayscale(100%)' : 'grayscale(0%)'}`">
        <div class="bungee flex flex-grow" style="
            -webkit-text-stroke: 0.5px black;
            /* position: absolute; */
            color: white;
            padding: 17px;
            padding-left: 28px;
            padding-top: 12px;
            top: 16px;
            left: 20px;
            font-weight: 900;
            font-size: 17px;
          ">
          {{ product.bonusSpins }}
        </div>
      </div>
      <div data-label="priceInCents" class="flex w-full justify-center">
        ${{ product.priceInCents / 100 }}.00
      </div>
      <!-- <td data-label="Progress" class="lg:w-32">
          <progress class="flex w-2/5 self-center lg:w-full" max="100" :value="product.progress">
            {{ product.progress }}
          </progress>
        </td>
        <td data-label="Created" class="lg:w-1 whitespace-nowrap">
          <small class="text-gray-500 dark:text-slate-400" :title="product.created">{{
            product.created
          }}</small>
        </td> -->
      <div class="">
        <!-- <BaseButtons type="justify-start justify-end" no-wrap> -->
        <!-- <BaseButton color="info" :icon="mdiEye" small @click="isModalActive = true" /> -->
        <GlassButton @click="purchase(product)">
          BUY
        </GlassButton>

        <!-- <BaseButton
              color="danger"
              :icon="mdiTrashCan"
              small
              @click="isModalDangerActive = true"
            /> -->
        <!-- </BaseButtons> -->
      </div>
    </div>

    <div class="flex w-full justify-center mx-3 mt-3 items-centers" style="color: white">
      You may purchases an unlimited amount of coins until the beta tournament. During the
      tournament coins will have a daily limit.
    </div>
  </div>
  <!-- </tbody> -->
  <!-- </table> -->
  <!-- <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <BaseLevel>
      <BaseButtons>
        <BaseButton
          v-for="page in pagesList"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="currentPage = page"
        />
      </BaseButtons>
      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>
    </BaseLevel>
  </div> -->
</template>

<style scoped>
.knight {
  font-family: 'knight', serif;
}

.bungee {
  font-family: 'Bungee', serif;
  font-weight: 400;
  font-style: normal;
}
</style>
