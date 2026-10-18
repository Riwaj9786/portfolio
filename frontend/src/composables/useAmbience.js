import { computed, readonly, ref } from 'vue'

const theme = ref(localStorage.getItem('portfolio-theme') || 'auto')
const now = ref(new Date())
const weather = ref({ code: null, temperature: null, wind: null, label: 'Live weather unavailable', location: 'Kathmandu' })
const weatherLoading = ref(false)

const isNight = computed(() => now.value.getHours() < 6 || now.value.getHours() >= 18)
const resolvedTheme = computed(() => theme.value === 'auto' ? (isNight.value ? 'dark' : 'light') : theme.value)

const weatherKind = computed(() => {
  const code = weather.value.code
  if (code === null) return 'clear'
  if ([95, 96, 99].includes(code)) return 'storm'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([45, 48].includes(code)) return 'fog'
  if ([1, 2, 3].includes(code)) return 'clouds'
  return 'clear'
})

function applyTheme() {
  document.documentElement.dataset.theme = resolvedTheme.value
  document.documentElement.dataset.weather = weatherKind.value
  document.documentElement.style.colorScheme = resolvedTheme.value
}

function cycleTheme() {
  theme.value = theme.value === 'auto' ? 'light' : theme.value === 'light' ? 'dark' : 'auto'
  localStorage.setItem('portfolio-theme', theme.value)
  applyTheme()
}

function initialiseAmbience() {
  applyTheme()
  const clock = window.setInterval(() => { now.value = new Date(); applyTheme() }, 60000)
  return () => clearInterval(clock)
}

export function useAmbience() {
  return { theme: readonly(theme), resolvedTheme, now: readonly(now), weather: readonly(weather), weatherKind, weatherLoading: readonly(weatherLoading), cycleTheme, initialiseAmbience }
}
