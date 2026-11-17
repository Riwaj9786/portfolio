import { computed, readonly, ref } from 'vue'

const theme = ref(localStorage.getItem('portfolio-theme') || 'auto')
const now = ref(new Date())
const emptyWeather = { code: null, temperature: null, wind: null, isDay: null, label: 'Enable local weather', location: '' }
const weather = ref({ ...emptyWeather })
const weatherLoading = ref(false)
const weatherError = ref('')
let weatherRequest = 0
let weatherController
let weatherCoordinates = null
let lastWeatherAttempt = 0
const weatherRefreshInterval = 15 * 60 * 1000

// WMO condition codes returned by https://open-meteo.com/en/docs.
const weatherLabels = {
  0: 'Clear sky', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  56: 'Light freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Rain showers', 82: 'Heavy showers',
  85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 97: 'Heavy thunderstorm', 99: 'Thunderstorm with heavy hail',
}

const isNight = computed(() => now.value.getHours() < 6 || now.value.getHours() >= 18)
const weatherIsNight = computed(() => weather.value.isDay === null ? isNight.value : !weather.value.isDay)
const resolvedTheme = computed(() => theme.value === 'auto' ? (isNight.value ? 'dark' : 'light') : theme.value)

const weatherKind = computed(() => {
  const code = weather.value.code
  if (code === null) return 'unknown'
  if ([95, 96, 97, 99].includes(code)) return 'storm'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([45, 48].includes(code)) return 'fog'
  if ([2, 3].includes(code)) return 'clouds'
  return [0, 1].includes(code) ? 'clear' : 'unknown'
})

async function requestWeather({ reuseLocation = false } = {}) {
  if (weatherLoading.value) return
  const request = ++weatherRequest
  weatherLoading.value = true
  weatherError.value = ''
  const backgroundRefresh = reuseLocation && weatherCoordinates !== null
  if (!backgroundRefresh) {
    weatherCoordinates = null
    weather.value = { ...emptyWeather, label: 'Requesting location' }
  }
  let timeout
  let locating = !backgroundRefresh

  try {
    if (!window.isSecureContext) throw new Error('Location requires HTTPS or localhost.')
    if (!navigator.geolocation) throw new Error('This browser does not support location access.')
    if (!backgroundRefresh) {
      const { coords } = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        })
      })
      if (request !== weatherRequest) return
      weatherCoordinates = { latitude: coords.latitude.toFixed(2), longitude: coords.longitude.toFixed(2) }
    }
    if (request !== weatherRequest) return
    locating = false
    if (!backgroundRefresh) weather.value = { ...emptyWeather, label: 'Loading weather', location: 'Your location' }
    lastWeatherAttempt = Date.now()
    const params = new URLSearchParams({
      ...weatherCoordinates,
      current: 'temperature_2m,weather_code,wind_speed_10m,is_day',
      temperature_unit: 'celsius',
      timezone: 'auto',
    })
    const controller = new AbortController()
    weatherController = controller
    timeout = window.setTimeout(() => controller.abort(), 10000)
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
    if (!response.ok) throw new Error('Weather request failed.')
    const { current } = await response.json()
    if (!Number.isFinite(current?.temperature_2m) || !Number.isInteger(current?.weather_code)) {
      throw new Error('Weather data is unavailable.')
    }
    if (request !== weatherRequest) return
    weather.value = {
      code: current.weather_code,
      temperature: Math.round(current.temperature_2m),
      wind: Number.isFinite(current.wind_speed_10m) ? current.wind_speed_10m : null,
      isDay: [0, 1].includes(current.is_day) ? current.is_day === 1 : null,
      label: weatherLabels[current.weather_code] || 'Current weather',
      location: 'Your location',
    }
    applyTheme()
  } catch (error) {
    if (request !== weatherRequest) return
    const locationMessages = {
      1: 'Allow location access in your browser settings, then tap to retry.',
      2: 'Your location could not be determined. Tap to retry.',
      3: 'Location lookup timed out. Tap to retry.',
    }
    weather.value = { ...emptyWeather, label: locating ? (error.code === 1 ? 'Location blocked' : 'Location unavailable') : 'Weather unavailable' }
    weatherError.value = locating
      ? locationMessages[error.code] || error.message
      : 'Could not load local weather. Check your connection and tap to retry.'
    applyTheme()
  } finally {
    window.clearTimeout(timeout)
    if (request === weatherRequest) {
      weatherLoading.value = false
      weatherController = null
    }
  }
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

function initialiseAmbience() {
  applyTheme()
  void requestWeather()
  const clock = window.setInterval(() => {
    now.value = new Date()
    applyTheme()
    if (!document.hidden && weatherCoordinates && Date.now() - lastWeatherAttempt >= weatherRefreshInterval) {
      void requestWeather({ reuseLocation: true })
    }
  }, 60000)
  return () => {
    window.clearInterval(clock)
    weatherRequest++
    weatherController?.abort()
    weatherController = null
    weatherCoordinates = null
    weatherLoading.value = false
  }
}

export function useAmbience() {
  return { theme: readonly(theme), resolvedTheme, now: readonly(now), weather: readonly(weather), weatherKind, weatherIsNight, weatherLoading: readonly(weatherLoading), weatherError: readonly(weatherError), requestWeather, cycleTheme, initialiseAmbience }
}
