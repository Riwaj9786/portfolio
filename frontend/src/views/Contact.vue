<script setup>
import ContactForm from "@/components/Contact/ContactForm.vue";
import ConnectSection from "@/components/Contact/ConnectSection.vue";
</script>

<template>
  <main class="page-wrap max-w-[1380px]">
    <header class="mb-9 grid gap-5 sm:mb-12 sm:gap-8 lg:grid-cols-[1fr_400px] lg:items-end">
      <div>
        <div class="mb-5 flex items-center gap-3">
          <span class="h-2 w-2 animate-pulse rounded-full bg-green-400"></span
          ><span class="eyebrow">Available for thoughtful work</span>
        </div>
        <h1 class="section-title max-w-4xl">
          Have an idea?<br /><span class="text-[var(--primary)]"
            >Let’s bring it to life.</span
          >
        </h1>
      </div>
      <p class="max-w-md text-base leading-relaxed text-[var(--muted)]">
        Tell me what you’re building, where you’re stuck, or simply say hello.
        I’ll read every message and get back to you personally.
      </p>
    </header>

    <div class="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
      <ConnectSection />
      <ContactForm />
    </div>
  </main>
</template>
