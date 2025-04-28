<script setup>
import { eventBus } from '@/composables/eventBus'
import { gsap } from 'gsap' // Import GSAP
import { Assets, Sprite } from 'pixi.js'
import * as PIXI from 'pixi.js'
import { onMounted, ref } from 'vue'

const container = ref(null)
const app = ref(null)
const stars = ref([])
const trails = ref([])

const NUM_PARTICLES = 200
const BASE_STAR_SIZE = 8
const VARIATION_FACTOR = 3
const TRAIL_LENGTH = 10
// const STAR_IMAGE_SRC = '/images/star.png'
let animationStarted = false // track if started.

eventBus.on('startExpStarAnimation', () => {
  // function startAnimation() {
  if (animationStarted) {
    console.log('fired ', animationStarted)
    return
  }
  animationStarted = true

  // Use GSAP to animate the stars to the top left
  stars.value.forEach((star, index) => {
    const randomDelay = Math.random() * 0.5 // Stagger the start times slightly
    gsap.to(star, {
      x: app.value.screen.width * 0.2, // Go to top left, add some variation
      y: app.value.screen.height * 0.2,
      duration: 3, // 3 seconds
      delay: randomDelay,
      ease: 'easeOutSine', // Use an easing function for a smoother animation,
      onUpdate: () => {
        // Position the trails during the animation.
        const trail = trails.value[index]
        let prevX = star.x
        let prevY = star.y
        for (let j = 0; j < TRAIL_LENGTH; j++) {
          const trailStar = trail[j]
          const blend = 0.3 + (j / TRAIL_LENGTH) * 0.5
          trailStar.x = prevX * blend + trailStar.x * (1 - blend)
          trailStar.y = prevY * blend + trailStar.y * (1 - blend)
          prevX = trailStar.x
          prevY = trailStar.y
        }
      },
      onComplete: () => {
        // optional:  do something when the animation completes
      }
    })
  })

  // 4. Animation loop (for continuous subtle movement)
  console.log(app.value._ticker)
  app.value._ticker.add((deltaTime) => {
    stars.value.forEach((star) => {
      const speed = 0.05 + Math.random() * 0.1 * VARIATION_FACTOR // Reduced speed for subtle movement
      star.x += Math.cos(star.rotation) * speed * deltaTime
      star.y += Math.sin(star.rotation) * speed * deltaTime
      star.rotation += 0.01 + Math.random() * 0.02 // Reduced rotation

      // Wrap around edges (keep this for the subtle movement)
      if (star.x > app.value.screen.width + 20) {
        star.x = -20
      }
      if (star.x < -20) {
        star.x = app.value.screen.width + 20
      }
      if (star.y > app.value.screen.height + 20) {
        star.y = -20
      }
      if (star.y < -20) {
        star.y = app.value.screen.height + 20
      }
    })
  })
})

onMounted(async () => {
  const containerEl = container.value
  if (!containerEl) {
    return
  }
  const texture = await Assets.load('/images/star.png')

  // app.value = new Application({
  //   width: containerEl.clientWidth,
  //   height: containerEl.clientHeight,
  //   backgroundAlpha: 0,
  //   resolution: Math.min(2, window.devicePixelRatio),
  //   autoDensity: true,
  // })
  app.value = new PIXI.Application()
  console.log(app)
  await app.value.init({
    width: containerEl.clientWidth,
    height: containerEl.clientHeight,
    backgroundAlpha: 0,
    resolution: Math.min(2, window.devicePixelRatio),
    autoDensity: true
  })

  containerEl.appendChild(app.value.canvas)

  // const starTexture = Sprite.from(STAR_IMAGE_SRC)
  const starTexture = new Sprite(texture)

  for (let i = 0; i < NUM_PARTICLES; i++) {
    const star = new Sprite(starTexture)
    star.width = BASE_STAR_SIZE + Math.random() * VARIATION_FACTOR
    star.height = BASE_STAR_SIZE + Math.random() * VARIATION_FACTOR
    star.anchor.set(0.5)
    // Initial positions at bottom center with random offset
    star.x = app.value.screen.width / 2 + (Math.random() - 0.5) * app.value.screen.width * 0.2 // random variation
    star.y = app.value.screen.height
    star.alpha = 0.7 + Math.random() * 0.3
    stars.value.push(star)
    app.value.stage.addChild(star)

    const starTrail = []
    for (let j = 0; j < TRAIL_LENGTH; j++) {
      const trailStar = new Sprite(starTexture)
      trailStar.width = star.width * (0.5 - j / TRAIL_LENGTH / 3)
      trailStar.height = star.height * (0.5 - j / TRAIL_LENGTH / 3)
      trailStar.anchor.set(0.5)
      trailStar.alpha = 0.8 * (1 - j / TRAIL_LENGTH)
      starTrail.push(trailStar)
      app.value.stage.addChild(trailStar)
    }
    trails.value.push(starTrail)
  }

  const resizeHandler = () => {
    if (app.value) {
      app.value.resizeViewTo = {
        width: containerEl.clientWidth,
        height: containerEl.clientHeight
      }
    }
  }

  window.addEventListener('resize', resizeHandler)

  // onUnmounted(() => {
  //   window.removeEventListener('resize', resizeHandler)
  //   if (app.value) {
  //     app.value.destroy(true, true)
  //   }
  // })
})
</script>

<template>
  <div ref="container" class="star-particle-container" />
</template>

<style scoped>
  .star-particle-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: fixed;

    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 999999;
    background-color: black;
  }
</style>
