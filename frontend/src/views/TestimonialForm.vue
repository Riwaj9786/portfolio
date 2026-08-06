<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import axiosInstance from "@/axios";

const apiEndpoint = "testimonial/testimonials/add/";
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const emptyForm = () => ({
  name: "",
  email: "",
  image: null,
  company: "",
  position: "",
  testimonial: "",
  to_publish: false,
});

const form = ref(emptyForm());
const invitedName = ref("");
const imagePreview = ref("");
const fileInput = ref(null);
const isLoading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");
const fieldErrors = ref({});

const testimonialLength = computed(() => form.value.testimonial.length);

function decodeAndFillForm() {
  const refParam = new URL(window.location.href).searchParams.get("ref");
  if (!refParam) return;
  try {
    const [decodedName = "", decodedEmail = ""] = atob(refParam).split("|");
    invitedName.value = decodedName.trim();
    form.value.name = decodedName.trim();
    form.value.email = decodedEmail.trim();
  } catch (_) {
    // An invalid invitation reference should not prevent manual submission.
  }
}

function clearPreview() {
  if (imagePreview.value?.startsWith("blob:")) URL.revokeObjectURL(imagePreview.value);
  imagePreview.value = "";
}

function removeImage() {
  clearPreview();
  form.value.image = null;
  if (fileInput.value) fileInput.value.value = "";
}

function onImageUpload(event) {
  errorMessage.value = "";
  const file = event.target.files?.[0];
  if (!file) return removeImage();
  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value = "Please choose a JPG, PNG, or WebP image.";
    return removeImage();
  }
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = "Your image must be smaller than 2 MB.";
    return removeImage();
  }
  clearPreview();
  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
}

function validateForm() {
  const errors = {};
  if (!form.value.name.trim()) errors.name = "Please enter your name.";
  if (!form.value.email.trim()) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) errors.email = "Enter a valid email address.";
  if (!form.value.testimonial.trim()) errors.testimonial = "Please share a few words about your experience.";
  else if (form.value.testimonial.trim().length < 20) errors.testimonial = "Please add a little more detail (at least 20 characters).";
  fieldErrors.value = errors;
  return !Object.keys(errors).length;
}

function resetForm() {
  removeImage();
  form.value = emptyForm();
  fieldErrors.value = {};
}

async function submitForm() {
  errorMessage.value = "";
  successMessage.value = "";
  if (!validateForm()) {
    requestAnimationFrame(() => document.querySelector("[aria-invalid='true']")?.focus());
    return;
  }

  isLoading.value = true;
  try {
    const formData = new FormData();
    for (const key of ["name", "email", "company", "position", "testimonial", "to_publish"]) {
      formData.append(key, form.value[key]);
    }
    if (form.value.image) formData.append("image", form.value.image);

    const response = await axiosInstance.post(apiEndpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 201) {
      resetForm();
      successMessage.value = "Thank you—your testimonial was submitted successfully.";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  } catch (error) {
    let message = "Something went wrong while submitting your testimonial.";
    if (error.response?.status === 413) message = "The image is too large. Please choose one smaller than 2 MB.";
    else if (error.response?.data) {
      const data = error.response.data;
      message = typeof data === "object" ? Object.values(data).flat().join(" ") : data;
    } else if (error.request) message = "We could not connect. Check your internet connection and try again.";
    errorMessage.value = message;
  } finally {
    isLoading.value = false;
  }
}

onMounted(decodeAndFillForm);
onBeforeUnmount(clearPreview);
</script>

<template>
  <section class="testimonial-page relative isolate overflow-hidden px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-20">
    <div class="testimonial-glow testimonial-glow-one" aria-hidden="true"></div>
    <div class="testimonial-glow testimonial-glow-two" aria-hidden="true"></div>

    <div class="relative mx-auto grid max-w-[1240px] items-start gap-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-12 xl:gap-16">
      <aside class="lg:sticky lg:top-28 lg:pt-7">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]">
          <i class="pi pi-sparkles text-[10px]"></i> Your perspective matters
        </div>
        <h1 class="max-w-xl text-4xl font-bold leading-[1.02] tracking-[-.055em] text-[var(--ink)] sm:text-5xl xl:text-6xl">
          Share the story of <span class="text-[var(--primary)]">our work.</span>
        </h1>
        <p class="mt-6 max-w-xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          <template v-if="invitedName">Hi {{ invitedName }}—</template>
          Your honest feedback helps future collaborators understand what it is like to work together, and helps me keep improving.
        </p>

        <div class="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <div class="trust-item"><i class="pi pi-clock"></i><span><strong>2 minutes</strong><small>Quick to complete</small></span></div>
          <div class="trust-item"><i class="pi pi-lock"></i><span><strong>Private email</strong><small>Never displayed</small></span></div>
          <div class="trust-item"><i class="pi pi-check-circle"></i><span><strong>Your choice</strong><small>Publishing is optional</small></span></div>
        </div>

        <blockquote class="mt-8 border-l-2 border-[var(--primary)] pl-5 text-sm italic leading-6 text-[var(--muted)]">
          “Thoughtful feedback is one of the most meaningful ways to help good work become better.”
        </blockquote>
      </aside>

      <div class="form-card rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl shadow-purple-950/10 sm:p-8 lg:p-9">
        <div class="mb-7 flex items-start justify-between gap-4 border-b border-[var(--line)] pb-6">
          <div><p class="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]">Testimonial form</p><h2 class="mt-1 text-2xl font-bold tracking-[-.035em] text-[var(--ink)] sm:text-3xl">Tell me about your experience</h2><p class="mt-2 text-xs text-[var(--muted)]">Fields marked with <span class="text-[var(--primary)]">*</span> are required.</p></div>
          <span class="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-purple-500/10 text-[var(--primary)] sm:grid"><i class="pi pi-comment"></i></span>
        </div>

        <div v-if="successMessage" class="notice success" role="status"><i class="pi pi-check-circle"></i><div><strong>Successfully received</strong><p>{{ successMessage }}</p></div></div>
        <div v-if="errorMessage" class="notice error" role="alert"><i class="pi pi-exclamation-circle"></i><div><strong>Unable to submit</strong><p>{{ errorMessage }}</p></div></div>

        <form novalidate @submit.prevent="submitForm">
          <div class="mb-7 flex flex-col gap-4 rounded-2xl border border-dashed border-[var(--line)] bg-purple-500/[.035] p-4 sm:flex-row sm:items-center">
            <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-purple-500/10 ring-1 ring-purple-400/20">
              <img v-if="imagePreview" :src="imagePreview" alt="Selected profile photo" class="h-full w-full object-cover" />
              <span v-else class="grid h-full w-full place-items-center text-2xl text-[var(--primary)]"><i class="pi pi-user"></i></span>
            </div>
            <div class="min-w-0 flex-1"><strong class="block text-sm text-[var(--ink)]">Add a profile photo <span class="font-normal text-[var(--muted)]">(optional)</span></strong><p class="mt-1 text-xs leading-5 text-[var(--muted)]">A clear square photo works best. JPG, PNG or WebP, up to 2 MB.</p><div class="mt-3 flex flex-wrap gap-2"><label for="testimonial-photo" class="upload-button"><i class="pi pi-upload"></i>{{ form.image ? "Replace photo" : "Choose photo" }}</label><button v-if="form.image" type="button" class="remove-button" @click="removeImage">Remove</button></div><p v-if="form.image" class="mt-2 truncate text-[10px] text-[var(--muted)]">{{ form.image.name }}</p></div>
            <input id="testimonial-photo" ref="fileInput" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" @change="onImageUpload" />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <div class="field-wrap"><label for="testimonial-name">Name <span>*</span></label><input id="testimonial-name" v-model.trim="form.name" type="text" autocomplete="name" placeholder="Your full name" :aria-invalid="!!fieldErrors.name" :aria-describedby="fieldErrors.name ? 'name-error' : undefined" @input="delete fieldErrors.name" /><small v-if="fieldErrors.name" id="name-error" class="field-error">{{ fieldErrors.name }}</small></div>
            <div class="field-wrap"><label for="testimonial-email">Email <span>*</span></label><input id="testimonial-email" v-model.trim="form.email" type="email" inputmode="email" autocomplete="email" placeholder="you@company.com" :aria-invalid="!!fieldErrors.email" :aria-describedby="fieldErrors.email ? 'email-error' : 'email-help'" @input="delete fieldErrors.email" /><small v-if="fieldErrors.email" id="email-error" class="field-error">{{ fieldErrors.email }}</small><small v-else id="email-help" class="field-help">Used for verification only—never published.</small></div>
            <div class="field-wrap"><label for="testimonial-company">Company</label><input id="testimonial-company" v-model.trim="form.company" type="text" autocomplete="organization" placeholder="Company or organization" /></div>
            <div class="field-wrap"><label for="testimonial-position">Role</label><input id="testimonial-position" v-model.trim="form.position" type="text" autocomplete="organization-title" placeholder="Your role or position" /></div>
          </div>

          <div class="field-wrap mt-5"><div class="flex items-center justify-between gap-3"><label for="testimonial-message">Your testimonial <span>*</span></label><small class="field-help">{{ testimonialLength }} characters</small></div><textarea id="testimonial-message" v-model="form.testimonial" rows="6" maxlength="1500" placeholder="What did we work on? What stood out, and what result did the work create?" :aria-invalid="!!fieldErrors.testimonial" :aria-describedby="fieldErrors.testimonial ? 'testimonial-error' : 'testimonial-help'" @input="delete fieldErrors.testimonial"></textarea><small v-if="fieldErrors.testimonial" id="testimonial-error" class="field-error">{{ fieldErrors.testimonial }}</small><small v-else id="testimonial-help" class="field-help">A specific outcome or memorable detail makes the strongest testimonial.</small></div>

          <label class="consent-card mt-5"><input v-model="form.to_publish" type="checkbox" /><span class="custom-check"><i class="pi pi-check"></i></span><span><strong>Allow this testimonial to appear on the portfolio</strong><small>This is optional. Your testimonial will only be displayed publicly when selected.</small></span></label>

          <button type="submit" :disabled="isLoading" class="submit-button mt-7"><span v-if="isLoading" class="flex items-center justify-center gap-2"><i class="pi pi-spin pi-spinner"></i> Sending your testimonial…</span><span v-else class="flex items-center justify-center gap-2">Submit testimonial <i class="pi pi-arrow-right"></i></span></button>
          <p class="mt-3 text-center text-[10px] leading-5 text-[var(--muted)]"><i class="pi pi-shield mr-1 text-[var(--primary)]"></i>Your information is used only to review and manage this testimonial.</p>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.testimonial-page{background:linear-gradient(145deg,color-mix(in srgb,var(--bg) 96%,#7c3aed),var(--bg));min-height:calc(100dvh - 5rem)}
.testimonial-glow{position:absolute;border-radius:999px;filter:blur(1px);pointer-events:none}.testimonial-glow-one{width:32rem;height:32rem;right:-16rem;top:-16rem;background:radial-gradient(circle,rgba(168,85,247,.14),transparent 67%)}.testimonial-glow-two{width:26rem;height:26rem;left:-15rem;bottom:-13rem;background:radial-gradient(circle,rgba(124,58,237,.11),transparent 68%)}
.trust-item{display:flex;align-items:center;gap:.75rem;padding:.85rem;border:1px solid var(--line);border-radius:1rem;background:color-mix(in srgb,var(--surface) 84%,transparent)}.trust-item>i{display:grid;width:2rem;height:2rem;place-items:center;border-radius:.7rem;background:rgba(124,58,237,.1);color:var(--primary);font-size:.75rem}.trust-item strong,.trust-item small{display:block}.trust-item strong{font-size:.72rem;color:var(--ink)}.trust-item small{margin-top:.1rem;font-size:.6rem;color:var(--muted)}
.notice{display:flex;gap:.75rem;margin-bottom:1.25rem;padding:1rem;border-radius:1rem;font-size:.75rem}.notice>i{margin-top:.15rem}.notice strong{display:block;margin-bottom:.15rem}.notice p{margin:0;line-height:1.5}.notice.success{color:#166534;background:#dcfce7}.notice.error{color:#991b1b;background:#fee2e2}
.upload-button,.remove-button{display:inline-flex;align-items:center;gap:.4rem;padding:.5rem .7rem;border-radius:.65rem;font-size:.65rem;font-weight:700;cursor:pointer;transition:.2s ease}.upload-button{color:white;background:var(--primary)}.upload-button:hover{transform:translateY(-1px);filter:brightness(1.08)}.remove-button{color:var(--muted);border:1px solid var(--line);background:var(--surface)}.remove-button:hover{color:#dc2626;border-color:#fca5a5}
.field-wrap label{display:block;margin-bottom:.45rem;color:var(--ink);font-size:.72rem;font-weight:700}.field-wrap label span{color:var(--primary)}.field-wrap input,.field-wrap textarea{width:100%;border:1px solid var(--line);border-radius:.85rem;background:color-mix(in srgb,var(--surface) 92%,var(--bg));padding:.78rem .9rem;color:var(--ink);font-size:.78rem;outline:none;transition:border-color .18s,box-shadow .18s,background .18s}.field-wrap textarea{min-height:9rem;resize:vertical;line-height:1.65}.field-wrap input::placeholder,.field-wrap textarea::placeholder{color:color-mix(in srgb,var(--muted) 72%,transparent)}.field-wrap input:focus,.field-wrap textarea:focus{border-color:var(--primary);background:var(--surface);box-shadow:0 0 0 3px rgba(124,58,237,.12)}.field-wrap [aria-invalid=true]{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.08)}.field-help,.field-error{display:block;margin-top:.4rem;font-size:.62rem;line-height:1.45}.field-help{color:var(--muted)}.field-error{color:#dc2626;font-weight:700}
.consent-card{display:flex;align-items:flex-start;gap:.75rem;padding:1rem;border:1px solid var(--line);border-radius:1rem;cursor:pointer;transition:.2s ease}.consent-card:hover{border-color:color-mix(in srgb,var(--primary) 50%,var(--line));background:rgba(124,58,237,.035)}.consent-card input{position:absolute;opacity:0;pointer-events:none}.custom-check{display:grid;flex:0 0 1.2rem;width:1.2rem;height:1.2rem;place-items:center;margin-top:.05rem;border:1px solid var(--line);border-radius:.35rem;color:transparent;background:var(--surface);font-size:.58rem;transition:.18s}.consent-card input:checked+.custom-check{color:white;border-color:var(--primary);background:var(--primary)}.consent-card input:focus-visible+.custom-check{box-shadow:0 0 0 3px rgba(124,58,237,.18)}.consent-card strong,.consent-card small{display:block}.consent-card strong{color:var(--ink);font-size:.7rem}.consent-card small{margin-top:.25rem;color:var(--muted);font-size:.62rem;line-height:1.5}
.submit-button{width:100%;border:0;border-radius:.9rem;padding:.9rem 1rem;color:white;background:linear-gradient(110deg,#6d28d9,#9333ea 55%,#c026d3);box-shadow:0 12px 25px rgba(124,58,237,.22);font-size:.78rem;font-weight:800;transition:.22s ease}.submit-button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 16px 30px rgba(124,58,237,.3)}.submit-button:disabled{cursor:not-allowed;opacity:.65}
@media(max-width:639px){.form-card{border-radius:1.35rem}.testimonial-page{padding-left:.75rem;padding-right:.75rem}}
@media(prefers-reduced-motion:reduce){.upload-button,.submit-button,.consent-card{transition:none}.submit-button:hover:not(:disabled),.upload-button:hover{transform:none}}
</style>
