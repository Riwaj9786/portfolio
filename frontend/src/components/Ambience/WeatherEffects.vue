<script setup>
import { computed } from 'vue'

const props = defineProps({
  kind: { type: String, default: 'unknown' },
  night: { type: Boolean, default: false },
  wind: { type: Number, default: null },
})
const cloudy = computed(() => ['clouds', 'rain', 'snow', 'storm'].includes(props.kind))
const precipitating = computed(() => ['rain', 'snow', 'storm'].includes(props.kind))
const windStyle = computed(() => ({
  '--weather-drift': `${Math.round(Math.min(60, Math.max(0, props.wind || 0)) * 2)}px`,
}))
const drops = Array.from({ length: 40 }, (_, index) => ({
  left: `${(index * 37 + 9) % 100}%`,
  '--rain-duration': `${0.85 + index % 6 * 0.12}s`,
  '--snow-duration': `${9 + index % 7}s`,
  '--fall-delay': `${-index * 0.83}s`,
  '--flake-size': `${2 + index % 4}px`,
}))
const stars = Array.from({ length: 24 }, (_, index) => ({
  left: `${(index * 43 + 7) % 100}%`,
  top: `${(index * 29 + 5) % 85}%`,
  animationDelay: `${-index * 0.7}s`,
}))
</script>

<template>
  <div v-if="kind !== 'unknown'" class="weather-effects" :data-weather="kind" :data-night="night" :style="windStyle" aria-hidden="true">
    <div class="weather-wash"></div>
    <template v-if="kind === 'clear'">
      <div class="weather-orb"></div>
      <div v-if="night" class="weather-stars">
        <i v-for="(star, index) in stars" :key="index" class="weather-star" :style="star"></i>
      </div>
    </template>
    <div v-if="cloudy" class="weather-clouds">
      <i v-for="cloud in 3" :key="cloud" class="weather-cloud"></i>
    </div>
    <div v-if="kind === 'fog'" class="weather-fog">
      <i v-for="band in 3" :key="band" class="weather-fog-band"></i>
    </div>
    <div v-if="precipitating" class="weather-precipitation">
      <i v-for="(drop, index) in drops" :key="index" class="weather-drop" :style="drop"></i>
    </div>
    <div v-if="kind === 'storm'" class="weather-storm-glow"></div>
  </div>
</template>

<style scoped>
.weather-effects {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  opacity: .6;
  /* Match the page container's gutters; the entire content column stays clear. */
  --weather-edge-width: 1.25rem;
  --weather-orb-size: clamp(28px, 4vw, 56px);
  -webkit-mask-image: linear-gradient(to right, #000, transparent var(--weather-edge-width), transparent calc(100% - var(--weather-edge-width)), #000);
  mask-image: linear-gradient(to right, #000, transparent var(--weather-edge-width), transparent calc(100% - var(--weather-edge-width)), #000);
  --weather-color: #7966ac;
  --cloud-color: rgba(137, 123, 166, .17);
}
:global(:root[data-theme="dark"]) .weather-effects {
  --weather-color: #c7b9ed;
  --cloud-color: rgba(181, 170, 209, .1);
}
.weather-wash { position: absolute; inset: 0; background: radial-gradient(ellipse at 80% 10%, rgba(134, 153, 189, .12), transparent 70%); }
[data-weather="clear"][data-night="false"] .weather-wash { background: radial-gradient(ellipse at 85% 12%, rgba(248, 188, 85, .16), transparent 65%); }
[data-weather="clear"][data-night="true"] .weather-wash { background: radial-gradient(ellipse at 75% 12%, rgba(94, 104, 185, .2), transparent 65%); }
[data-weather="storm"] .weather-wash { background: linear-gradient(180deg, rgba(70, 69, 114, .2), transparent 85%); }
[data-weather="snow"] .weather-wash { background: radial-gradient(ellipse at top, rgba(160, 193, 224, .15), transparent 80%); }
.weather-orb {
  position: absolute;
  top: 18%;
  right: calc((var(--weather-edge-width) - var(--weather-orb-size)) / 2);
  width: var(--weather-orb-size);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 223, 154, .8), rgba(245, 190, 101, .25));
  box-shadow: 0 0 90px 35px rgba(247, 193, 100, .13);
  animation: weather-orbit 30s ease-in-out infinite;
}
[data-night="true"] .weather-orb {
  background: radial-gradient(circle at 70% 30%, transparent 54%, rgba(216, 209, 246, .65) 56%);
  box-shadow: 0 0 90px 20px rgba(156, 151, 218, .1);
}
.weather-star { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: var(--weather-color); animation: weather-twinkle 7s ease-in-out infinite; }
.weather-clouds, .weather-fog, .weather-precipitation, .weather-stars { position: absolute; inset: 0; }
.weather-cloud {
  position: absolute;
  width: clamp(280px, 55vw, 950px);
  height: clamp(100px, 20vw, 280px);
  background: radial-gradient(ellipse at 25% 60%, var(--cloud-color) 20%, transparent 60%), radial-gradient(ellipse at 55% 40%, var(--cloud-color) 20%, transparent 60%), radial-gradient(ellipse at 75% 65%, var(--cloud-color) 20%, transparent 60%);
  filter: blur(10px);
  animation: weather-cloud-drift 65s ease-in-out infinite alternate;
}
.weather-cloud:nth-child(1) { top: 2%; left: -12%; }
.weather-cloud:nth-child(2) { top: 27%; right: -16%; animation-duration: 83s; animation-delay: -27s; }
.weather-cloud:nth-child(3) { bottom: 8%; left: 10%; animation-duration: 95s; animation-delay: -51s; }
[data-weather="storm"] .weather-clouds { --cloud-color: rgba(104, 99, 151, .23); }
.weather-fog-band {
  position: absolute;
  left: -20%;
  width: 140%;
  height: 36%;
  background: radial-gradient(ellipse, var(--cloud-color), transparent 70%);
  animation: weather-cloud-drift 45s ease-in-out infinite alternate;
}
.weather-fog-band:nth-child(1) { top: 8%; }
.weather-fog-band:nth-child(2) { top: 35%; animation-delay: -19s; }
.weather-fog-band:nth-child(3) { bottom: -5%; animation-delay: -32s; }
.weather-drop {
  position: absolute;
  top: -15vh;
  width: 1px;
  height: 30px;
  border-radius: 999px;
  background: linear-gradient(transparent, var(--weather-color));
  opacity: .3;
  animation: weather-rainfall var(--rain-duration) linear var(--fall-delay) infinite;
}
[data-weather="storm"] .weather-drop { height: 42px; opacity: .4; }
[data-weather="snow"] .weather-drop {
  width: var(--flake-size);
  height: var(--flake-size);
  background: var(--weather-color);
  opacity: .45;
  animation: weather-snowfall var(--snow-duration) linear var(--fall-delay) infinite;
}
.weather-storm-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 60% 0%, rgba(187, 178, 239, .4), transparent 70%); opacity: 0; animation: weather-storm-light 22s ease-in-out infinite; }
@keyframes weather-orbit { 50% { transform: translate3d(-2px, 8px, 0); } }
@keyframes weather-twinkle { 0%, 100% { opacity: .12; } 50% { opacity: .55; } }
@keyframes weather-cloud-drift { from { transform: translate3d(-4vw, 0, 0); } to { transform: translate3d(10vw, 3vh, 0); } }
@keyframes weather-rainfall { from { transform: translate3d(0, 0, 0) rotate(12deg); } to { transform: translate3d(calc(-30px - var(--weather-drift)), 130vh, 0) rotate(12deg); } }
@keyframes weather-snowfall { 0% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(calc(25px + var(--weather-drift) / 2), 65vh, 0); } 100% { transform: translate3d(var(--weather-drift), 130vh, 0); } }
/* A slow, low-opacity glow suggests thunder without abrupt lightning flashes. */
@keyframes weather-storm-light { 0%, 55%, 100% { opacity: 0; } 76% { opacity: .24; } }
@media (max-width: 767px) {
  .weather-effects { opacity: .4; }
  .weather-drop:nth-child(n+17), .weather-star:nth-child(n+13), .weather-cloud:nth-child(3) { display: none; }
  .weather-cloud { filter: none; }
}
@media (min-width: 640px) {
  .weather-effects { --weather-edge-width: 2.25rem; }
}
@media (min-width: 1024px) {
  .weather-effects { --weather-edge-width: max(3.5rem, calc((100vw - 1440px) / 2 + 3.5rem)); }
}
@media (prefers-reduced-motion: reduce) {
  .weather-effects * { animation: none !important; }
  .weather-drop, .weather-star { display: none; }
  .weather-storm-glow { opacity: .05; }
}
</style>
