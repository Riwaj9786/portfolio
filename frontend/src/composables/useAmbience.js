import { computed, readonly, ref } from 'vue'

const theme = ref(localStorage.getItem('portfolio-theme') || 'auto')
const now = ref(new Date())
const weather = ref({ code: null, temperature: null, wind: null, label: 'Loading weather', location: 'Kathmandu' })
const weatherLoading = ref(true)
let activeCoordinates = { latitude: 27.7172, longitude: 85.324 }

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

const labels = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Rime fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Rain showers', 81: 'Rain showers',
  82: 'Heavy showers', 85: 'Snow showers', 86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe storm'
}

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

async function loadWeather(latitude = 27.7172, longitude = 85.324) {
  activeCoordinates = { latitude, longitude }
  weatherLoading.value = true
  try {
    const params = new URLSearchParams({
      latitude, longitude, current: 'temperature_2m,weather_code,wind_speed_10m', timezone: 'auto'
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
    if (!response.ok) throw new Error('Weather unavailable')
    const data = await response.json()
    weather.value = {
      code: data.current.weather_code,
      temperature: Math.round(data.current.temperature_2m),
      wind: Math.round(data.current.wind_speed_10m),
      label: labels[data.current.weather_code] || 'Current conditions',
      location: latitude === 27.7172 ? 'Kathmandu' : 'Your location'
    }
  } catch (_) {
    weather.value.label = 'Weather unavailable'
  } finally {
    weatherLoading.value = false
    applyTheme()
  }
}

function initialiseAmbience() {
  applyTheme()
  loadWeather()
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadWeather(coords.latitude, coords.longitude),
      () => {},
      { timeout: 7000, maximumAge: 600000 }
    )
  }
  const clock = window.setInterval(() => { now.value = new Date(); applyTheme() }, 60000)
  const forecast = window.setInterval(() => loadWeather(activeCoordinates.latitude, activeCoordinates.longitude), 600000)
  return () => { clearInterval(clock); clearInterval(forecast) }
}

export function useAmbience() {
  return { theme: readonly(theme), resolvedTheme, now: readonly(now), weather: readonly(weather), weatherKind, weatherLoading: readonly(weatherLoading), cycleTheme, initialiseAmbience }
}
