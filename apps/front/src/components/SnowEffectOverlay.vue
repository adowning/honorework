<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null) // Ref to the canvas element
let ctx = null // Canvas rendering context
let particles = [] // Array to hold particle objects
const particleCount = 10 // Number of snowflakes
let animationFrameId = null // To store the requestAnimationFrame ID for cleanup

// Particle class for snowflakes
class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight - 40
    this.size = Math.random() * 3 + 1
    this.speedY = Math.random() * 1 + 0.5
    this.speedX = Math.random() * 0.5 - 0.25
    this.alpha = Math.random() * 0.8 + 0.2
    this.canvasWidth = canvasWidth // Store canvas dimensions for wrapping
    this.canvasHeight = canvasHeight
  }

  update() {
    this.y += this.speedY
    this.x += this.speedX

    // Wrap particle around if it goes off the bottom
    if (this.y > this.canvasHeight) {
      this.y = -this.size
      this.x = Math.random() * this.canvasWidth
      this.size = Math.random() * 3 + 1
      this.speedY = Math.random() * 1 + 0.5
      this.speedX = Math.random() * 0.5 - 0.25
      this.alpha = Math.random() * 0.8 + 0.2
    }
    // Wrap particle around if it goes off the sides
    if (this.x > this.canvasWidth + this.size) {
      this.x = -this.size
    } else if (this.x < -this.size) {
      this.x = this.canvasWidth + this.size
    }
  }

  draw() {
    if (ctx) {
      // Ensure context is available before drawing
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Set initial canvas size based on the parent element's dimensions
// This component is expected to be absolutely positioned inside a relative parent
const resizeCanvas = () => {
  if (canvas.value) {
    const parent = canvas.value.parentElement // Get the parent div (the overlay div)
    if (parent) {
      canvas.value.width = parent.clientWidth
      canvas.value.height = parent.clientHeight
      // Re-initialize particles for the new size
      init()
    }
  }
}

// Initialize particles
const init = () => {
  if (canvas.value) {
    particles = []
    for (let i = 0; i < particleCount; i++) {
      // Pass current canvas dimensions to particle constructor
      particles.push(new Particle(canvas.value.width, canvas.value.height))
    }
  }
}

// Animation loop
const animate = () => {
  if (ctx && canvas.value) {
    // Clear the canvas for the next frame
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // Update and draw each particle
    for (let i = 0; i < particles.length; i++) {
      particles[i].update()
      particles[i].draw()
    }

    // Request the next frame and store the ID
    animationFrameId = requestAnimationFrame(animate)
  }
}

// Lifecycle hook: runs after the component is mounted to the DOM
onMounted(() => {
  if (canvas.value) {
    ctx = canvas.value.getContext('2d')
    // We need to wait for the parent element to have its dimensions set
    // A small delay or observing the parent's size might be needed in complex layouts,
    // but for a simple image container, resizeCanvas on mount is usually sufficient.
    resizeCanvas() // Initial size setup
    init() // Initialize particles
    animate() // Start the animation loop

    // Add resize listener
    window.addEventListener('resize', resizeCanvas)
  }
})

// Lifecycle hook: runs before the component is unmounted from the DOM
onUnmounted(() => {
  // Clean up the animation frame and resize listener
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <div
    class="overlay absolute bottom-0 left-0 w-full pointer-events-none mt-1 m-auto"
    style="height: 87%; width: 96%"
  >
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
/* Scoped styles for this component */
/* The overlay div positioning is handled by Tailwind classes in the template */
/* Add any custom canvas styles if needed */
canvas {
  background-color: transparent;
  z-index: 9999999;
}
</style>
