<script setup lang="ts">
import { Game } from '@/hyper-fetch.request'
import { useShopStore } from '@/stores/shop'
import { onMounted } from 'vue'

defineEmits(['loadGame'])

const shopStore = useShopStore()
const router = useRouter()
const loading = ref(false)
const groups = ref<any>([])
const featuredList = ref<any[]>([])
const pages = ref(0)
const standardList = ref<any[]>([])
const isMobile = false
const games = shopStore.gameList
async function loadGame(game: any) {
  const token = localStorage.getItem('access_token')
  // console.log(game.developer)
  if (game.developer === 'netgame') {
    return await router.push(`/games/netgame/?gameName=${game.name}&token=${token}`)
  }
  if (game.developer === 'netent') {
    return await router.push(`/games/netent/?gameName=${game.name}&token=${token}}`)
  }
  if (game.developer === 'nolimit') {
    return await router.push(`/games/nolimit/?gameName=${game.name}&token=${token}}`)
  }
  if (game.developer === 'redtiger') {
    return await router.push(`/games/redtiger/?gameName=${game.name}&token=${token}}`)
  }
  // await router.push(`/games/redtiger/${game.name}.html`)

  //  window.location.reload()
}

// function shuffle(array: string | any[]) {
//   let currentIndex = array.length
//   while (currentIndex !== 0) {
//     const randomIndex = Math.floor(Math.random() * currentIndex)
//     currentIndex--
//     // @ts-ignore
//     ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
//   }
//   return array
// }
const flist: any[] = []
const slist: any[] = []
const fish: any[] = []
const topslots: any[] = []
const bottomslots: any[] = []
let index = 0
const scrollerHeight = ref('26px')
if (isMobile) {
  scrollerHeight.value = '0px'
}
let q = 0
const seenNames = new Set()
const uniqueGames = games.filter((game: Game) => {
  if (seenNames.has(game.name)) {
    return false
  } else {
    seenNames.add(game.name)
    return true
  }
})

uniqueGames.forEach((_game: any) => {
  const game = JSON.parse(JSON.stringify(_game))
  const rtpar = Math.floor(Math.random() * 10)
  if (rtpar > 8) {
    game.temperature = 'hot'
  }
  if (rtpar <= 2) {
    game.temperature = 'cold'
  }
  if (rtpar <= 8 && rtpar > 2) {
    game.temperature = 'none'
  }
  if (game.featured) {
    if (flist.filter(item => item.id === game.id).length === 0) {
      flist.push(game)
    }
  } else {
    if (
      game.developer !== 'BigFishGames'
      && slist.filter(item => item.id === game.id).length === 0
    ) {
      slist.push(game)
    }
  }
  if (game.gamebank === 'fish' && fish.filter(item => item.id === game.id).length === 0) {
    fish.push(game)
  } else {
    if (index % 2 === 0) {
      if (game.developer !== 'BigFishGames' && game.isActive) {
        topslots.push(game)
      }
    } else {
      if (game.developer !== 'BigFishGames' && game.isActive) {
        bottomslots.push(game)
      }
    }
  }
  index++
  // @ts-ignore
  // slist = shuffle(slist)
})
const groups2 = []
flist.forEach((game) => {
  groups2.push(game)
})
const rem = Math.floor(slist.length / 2)
for (let u = 0; u < rem; u++) {
  groups2.push([slist[u * 2], slist[u * 2 + 1]])
}
featuredList.value = flist
standardList.value = slist
if (flist.length === 0) {
  flist.push(games[0])
  flist.push(games[1])
  flist.push(games[2])
  flist.push(games[3])
}
// featuredList.value.shift()
let n = 0
const totalGroupNum = Math.floor(games.length / 4)

for (let x = 0; x < totalGroupNum; x++) {
  const group: any[] = []
  if (x < flist.length) {
    const game = flist[x]
    if (q > 17) {
      game.vipLevel = 5
    }
    if (q > 24) {
      game.vipLevel = 10
    }
    if (q > 37) {
      game.vipLevel = 15
    }

    if (game.developer !== 'BigFishGames') {
      group.push(game)
      for (let l = 0; l < 3; l++) {
        if (slist[l + n * 4] !== undefined) {
          if (q > 15) {
            slist[l + n * 4].vipLevel = 5
          }
          if (q > 30) {
            slist[l + n * 4].vipLevel = 10
          }
          if (q > 40) {
            slist[l + n * 4].vipLevel = 15
          }
          q++
          if (slist[l + n * 4].developer !== 'BigFishGames') {
            group.push(slist[l + n * 4])
          }
        }
      }
      // }

      groups.value.push(group)
      n++
    }
  } else {
    for (let d = 0; d < 4; d++) {
      group.push(slist[d + n * 4])
    }
    groups.value.push(group)
    n++
  }
}

// games.forEach((game: { title: string }) => {
//   if (game.title === 'The Crypt') {
//     groups.value[0].unshift(game)
//   }
// })
// games.forEach((game: Game) => {
//   if (game.title === 'Gaelic Gold') {
//     groups.value[0].unshift(game)
//   }
//   if (game.name.toLowerCase() === 'fireinthehole2nlc') {
//     game.developer = 'habanero'
//     //console.log(game)
//   }
// })
const remainderStart = groups.value.length * 4
const remainders = slist.splice(remainderStart)
pages.value = Math.ceil(standardList.value.length + featuredList.value.length / 5)
featuredList.value.shift()
const biglist = ref([...featuredList.value, ...standardList.value, ...remainders])
let dubs: any[] = []
let sings: any[] = []
const newgroups: any[] = []
biglist.value.forEach((game, index) => {
  if (index / 3 === 1) {
    sings.push(game)
  } else {
    dubs.push(game)
  }
  if (index / 3 === 1) {
    newgroups.push(dubs)
    newgroups.push(sings)
    sings = []
    dubs = []
  }
})

const usersData = [
  {
    name: 'Banjo Chris',
    photo: 'chris-coyier.jpg',
    description:
      'The banjo plays, giving you and your party new life. <strong>You are invincible next turn.</strong>',
    shiny: false,
    link: 'https://twitter.com/chriscoyier'
  },
  {
    name: 'Gentleman Shaw',
    photo: 'stephen-shaw.jpg',
    description:
      'You wouldn\'t harm a thing, so instead you charm the enemy. <strong>They join your party.</strong>',
    shiny: true,
    link: 'https://twitter.com/shshaw'
  },
  {
    name: 'Keycaps Cassidy',
    photo: 'cassidy-williams.jpg',
    description:
      'The MX Blue clickity clacks penetrate the enemy eardrums. <strong>Deal 56 damage.</strong>',
    shiny: false,
    link: 'https://twitter.com/cassidoo'
  },
  {
    name: 'Piano Khourshid',
    photo: 'david-khourshid.jpg',
    description:
      'Forgot his piano, resorts to reading sheet music aloud. <strong>Enemy falls asleep.</strong>',
    shiny: false,
    link: 'https://twitter.com/DavidKPiano'
  }
]

function initMouseEvents() {
  const cards = document.querySelectorAll('.card')
  // const arm = document.querySelector('.arm')

  for (let i = 0; i < cards.length; i++) {
    // cards[i].addEventListener('mouseenter', mouseEnter)
    // cards[i].addEventListener('mouseleave', mouseLeave)
  }

  // function mouseEnter(e: { target: { getBoundingClientRect: () => any } }) {
  //   // If you end up using this, don't do this on every mouse enter as it's not very performant
  //   // Do it once outside of this function and reference it
  //   const targetInfo = e.target.getBoundingClientRect()

  //   arm.removeAttribute('style')
  //   arm.style.transform = `translate(${
  //     targetInfo.left - document.body.clientWidth / 2
  //   }px, ${targetInfo.top + document.documentElement.scrollTop + 50}px)`
  // }

  // function mouseLeave() {
  //   arm.removeAttribute('style')
  //   arm.style.transition = `transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)`
  // }
}

// --------------
// Generate Cards
// --------------

const shapes = ['round', 'square', 'pointy']
// const shapePaths = {
//   round: '<ellipse cx="130" cy="111.1" rx="130" ry="111.1"/>',
//   square: '<polygon points="0,0 0,158.7 15.3,172.7 239.3,172.7 251.7,160.3 251.7,0 "/>',
//   pointy: '<polygon points="0,0 0,141.3 105.3,177.3 149.3,177.3 250.7,142 250.7,0 "/>'
// }
const cardColors = ['green', 'red', 'black']
const bannerColors = ['gold', 'blue', 'black']

class Card {
  name: string
  photo: string
  description: string
  shiny: boolean
  shape: any
  cardColor: string
  bannerColor: string
  value: number
  link: any
  constructor(
    name: string,
    photo: string,
    description: string,
    shiny: boolean,
    shape: any,
    cardColor: string,
    bannerColor: string,
    value: number,
    twitter: string
  ) {
    this.name = name
    this.photo = photo
    this.description = description
    this.shiny = shiny
    this.shape = shape
    this.cardColor = cardColor
    this.bannerColor = bannerColor
    this.value = value
    this.shiny = shiny
    this.link = twitter
  }

  getTemplate() {
    return `
    <a href="${this.link}" target="_blank" class="card card--${this.shape}">
      <div class="card__orb">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-orb-${this.cardColor
      }.png" alt="" class="card__orb__image">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-${this.value
      }.png" alt="" class="card__orb__value">
      </div>
      <div class="card__banner">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-${this.bannerColor
      }.png" alt="" class="card__banner">
        <div class="card__banner__text">${this.name}</div>
      </div>
      <div class="card__image">
        <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-frame-${this.shape
      }-${this.bannerColor}.png" alt="" class="card__image__border">
        <svg class="card__image__svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 260 222.2" style="enable-background:new 0 0 260 222.2;" xml:space="preserve">
          <clipPath id="mask-${this.shape}">
          </clipPath>
          <image clip-path="url(#mask-${this.shape})" height="100%" width="100%" ${this.shape === 'round' ? 'y="20"' : ''
      } xlink:href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-${this.photo}" />
          ${this.shiny
        ? `<image clip-path="url(#mask-${this.shape})" width="100%" xlink:href="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-sparkles.gif" class="card__image__sparkles" />`
        : ``
      }
        </svg>
      </div>
      <div class="card__description">
        <div class="card__description__text">
            ${this.description}
        </div>
      </div>
      <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-card-back-${this.cardColor
      }__${this.shape}.png" alt="" class="card__background">
    </a>
    `
  }
}
const cardsContainer = ref()

// shuffle2(usersData)

initMouseEvents()

function getRandomArrayValue(array: string | any[]) {
  const randomValue = Math.floor(Math.random() * array.length)
  return array[randomValue]
}

// function shuffle2(array: string | any[]) {
//   var currentIndex = array.length,
//     temporaryValue,
//     randomIndex

//   while (0 !== currentIndex) {
//     randomIndex = Math.floor(Math.random() * currentIndex)
//     currentIndex -= 1

//     temporaryValue = array[currentIndex]
//     array[currentIndex] = array[randomIndex]
//     array[randomIndex] = temporaryValue
//   }

//   return array
// }
onMounted(() => {
  cardsContainer.value = document.querySelector('.cards')
  usersData.forEach((user) => {
    const newCard = new Card(
      user.name,
      user.photo,
      user.description,
      user.shiny,
      getRandomArrayValue(shapes),
      getRandomArrayValue(cardColors),
      getRandomArrayValue(bannerColors),
      Math.floor(Math.random() * 9),
      user.link
    )
    if (cardsContainer.value !== null) {
      cardsContainer.value.innerHTML += newCard.getTemplate()
    }
  })
  // //console.log(filterContainerWrapper.value)
  // const loadImagesInView = setupLazyLoadImage(emblaApi.value)
  // $bus.$on(eventTypes.scroll, (event: string) => {
  //   if (event === 'next') {
  //     emblaApi.value?.scrollNext()
  //   } else {
  //     emblaApi.value?.scrollPrev()
  //   }
  // })
})
</script>

<template>
  <div class="flex flex-row animate__animated animate__lightSpeedInRight animate__delay-1s">
    <div v-if="!loading" class="max-h-[50vh] h-[50vh] overflow-x-auto overflow-y-hidden">
      <div v-for="(group, i) of groups" :key="i"
        class="flex h-[50vh] flex-row gap-0 color-white overflow-y-hidden p-1 flex-nowrap"
        style="width: 100vw; overflow-x: auto">
        <!-- <GameGalleryPosterDouble
        v-if="i == 1"
        :game1="group[0]"
        :game2="group[1]"
        :shakeIt="shakeIt"
        :currentUser="currentUser"
      >
      </GameGalleryPosterDouble> -->
        <div v-for="(game, i) of group" :key="i">
          <div v-if="game !== undefined && game != null">
            <div target="_blank" class="card card--square" @click="loadGame(game)">
              <div v-if="game.temperature !== 'none' && game.temperature !== undefined" class="card__orb"
                :style="`${i == 0 ? 'top: 28px' : ''}`">
                <img :src="`/images/games/${game.temperature === 'hot' ? 'hot' : 'cold'}.webp`" alt=""
                  class="card__orb__image">
                <!-- <img
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-5.png"
            alt=""
            class="card__orb__value"
          /> -->
              </div>
              <div :class="`${i == 0 ? 'card__banner_feat' : 'card__banner'}`">
                <img v-if="game.temperature == 'cold'"
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-blue.png" alt=""
                  class="card__banner">
                <img v-if="game.temperature == 'hot'"
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png" alt=""
                  class="card__banner">
                <img v-if="game.temperature == 'none' || !game.temperature"
                  src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-black.png" alt=""
                  class="card__banner">
                <div class="card__banner__text">
                  {{ game.title }}
                </div>
              </div>
              <div class="card__image">
                <img :src="`/images/games/${game.developer}/${game.name.toLowerCase()}.avif`" alt=""
                  class="card__image__border" :style="`${i == 0 ? 'top: 0px' : 'top:-10px'}`">
                <image clip-path="url(#mask-square)" height="100%" width="100%"
                  :xlink:href="`/images/games/${game.developer}/${game.name.toLowerCase()}.avif`" />
                <!-- </svg> -->
              </div>
              <img v-if="i === 0" src="/images/games/featured.webp" alt="" class="card__background">
              <img v-else src="/images/games/tall-field.avif" alt="" class="card__background">
              <!-- <img class="bottom_rocker" src="/images/games/vol-0.webp" alt="" /> -->
              <div class="flex bottom_rocker justify-center items-center">
                <!-- V
          <img
            src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-5.png"
            alt=""
            class="card__orb__value"
          /> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      loading....
    </div>
  </div>

</template>

<style scoped>
  .bottom_rocker {
    position: absolute;
    overflow: visible;
    bottom: 0px;
    left: 50%;
    font-size: 42px;
    font-weight: bold;
    color: #fff;
    transform: translate(-50%, -56%) scale(0.5);
    z-index: 99999;
  }

  .cards {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
  }

  .card {
    width: 50vw;
    margin-left: 10px;
    margin-left: 10px;
    position: relative;
    transition: transform 0.3s;

  }

  .card__background {
    position: relative;
    width: 100%;
    width: 100%;
    max-height: 340px;
    border-style: solid;
    max-width: 180px;
    max-height: 320px;
    min-height: 150px;
  }

  .card__image__border {
    position: absolute;
    background-size: cover;
    top: -10px;
    left: 0;
    width: 100%;
    height: 38vh;
    z-index: 2;
    border-width: 2px;
    border-color: #ffffff;
    border-radius: 10px;

  }


  /* @media (max-width: 779px) {
  .card {
    margin: 10px;
  }
} */
  /*
.card:hover {
  transform: scale(1.2);
  transition: transform 0.15s;
  cursor: pointer;
} */


  .card__banner {
    width: 100%;
    position: absolute;
    top: 5%;
    left: 51%;
    transform: translateX(-51.5%) scaleY(1.1);
    background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0 no-repeat;
    background-size: 100% auto;
    z-index: 4;
  }

  .card__banner_feat {
    width: 100%;
    position: absolute;
    top: 10%;
    left: 51%;
    transform: translateX(-51.5%);
    background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/49240/hand-banner-gold.png') 0 0 no-repeat;
    background-size: 100% auto;
    z-index: 4;
  }

  .card__banner__text {
    width: 90%;
    position: absolute;
    flex-wrap: nowrap;
    top: -2px;
    left: 50%;
    transform: translate(-51%, 10%);
    z-index: 5;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.7);
  }

  .card__image {
    width: 82%;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
  }

  .card--square .card__image {
    top: 13%;
    background-size: cover;
  }

  .card--round .card__image {
    top: 2%;
  }

  .card--pointy .card__image {
    top: 13.5%;
    width: 79%;
    left: 46.5%;
  }



  .card__image__svg {
    width: calc(100% - 2px);
    position: absolute;
    top: -10px;
    left: 2px;
    z-index: 3;
  }

  .card--square .card__image__svg {
    top: -5px;
  }

  .card--round .card__image__svg {
    top: -0px;
  }

  .card--pointy .card__image__svg {
    top: -4px;
  }

  .card__image__sparkles {
    mix-blend-mode: color-dodge;
  }

  .card__description {
    width: 80%;
    height: 37%;
    position: absolute;
    bottom: 0%;
    left: 50%;
    transform: translateX(-53%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px;
    color: #eae3d1;
    font-size: 14px;
    /* line-height: 1.2;
  text-align: center;
  font-weight: 400;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3); */
  }

  .card__description strong {
    color: #efc851;
    font-weight: 400;
  }

  .card__orb {
    width: 20%;
    position: absolute;
    top: 2%;
    left: -2%;
    z-index: 6;
  }

  .card__orb__image {
    width: 100%;
  }

  .card__orb__value {
    top: 50%;
    left: 50%;
    /* transform: translate(-50%, -50%); */
    /* margin-top: -3px;
  margin-left: -1px; */
    opacity: 1;
  }
</style>
