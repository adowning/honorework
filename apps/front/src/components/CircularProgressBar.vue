<script lang="ts" setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { experience, level, requiredExperience } = storeToRefs(userStore)

const levelProgress = computed(() => {
  return (experience.value / requiredExperience.value) * 100
})

// Circular Progress Bar Component
const CircularProgressBar = defineComponent({
  props: {
    progress: {
      type: Number,
      required: true,
    },
  },
  template: `
    <svg width="150" height="150" viewBox="0 0 50 50">
      <circle cx="50" cy="50" r="45" stroke="#e0e0e0" stroke-width="8" fill="transparent" />
      <circle
        cx="50"
        cy="50"
        r="45"
        stroke="#4caf50"
        stroke-width="8"
        fill="transparent"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 50 50)"
      />
    </svg>
  `,
  setup(props) {
    const circumference = 2 * Math.PI * 45
    const dashOffset = computed(() => {
      return circumference - (props.progress / 100) * circumference
    })

    return {
      circumference,
      dashOffset,
    }
  },
})
</script>
