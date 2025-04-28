import { ref, onMounted, onUnmounted } from 'vue'

export function useIsMobile(maxWidth = 768) {
  const isMobile = ref(window.innerWidth < maxWidth)

  const handleResize = () => {
    isMobile.value = window.innerWidth < maxWidth
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    handleResize() // Initial check on mount
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return { isMobile }
}
