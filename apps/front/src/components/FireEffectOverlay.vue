<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null) // Ref to the canvas element
let ctx = null // Canvas rendering context
// Decreased particle count
const particleCount = 40 // Reduced particle count for a less dense effect
let particles = [] // Array to hold particle objects
let animationFrameId = null // To store the requestAnimationFrame ID for cleanup

// Particle class for fire embers/ash
class Particle {
  constructor(canvasWidth, canvasHeight) {
    // Particles start at the bottom center
    this.x = canvasWidth / 2 + (Math.random() - 0.5) * canvasWidth * 0.8 // Start closer to center bottom
    this.y = canvasHeight - 40 // Start at the very bottom
    // Decreased size range
    this.size = Math.random() * 3 // Smaller size range
    // Decreased upward speed
    this.speedY = Math.random() * 1.5 + 0.01 // Slower upward speed
    // Initial horizontal drift (can be small)
    this.speedX = (Math.random() - 0.5) * 0.5 // Very slight initial horizontal drift

    this.alpha = Math.random() * 0.4 + 0.3 // Start with some transparency
    this.color = `hsl(${Math.random() * 20 + 0}, 100%, 60%)` // Warm colors, slightly brighter

    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.life = 1 // Particle life from 1 (full) to 0 (dead)
    this.decay = Math.random() * 0.01 + 0.003 // Slower decay rate

    // --- Added properties for oscillation ---
    this.oscillationAmplitude = Math.random() * 10 + 5 // How far it swings horizontally
    this.oscillationSpeed = Math.random() * 0.05 + 0.02 // How fast it swings
    this.initialX = this.x // Store initial X for oscillation base
    this.angle = Math.random() * Math.PI * 2 // Random starting angle for sine wave
    // --- End Added ---
  }

  update() {
    this.y -= this.speedY // Move upwards

    // --- Added oscillation movement ---
    this.angle += this.oscillationSpeed
    this.x = this.initialX + Math.sin(this.angle) * this.oscillationAmplitude
    // --- End Added ---

    // Fade out particle over time
    this.life -= this.decay
    this.alpha = Math.max(0, this.life) // Alpha decreases with life, minimum 0

    // Change color as it rises (optional, can simulate cooling)
    // const hue = Math.max(0, this.life * 20); // Keep hue warm
    // this.color = `hsl(${hue}, 100%, ${this.life * 60 + 10}%)`; // Brightness decreases

    // If particle is dead, reset it to the bottom
    if (this.life <= 0) {
      this.reset()
    }
  }

  // Reset particle to its starting state at the bottom
  reset() {
    this.x = this.canvasWidth / 2 + (Math.random() - 0.5) * this.canvasWidth * 0.7
    this.y = this.canvasHeight - 40
    this.size = Math.random() * 3
    this.speedY = Math.random() * 1.5 + 0.01
    this.speedX = (Math.random() - 0.5) * 0.5
    this.alpha = Math.random() * 0.4 + 0.3
    this.color = `hsl(${Math.random() * 20 + 0}, 100%, 60%)`
    this.life = 1
    this.decay = Math.random() * 0.01 + 0.003

    // Reset oscillation properties
    this.oscillationAmplitude = Math.random() * 10 + 5
    this.oscillationSpeed = Math.random() * 0.05 + 0.02
    this.initialX = this.x // Update initial X based on new starting position
    this.angle = Math.random() * Math.PI * 2 // Random starting angle
  }

  // Draw method to draw a simple circle (ember)
  draw() {
    if (ctx && this.alpha > 0) {
      // Only draw if visible
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.alpha // Apply particle's alpha

      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2) // Draw a circle
      ctx.fill()

      ctx.globalAlpha = 1 // Reset global alpha for next draws
    }
  }
}

// Set initial canvas size based on the parent element's dimensions
const resizeCanvas = () => {
  if (canvas.value) {
    const parent = canvas.value.parentElement
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
    // Use clearRect for a fully transparent background
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
  <div class="overlay absolute bottom-0 left-0 w-full h-full pointer-events-none">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
/* Scoped styles for this component */
/* The overlay div positioning is handled by Tailwind classes in the template */
/* Add any custom canvas styles if needed */
/* canvas {
    background-color: transparent;
} */
</style>
