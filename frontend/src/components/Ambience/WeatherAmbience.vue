<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useAmbience } from '@/composables/useAmbience'

// Keep the existing theme/time lifecycle; this backdrop makes no network requests.
const { initialiseAmbience } = useAmbience()
let cleanup
let pointerFrame
let reducedMotion
let finePointer
let listening = false
const particles = Array.from({ length: 12 }, (_, index) => ({
  x: `${(index * 37 + 11) % 100}%`, y: `${(index * 23 + 7) % 100}%`,
  delay: `${-index * 2.7}s`, duration: `${18 + index % 5 * 3}s`,
}))
function moveHighlight(event) {
  if (pointerFrame || document.hidden) return
  const { clientX, clientY } = event
  pointerFrame = requestAnimationFrame(() => {
    document.documentElement.style.setProperty('--pointer-x', `${clientX}px`)
    document.documentElement.style.setProperty('--pointer-y', `${clientY}px`)
    document.documentElement.dataset.pointer = 'active'
    pointerFrame = null
  })
}
function hideHighlight() { document.documentElement.dataset.pointer = 'idle' }
function syncVisibility() {
  document.documentElement.dataset.atmospherePaused = String(document.hidden)
  if (document.hidden) hideHighlight()
}
function syncPointer() {
  const enabled = finePointer.matches && !reducedMotion.matches
  if (enabled && !listening) window.addEventListener('pointermove', moveHighlight, { passive: true })
  if (!enabled && listening) window.removeEventListener('pointermove', moveHighlight)
  listening = enabled
  if (!enabled) {
    hideHighlight()
    if (pointerFrame) cancelAnimationFrame(pointerFrame)
    pointerFrame = null
  }
}
onMounted(() => {
  cleanup = initialiseAmbience()
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
  reducedMotion.addEventListener('change', syncPointer)
  finePointer.addEventListener('change', syncPointer)
  document.addEventListener('visibilitychange', syncVisibility)
  document.documentElement.addEventListener('mouseleave', hideHighlight)
  window.addEventListener('blur', hideHighlight)
  syncPointer()
  syncVisibility()
})
onUnmounted(() => {
  cleanup?.()
  window.removeEventListener('pointermove', moveHighlight)
  window.removeEventListener('blur', hideHighlight)
  reducedMotion?.removeEventListener('change', syncPointer)
  finePointer?.removeEventListener('change', syncPointer)
  document.removeEventListener('visibilitychange', syncVisibility)
  document.documentElement.removeEventListener('mouseleave', hideHighlight)
  if (pointerFrame) cancelAnimationFrame(pointerFrame)
  hideHighlight()
})
</script>

<template>
  <div class="portfolio-atmosphere" aria-hidden="true">
    <div class="atmosphere-aura aura-violet"></div><div class="atmosphere-aura aura-indigo"></div><div class="atmosphere-aura aura-lavender"></div>
    <div class="atmosphere-grid"></div>
    <!-- Development: a quiet circuit and code brackets. -->
    <svg class="atmosphere-motif motif-code" viewBox="0 0 420 340" fill="none" focusable="false">
      <g stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M80 90L45 125L80 160M160 90L195 125L160 160M134 75L105 175"/><path d="M20 235H125L160 270H280V190H380M20 255H110L145 290H300V210H400M210 45H310V110H380"/><circle cx="20" cy="235" r="4"/><circle cx="280" cy="190" r="5"/><circle cx="380" cy="110" r="4"/><path d="M240 75H275M240 90H290M240 105H260"/></g>
    </svg>
    <!-- Data and AI: a connected network with a central node. -->
    <svg class="atmosphere-motif motif-neural" viewBox="0 0 440 440" fill="none" focusable="false">
      <g stroke="currentColor" stroke-width="1"><path d="M65 100L180 75L270 140L365 85M65 100L110 240L220 215L270 140L360 270L220 215L180 75M110 240L185 350L305 360L360 270M220 215L185 350M270 140L305 360M365 85L360 270M65 100L220 215"/><circle cx="220" cy="215" r="28"/><circle cx="220" cy="215" r="42" stroke-dasharray="2 9"/></g>
      <g fill="currentColor"><circle cx="65" cy="100" r="5"/><circle cx="180" cy="75" r="7"/><circle cx="270" cy="140" r="6"/><circle cx="365" cy="85" r="4"/><circle cx="110" cy="240" r="5"/><circle cx="220" cy="215" r="8"/><circle cx="360" cy="270" r="7"/><circle cx="185" cy="350" r="4"/><circle cx="305" cy="360" r="6"/></g>
    </svg>
    <!-- Graphic design: a Bézier curve and geometric construction. -->
    <svg class="atmosphere-motif motif-design" viewBox="0 0 400 360" fill="none" focusable="false"><g stroke="currentColor" stroke-width="1.2"><circle cx="245" cy="150" r="95"/><path d="M155 255L245 65L335 255Z"/><path d="M35 275C65 25 245 305 330 65" stroke-width="2"/><path d="M35 275L65 25M245 305L330 65" stroke-dasharray="4 7"/><rect x="30" y="270" width="10" height="10"/><rect x="325" y="60" width="10" height="10"/><circle cx="65" cy="25" r="4"/><circle cx="245" cy="305" r="4"/></g></svg>
    <!-- Leadership: people and ideas brought into alignment. -->
    <svg class="atmosphere-motif motif-leadership" viewBox="0 0 440 280" fill="none" focusable="false"><g stroke="currentColor" stroke-width="1.2"><path d="M220 65V135M220 135H75V200M220 135H365V200M220 135V220"/><circle cx="220" cy="50" r="25"/><circle cx="75" cy="225" r="23"/><circle cx="220" cy="245" r="23"/><circle cx="365" cy="225" r="23"/><circle cx="220" cy="50" r="38" stroke-dasharray="2 7"/><path d="M200 51L214 63L241 36"/></g></svg>
    <div class="atmosphere-particles"><i v-for="(particle, index) in particles" :key="index" :style="{ left:particle.x, top:particle.y, '--particle-delay':particle.delay, '--particle-duration':particle.duration }"></i></div>
    <div class="atmosphere-pointer"></div>
  </div>
</template>
