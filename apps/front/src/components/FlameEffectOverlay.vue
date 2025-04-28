<script setup lang="ts">
// No script logic needed for this simple CSS animation
</script>

<template>
  <div class="fire-sprite"></div>
</template>

<style scoped>
.fire-sprite {
  /* Set the dimensions of a single sprite frame */
  width: 51.2px; /* Approximate width of one frame */
  height: 128px; /* Height of the spritesheet */

  /* Set the background image to the spritesheet */
  background-image: url('/images/games/firesheet.png'); /* Use the correct URL for the uploaded file */

  /* Prevent the background image from repeating */
  background-repeat: no-repeat;

  /*
    Calculate the background size to fit the entire spritesheet horizontally
    while maintaining the height.
    Total spritesheet width / width of one frame = number of steps
    1024px / 51.2px = 20
    So, the background image needs to be 20 times wider than the container.
  */
  background-size: 1024px 128px; /* Or use calc(var(--num-frames) * 100%) auto; if using CSS variables */

  /* Define the animation */
  animation: playFire 1s steps(20) infinite; /* Adjust duration and steps as needed */
}

/* Define the keyframes for the animation */
@keyframes playFire {
  /* Start at the first frame (leftmost part of the spritesheet) */
  0% {
    background-position: 0 0;
  }
  /* End at the last frame (rightmost part of the spritesheet) */
  100% {
    background-position: -1024px 0; /* Move the background left by the total width of the spritesheet */
  }
}

/* You can add a container around the sprite for centering or positioning if needed */
/*
.sprite-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; // Example height
}
*/
</style>
