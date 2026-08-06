<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useAmbience } from '@/composables/useAmbience'

const { weatherKind, resolvedTheme, initialiseAmbience } = useAmbience()
let cleanup
let pointerFrame
const moveHighlight = event => {
  if (pointerFrame) return
  pointerFrame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`)
    document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`)
    document.documentElement.dataset.pointer = 'active'
    pointerFrame = null
  })
}
const hideHighlight = () => { document.documentElement.dataset.pointer = 'idle' }
onMounted(() => {
  cleanup = initialiseAmbience()
  window.addEventListener('pointermove', moveHighlight, { passive: true })
  document.documentElement.addEventListener('mouseleave', hideHighlight)
})
onUnmounted(() => {
  cleanup?.()
  window.removeEventListener('pointermove', moveHighlight)
  document.documentElement.removeEventListener('mouseleave', hideHighlight)
  if (pointerFrame) cancelAnimationFrame(pointerFrame)
})
const particles = computed(() => weatherKind.value === 'snow' ? 34 : 48)
</script>

<template>
  <div class="weather-scene" :class="[`weather-${weatherKind}`, `scene-${resolvedTheme}`]" aria-hidden="true">
    <div class="ambient-orb orb-one"></div><div class="ambient-orb orb-two"></div>
    <div v-if="weatherKind === 'clear' && resolvedTheme === 'dark'" class="stars"><i v-for="n in 30" :key="n" :style="{'--i':n}"></i></div>
    <div v-if="weatherKind === 'clouds' || weatherKind === 'storm'" class="clouds"><i></i><i></i><i></i></div>
    <div v-if="weatherKind === 'rain' || weatherKind === 'storm'" class="rain"><i v-for="n in particles" :key="n" :style="{'--i':n}"></i></div>
    <div v-if="weatherKind === 'snow'" class="snow"><i v-for="n in particles" :key="n" :style="{'--i':n}"></i></div>
    <div v-if="weatherKind === 'fog'" class="fog"><i></i><i></i><i></i></div>
    <div v-if="weatherKind === 'storm'" class="lightning"></div>
  </div>
  <div class="cursor-highlight" aria-hidden="true"></div>
</template>
