<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/axios'

const form = ref({
  name: '',
  email: '',
  image: null,
  company: '',
  position: '',
  testimonial: '',
  to_publish: false
})

const name = ref('')
const imagePreview = ref(null)
const isLoading = ref(false)
const apiEndpoint = 'testimonial/testimonials/add/'
const successMessage = ref('')
const errorMessage = ref('')

// Enhanced image handling
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function decodeAndFillForm() {
  const url = new URL(window.location.href)
  const refParam = url.searchParams.get('ref')

  if (refParam) {
    try {
      const decoded = atob(refParam)
      const [decodedName, decodedEmail] = decoded.split('|')
      name.value = decodedName.trim()
      form.value.name = decodedName.trim()
      form.value.email = decodedEmail.trim()
    } catch (e) {
      console.error('Error decoding ref parameter:', e)
    }
  }
}

function onImageUpload(e) {
  errorMessage.value = ''
  const file = e.target.files[0]
  
  if (!file) {
    form.value.image = null
    imagePreview.value = null
    return
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = 'Only JPG, PNG, or WEBP images are allowed.'
    e.target.value = '' // Clear the file input
    return
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'Image size must be less than 2MB.'
    e.target.value = '' // Clear the file input
    return
  }

  form.value.image = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (event) => {
    imagePreview.value = event.target.result
  }
  reader.onerror = () => {
    errorMessage.value = 'Error reading image file.'
    form.value.image = null
    imagePreview.value = null
  }
  reader.readAsDataURL(file)
}

function resetForm() {
  form.value = {
    name: '',
    email: '',
    image: null,
    company: '',
    position: '',
    testimonial: '',
    to_publish: false
  }
  imagePreview.value = null
  name.value = ''
  errorMessage.value = ''
  successMessage.value = ''
}

async function submitForm() {
  errorMessage.value = ''
  successMessage.value = ''

  // Validation
  if (!form.value.name || !form.value.email) {
    errorMessage.value = 'Name and Email are required fields.'
    return
  }
  if (!form.value.testimonial) {
    errorMessage.value = 'Please provide your testimonial.'
    return
  }
  if (!validateEmail(form.value.email)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('company', form.value.company)
    formData.append('position', form.value.position)
    formData.append('testimonial', form.value.testimonial)
    formData.append('to_publish', form.value.to_publish)

    if (form.value.image) {
      formData.append('image', form.value.image)
    }

    const response = await axiosInstance.post(apiEndpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (response.status === 201) {
      successMessage.value = 'Thank you for your testimonial!'
      resetForm()
    }
  } catch (error) {
    handleSubmissionError(error)
  } finally {
    isLoading.value = false
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function handleSubmissionError(error) {
  console.error('Error submitting testimonial:', error)
  let msg = 'Something went wrong while submitting your testimonial.'

  if (error.response) {
    if (error.response.status === 413) {
      msg = 'The image file is too large. Please use an image smaller than 2MB.'
    } else if (error.response.data) {
      const data = error.response.data
      msg = typeof data === 'object' 
        ? Object.values(data).flat().join('\n') 
        : data
    }
  } else if (error.request) {
    msg = 'Network error. Please check your connection and try again.'
  }

  errorMessage.value = msg
}

onMounted(() => {
  decodeAndFillForm()
})
</script>

<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-10">
    <div class="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 xl:gap-16 max-w-7xl w-full">
      <!-- Left Side Message -->
      <div class="w-full lg:w-1/2 flex items-center justify-center transition-all duration-500">
        <div class="rounded-xl p-6 sm:p-8">
          <div class="space-y-4 md:space-y-6">
            <p class="text-lg md:text-2xl text-gray-800">
              Dear <span class="text-3xl md:text-3xl font-bold text-indigo-700">{{ name }}{{ name ? ',' : '' }}</span>
            </p>
            <p class="leading-relaxed md:leading-loose text-gray-700 text-justify text-sm lg:text-2xl sm:text-base">
              It was great working with you recently and I hope you had a similar experience.
              I would appreciate your little time to fill out the form on your experience working with me.
            </p>
            <p class="leading-relaxed md:leading-loose text-gray-700 text-justify text-sm lg:text-2xl sm:text-base">
              Your feedback helps me grow and motivates me to work more efficiently.
            </p>
            <p class="font-medium text-indigo-600 text-sm lg:text-2xl sm:text-base">Thank You!</p>
            <div class="pt-2 border-t border-gray-200/50">
              <p class="font-bold text-gray-800 text-sm lg:text-2xl sm:text-base">
                Best Regards,<br />
                <span class="text-indigo-700 lg:text-2xl">Er. Riwaj Bhurtel</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side Form -->
      <div class="w-full lg:w-1/2 bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200/70 transition-all duration-500 hover:shadow-xl">
        <h2 class="text-2xl sm:text-3xl font-bold text-center text-indigo-700 mb-6">Share Your Experience</h2>
        
        <!-- Image Upload -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative group flex flex-col items-center">
            <label for="image-upload" class="cursor-pointer">
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex justify-center items-center relative overflow-hidden shadow-md transition-all duration-300 group-hover:shadow-lg">
                <template v-if="imagePreview">
                  <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
                </template>
                <template v-else>
                  <i class="fas fa-user text-indigo-400 text-3xl"></i>
                </template>
                <div v-if="!imagePreview" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 rounded-full">
                  <span class="text-white text-xl">+</span>
                </div>
              </div>
            </label>
            <input
              id="image-upload"
              type="file"
              accept=".jpeg,.jpg,.png,.webp"
              class="hidden"
              @change="onImageUpload"
            />
            <p class="text-center text-xs sm:text-sm text-gray-500 mt-3">Click to upload your photo (max 2MB)</p>
            <p v-if="form.image" class="text-xs text-gray-400 mt-1">
              {{ form.image.name.substring(0, 20) }}{{ form.image.name.length > 20 ? '...' : '' }}
            </p>
          </div>
        </div>

        <!-- Messages -->
        <div v-if="errorMessage || successMessage" class="mb-6 animate-fade-in">
          <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
            <p class="text-red-700 font-medium text-sm sm:text-base whitespace-pre-line">
              {{ errorMessage }}
            </p>
          </div>
          <div v-else class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
            <p class="text-green-700 font-medium text-sm sm:text-base whitespace-pre-line">
              {{ successMessage }}
            </p>
          </div>
        </div>

        <!-- Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div class="space-y-1">
            <label class="text-xs sm:text-sm font-medium text-gray-600">Name *</label>
            <input 
              type="text" 
              v-model="form.name" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
              required 
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs sm:text-sm font-medium text-gray-600">Email *</label>
            <input 
              type="email" 
              v-model="form.email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
              required 
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs sm:text-sm font-medium text-gray-600">Company</label>
            <input 
              type="text" 
              v-model="form.company" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
            />
          </div>
          <div class="space-y-1">
            <label class="text-xs sm:text-sm font-medium text-gray-600">Your Position</label>
            <input 
              type="text" 
              v-model="form.position" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base" 
            />
          </div>
        </div>

        <!-- Testimonial -->
        <div class="mt-4 sm:mt-5 space-y-1">
          <label class="text-xs sm:text-sm font-medium text-gray-600">Testimonial *</label>
          <textarea
            v-model="form.testimonial"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm sm:text-base"
            placeholder="Share your experience working with me..."
            required
          ></textarea>
        </div>

        <!-- Consent Checkbox -->
        <div class="flex items-start mt-4 sm:mt-5 space-x-2">
          <input 
            type="checkbox" 
            v-model="form.to_publish" 
            class="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-all" 
          />
          <label class="text-xs sm:text-sm text-gray-600">
            I consent to have this testimonial displayed on the website
          </label>
        </div>

        <!-- Submit Button -->
        <button
          @click="submitForm"
          :disabled="isLoading"
          class="w-full mt-6 sm:mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md"
        >
          <span v-if="isLoading" class="flex items-center justify-center space-x-2">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Submitting...</span>
          </span>
          <span v-else class="flex items-center justify-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>SUBMIT TESTIMONIAL</span>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

input[type="checkbox"] {
  accent-color: #4f46e5;
}
</style>