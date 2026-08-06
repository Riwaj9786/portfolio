<script setup>
import { computed, ref } from 'vue'
import axiosInstance from '@/axios'

const loading = ref(false), status = ref({ type: '', message: '' })
const formData = ref({ name: '', email: '', message: '' })
const messageLength = computed(() => formData.value.message.length)

const submitForm = async () => {
  status.value = { type: '', message: '' }
  if (!formData.value.name.trim() || !formData.value.email.trim() || !formData.value.message.trim()) { status.value = { type: 'error', message: 'Please complete all fields before sending.' }; return }
  loading.value = true
  try {
    await axiosInstance.post('/contact/message/create/', formData.value)
    status.value = { type: 'success', message: 'Thanks — your message is on its way. I’ll reply soon.' }
    formData.value = { name: '', email: '', message: '' }
  } catch (error) {
    status.value = { type: 'error', message: error.response?.data?.email?.[0] || 'Something went wrong. Please try again or email me directly.' }
  } finally { loading.value = false }
}
</script>

<template>
  <section class="surface flex flex-col p-5 sm:p-8 lg:p-11">
    <div class="mb-8 flex flex-col gap-3 border-b border-[var(--line)] pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div><p class="eyebrow">Project enquiry</p><h2 class="mt-2 text-3xl font-bold tracking-[-.04em] text-[var(--ink)] sm:text-4xl">Tell me about it.</h2></div>
      <p class="text-xs text-[var(--muted)]"><i class="pi pi-clock mr-1 text-[var(--primary)]"></i> Usually replies within 1–2 days</p>
    </div>

    <div v-if="status.message" role="status" class="mb-6 flex items-start gap-3 rounded-2xl border p-4 text-sm" :class="status.type === 'success' ? 'border-green-400/30 bg-green-500/10 text-green-600' : 'border-red-400/30 bg-red-500/10 text-red-500'"><i class="pi mt-0.5" :class="status.type === 'success' ? 'pi-check-circle' : 'pi-exclamation-circle'"></i><span>{{ status.message }}</span></div>

    <form class="flex flex-1 flex-col" @submit.prevent="submitForm">
      <div class="grid gap-5 sm:grid-cols-2">
        <label class="contact-field"><span>Your name</span><input v-model.trim="formData.name" type="text" name="name" autocomplete="name" required placeholder="How should I address you?" /></label>
        <label class="contact-field"><span>Email address</span><input v-model.trim="formData.email" type="email" name="email" autocomplete="email" required placeholder="you@company.com" /></label>
      </div>
      <label class="contact-field mt-5 flex flex-1 flex-col"><span>What can I help with?</span><textarea v-model="formData.message" name="message" required maxlength="2000" rows="9" class="min-h-52 flex-1 resize-y" placeholder="A little context about your idea, goals, timeline, or challenge…"></textarea><small class="mt-2 self-end text-[var(--muted)]">{{ messageLength }} / 2000</small></label>
      <div class="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="max-w-sm text-xs leading-relaxed text-[var(--muted)]"><i class="pi pi-lock mr-1 text-[var(--primary)]"></i> Your details are only used to respond to this enquiry.</p>
        <button type="submit" class="inline-flex min-w-44 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60" :disabled="loading"><i v-if="loading" class="pi pi-spin pi-spinner"></i>{{ loading ? 'Sending…' : 'Send Message' }}<i v-if="!loading" class="pi pi-arrow-up-right text-xs"></i></button>
      </div>
    </form>
  </section>
</template>
