<script setup>
import { containerMaxW } from '@/composables/maxWidth'
</script>

<template>
  <div class="relative grow-1 flex flex-col max-w-[600px] max-h-[700px]">
    <slot />
  </div>
</template>
