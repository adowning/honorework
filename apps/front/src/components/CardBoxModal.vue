<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  button: {
    type: String,
    default: 'info'
  },
  buttonLabel: {
    type: String,
    default: 'Done'
  },
  hasCancel: Boolean,
  modelValue: {
    type: [String, Number, Boolean],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'cancel', 'confirm'])

const value = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

function confirmCancel(mode) {
  value.value = false
  console.log(mode)
  emit(mode)
}

const confirm = () => confirmCancel('confirm')

const cancel = () => confirmCancel('cancel')

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && value.value) {
    cancel()
  }
})
</script>

<template>
  <OverlayLayer v-show="value" @overlay-click="cancel">
    <CardBox v-show="value" class="futex-cell-3 max-h-modal w-11/12 md:w-3/5 lg:w-2/5 xl:w-4/12 z-50" is-modal>
      <CardBoxComponentTitle :title="title">
        <BaseButton v-if="hasCancel" color="whiteDark" small rounded-full @click.prevent="cancel" />
      </CardBoxComponentTitle>

      <div class="space-y-3">
        <slot />
      </div>

      <template #footer>
        <!-- <BaseButtons> -->
        <div class="flex justify-center" w-full>
          <GlassButton color="red" @click="confirm" style="font-size: x-large; color: white">
            CANCEL
          </GlassButton>
          <!-- <GlassButton color="red" v-if="hasCancel" outline @click="cancel" /> -->
          <!-- </BaseButtons> -->
        </div>
      </template>
    </CardBox>
  </OverlayLayer>
</template>
