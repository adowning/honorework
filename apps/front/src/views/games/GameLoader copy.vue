<script setup lang="ts">
const router = useRouter()

const loading = ref(false)
const gameName = router.currentRoute.value.query.gameName
const developer = router.currentRoute.value.query.developer

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 100000)
})
</script>

<template>
  <div>
    <div
      v-if="loading"
      class="relative flex flex-col items-center justify-center"
      style="min-width: 100vw; min-height: 100vh"
    >
      <FallingStarsBg
        class="bg-white dark:bg-black"
        color="#FFF"
        style="min-width: 100vw; min-height: 100vh"
      />
      <div class="z-[1] flex items-center">
        <!-- <span class="text-6xl font-bold text-black dark:text-white">Inspira UI</span> -->
      </div>
    </div>
  </div>
</template>
