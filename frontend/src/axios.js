import axios from 'axios'

export const backendOrigin = (
  import.meta.env.VITE_BACKEND_URL || 'https://api.riwajbhurtel.com.np'
).replace(/\/$/, '')

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `${backendOrigin}/api/v1/`
const mediaBaseUrl = `/${(import.meta.env.VITE_MEDIA_BASE_URL || '/media/').replace(/^\/+|\/+$/g, '')}/`

export function resolveMediaUrl(value) {
  if (typeof value !== 'string' || !value.includes('media/')) return value

  // Uploaded files are served by Nginx from the mounted backend/media folder.
  // Rich-text fields can contain several media URLs inside HTML.
  if (value.includes('<')) {
    return value
      .replace(/https?:\/\/[^/]+\/media\//gi, mediaBaseUrl)
      .replace(/(["'])\/?media\//g, `$1${mediaBaseUrl}`)
  }

  const mediaMatch = value.match(/^(?:https?:\/\/[^/]+)?\/?media\/(.+)$/i)
  if (mediaMatch) return `${mediaBaseUrl}${mediaMatch[1]}`

  return value
}

function normalizeMedia(value) {
  if (Array.isArray(value)) return value.map(normalizeMedia)
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => { value[key] = normalizeMedia(value[key]) })
    return value
  }
  return resolveMediaUrl(value)
}

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
})

axiosInstance.interceptors.response.use((response) => {
  response.data = normalizeMedia(response.data)
  return response
})

export default axiosInstance
