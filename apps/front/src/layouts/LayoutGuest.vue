<script setup>
import { computed, onMounted } from 'vue'

const isLargeScreen = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 480
})

onMounted(() => {
  console.log('Index page mounted')
})
</script>

<template>
  <div v-if="isLargeScreen" id="scaleContainer"
    le="background: blue; box-shadow: rgb(51, 51, 51) 0px 5px 50px; transform-origin: left top">
    <!-- Expected Canvas Dimensions -->
    <div style="transform: rotate(0deg)">
      <div id="        gameCanvas" class="gameCanvas" tabindex="99" style="
          min-height: 720px;
          min-width: 480px;
          height: 100%;
          width: 100%;
          background-color: green;
        ">
        <slot />
      </div>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<style scoped>
.index-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
}

.yonder {
  -webkit-text-size-adjust: 100%;
  tab-size: 4;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
  line-height: inherit;
  font-family:
    var(--font-sans), ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  --font-sans: '__Lato_f4bfd4', '__Lato_Fallback_f4bfd4';
  box-sizing: border-box;
  border: 0 solid;
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  --tw-skew-x: 0;
  --tw-skew-y: 0;
  --tw-scale-x: 1;
  --tw-scale-y: 1;
  --tw-pan-x: ;
  --tw-pan-y: ;
  --tw-pinch-zoom: ;
  --tw-scroll-snap-strictness: proximity;
  --tw-gradient-from-position: ;
  --tw-gradient-via-position: ;
  --tw-gradient-to-position: ;
  --tw-ordinal: ;
  --tw-slashed-zero: ;
  --tw-numeric-figure: ;
  --tw-numeric-spacing: ;
  --tw-numeric-fraction: ;
  --tw-ring-inset: ;
  --tw-ring-offset-width: 0px;
  --tw-ring-offset-color: #fff;
  --tw-ring-color: rgba(59, 130, 246, 0.5);
  --tw-ring-offset-shadow: 0 0 #0000;
  --tw-ring-shadow: 0 0 #0000;
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  --tw-blur: ;
  --tw-brightness: ;
  --tw-contrast: ;
  --tw-grayscale: ;
  --tw-hue-rotate: ;
  --tw-invert: ;
  --tw-saturate: ;
  --tw-sepia: ;
  --tw-drop-shadow: ;
  --tw-backdrop-blur: ;
  --tw-backdrop-brightness: ;
  --tw-backdrop-contrast: ;
  --tw-backdrop-grayscale: ;
  --tw-backdrop-hue-rotate: ;
  --tw-backdrop-invert: ;
  --tw-backdrop-opacity: ;
  --tw-backdrop-saturate: ;
  --tw-backdrop-sepia: ;
  --tw-contain-size: ;
  --tw-contain-layout: ;
  --tw-contain-paint: ;
  --tw-contain-style: ;
  max-width: 1200px;
  border-radius: 30px;
  --tw-bg-opacity: 1;
  background-color: rgb(132 141 187 / var(--tw-bg-opacity));
}
</style>
