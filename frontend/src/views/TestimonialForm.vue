<script setup>
import { ref, onMounted } from 'vue'
import axiosInstance from '@/axios' // Adjust path if needed

// Form state
const form = ref({
  name: '',
  email: '',
  image: null,
  company: '',
  position: '',
  testimonial: '',
  to_publish: false
})

const name = ref('') // For greeting
const imagePreview = ref(null)
const isLoading = ref(false)
const apiEndpoint = 'testimonial/testimonials/add/'

// Messages
const successMessage = ref('')
const errorMessage = ref('')

// Decode URL param and prefill form
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

// Handle image upload and preview
function onImageUpload(e) {
  const file = e.target.files[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (event) => {
      imagePreview.value = event.target.result
    }
    reader.readAsDataURL(file)
  } else {
    form.value.image = null
    imagePreview.value = null
  }
}

// Reset form and messages
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

// Submit form
async function submitForm() {
  // Clear messages on submit start
  errorMessage.value = ''
  successMessage.value = ''

  // Basic validation
  if (!form.value.name || !form.value.email) {
    errorMessage.value = 'Name and Email are required fields.'
    return
  }
  if (!form.value.testimonial) {
    errorMessage.value = 'Please provide your testimonial.'
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

    // Append image only if exists
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
    console.error('Error submitting testimonial:', error)
    let msg = 'Something went wrong while submitting your testimonial.'

    if (error.response && error.response.data) {
      const data = error.response.data
      if (typeof data === 'object') {
        msg = Object.values(data).flat().join('\n')
      } else {
        msg = data
      }
    }
    errorMessage.value = msg
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  decodeAndFillForm()
})
</script>

<template>
  <div class="bg-white flex flex-col md:flex-row md:items-stretch p-8 md:p-16">
    <!-- Left Side Message -->
    <div class="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
      <div class="max-w-md md:text-lg">
        <p class="text-lg text-gray-700 mb-2">
          Dear <span class="text-2xl font-bold text-indigo-900">{{ name }}{{ name ? ',' : '' }}</span>
        </p>
        <p class="text-gray-700 mb-6 leading-relaxed text-justify">
          It was great working with you recently and I hope you had a similar experience.
          I would appreciate your little time to fill out the form on your experience working with me.<br /><br />
          Your feedback helps me grow and motivate me to work more efficiently.
        </p>
        <p class="mb-4 text-gray-800 font-medium">Thank You!</p>
        <p class="font-bold text-gray-900">
          Best Regards,<br />
          <span class="text-black">Er. Riwaj Bhurtel</span>
        </p>
      </div>
    </div>

    <!-- Right Side Form -->
    <div class="w-full md:w-1/2 bg-gray-50 p-6 rounded-xl border border-gray-300">
      <!-- Image Upload -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-24 h-24 rounded-full bg-gray-200 flex justify-center items-center relative overflow-hidden">
          <template v-if="imagePreview">
            <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
          </template>
          <template v-else>
            <i class="fas fa-image text-gray-500 text-3xl"></i>
          </template>
          <input
            type="file"
            accept=".jpeg,.jpg,.png,.webp"
            class="absolute w-full h-full opacity-0 cursor-pointer"
            @change="onImageUpload"
          />
          <span v-if="!imagePreview" class="absolute bottom-0 right-0 text-blue-500 text-xl">+</span>
        </div>
        <p class="text-center text-sm text-gray-500 mt-2">Upload your Image (jpeg, jpg, png, webp)</p>
      </div>

      <!-- Inline Error Message -->
      <p v-if="errorMessage" class="text-red-600 font-medium mb-4 text-center whitespace-pre-line">
        {{ errorMessage }}
      </p>

      <!-- Inline Success Message -->
      <p v-if="successMessage" class="text-green-600 font-medium mb-4 text-center whitespace-pre-line">
        {{ successMessage }}
      </p>

      <!-- Form Fields -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="text-sm text-gray-600">Name *</label>
          <input type="text" v-model="form.name" class="w-full border-b p-1" required />
        </div>
        <div>
          <label class="text-sm text-gray-600">Email *</label>
          <input type="email" v-model="form.email" class="w-full border-b p-1" required />
        </div>
        <div>
          <label class="text-sm text-gray-600">Company</label>
          <input type="text" v-model="form.company" class="w-full border-b p-1" />
        </div>
        <div>
          <label class="text-sm text-gray-600">Your Position</label>
          <input type="text" v-model="form.position" class="w-full border-b p-1" />
        </div>
      </div>

      <div class="mt-4">
        <label class="text-sm text-gray-600">Testimonial *</label>
        <textarea v-model="form.testimonial" rows="4" class="w-full border-b p-1 mt-1" required></textarea>
      </div>

      <!-- Consent Checkbox -->
      <div class="flex items-start mt-4">
        <input type="checkbox" v-model="form.to_publish" class="mr-2 mt-1" />
        <label class="text-sm text-gray-600 italic">
          Do you provide <span class="font-semibold">consent</span> to show the testimonial on the website?
        </label>
      </div>

      <!-- Submit Button -->
      <button
        @click="submitForm"
        :disabled="isLoading"
        class="w-full mt-6 bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600 transition disabled:bg-green-300 disabled:cursor-not-allowed"
      >
        <span v-if="isLoading">Submitting...</span>
        <span v-else>SUBMIT TESTIMONIAL</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
input,
textarea {
  outline: none;
}
.required-field::after {
  content: ' *';
  color: red;
}
</style>
