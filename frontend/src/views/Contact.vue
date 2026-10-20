<script setup>
import WorkTogether from "@/components/Contact/WorkTogether.vue";
import ConnectSection from "@/components/Contact/ConnectSection.vue";
</script>

<template>
  <main class="portfolio-contact page-wrap">
    <header
      class="mb-9 grid gap-5 sm:mb-12 sm:gap-8 lg:grid-cols-[1fr_400px] lg:items-end"
    >
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
      <p
        class="max-w-lg text-base text-justify leading-relaxed text-[var(--muted)]"
      >
        Looking for backend engineering, project leadership, or graphics design?
        Reach out directly by email or WhatsApp and let’s talk about your next
        step.
      </p>
    </header>

    <div v-stagger class="grid items-stretch gap-5 lg:grid-cols-2">
      <ConnectSection />
      <WorkTogether />
    </div>
  </main>
</template>
