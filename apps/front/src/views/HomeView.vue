<script setup lang="ts">
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'

// 监听 roomStore.participants 的变化，并更新 roomInfo.participants
</script>

<template>
  <LayoutAuthenticated>
    <div class="flex flex-col items-center justify-center" style="maring-top: 200px">
      <BigWinsCarousel />
      <GameCarousel />
      <FilterBar />
      <AdCarousel />
    </div>
  </LayoutAuthenticated>
</template>
