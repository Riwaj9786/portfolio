<script setup>
import { onMounted, ref } from "vue";
import portfolioContent from "@/content";

const certifications = ref([]);

onMounted(async () => {
  try {
    const response = await portfolioContent.get("certification/certifications/");
    certifications.value = response.data;
  } catch (error) {
    console.error("Unable to load certifications:", error);
  }
});

const formatDate = (value) => {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};
</script>

<template>
  <section
    v-if="certifications.length"
    id="certifications"
    v-reveal
    class="mb-5 sm:mb-6 lg:mb-10"
    aria-labelledby="certifications-title"
  >
    <header class="mb-4 lg:mb-6">
      <h2 id="certifications-title" class="section-title">Certifications</h2>
      <p class="mt-2 text-xs leading-relaxed text-[var(--muted)] lg:text-sm">
        Learning milestones and the academies behind them.
      </p>
    </header>
    <div class="space-y-2">
      <a
        v-for="certificate in certifications"
        :key="certificate.id"
        :href="certificate.url || certificate.image"
        target="_blank"
        rel="noopener noreferrer"
        class="certificate-card surface flex min-w-0 items-center gap-3 overflow-hidden p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] sm:gap-4"
        :aria-label="`View ${certificate.title || 'certificate'} ${certificate.certificate_number} from ${certificate.academy} (opens in a new tab)`"
      >
        <div
          class="block w-20 shrink-0 overflow-hidden rounded-lg bg-purple-500/5 sm:w-28"
        >
          <img
            :src="certificate.image"
            :alt="`${certificate.title || 'Certificate'} from ${certificate.academy}`"
            loading="lazy"
            decoding="async"
            class="aspect-[4/3] w-full object-contain"
          />
        </div>
        <div class="flex min-w-0 flex-1 self-stretch flex-col justify-between gap-1">
          <div class="flex items-start justify-between gap-2">
            <h3 class="break-words text-sm font-bold leading-snug tracking-tight text-[var(--ink)] sm:text-base">
              {{ certificate.title || "Certificate" }}
            </h3>
            <span
              class="certificate-link-icon grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--primary)]"
              aria-hidden="true"
            >
              <i class="pi pi-arrow-up-right text-xs"></i>
            </span>
          </div>
          <dl class="flex flex-1 flex-wrap content-between justify-between gap-x-3 gap-y-1 text-[11px] leading-snug sm:text-xs">
            <div class="w-full">
              <dt class="sr-only">Academy</dt>
              <dd class="break-words text-xs font-semibold text-[var(--ink)] sm:text-sm">{{ certificate.academy }}</dd>
            </div>
            <div class="flex min-w-0 gap-1">
              <dt class="shrink-0 text-[var(--muted)]"><span class="sr-only">Certificate </span>No.</dt>
              <dd class="break-all font-medium text-[var(--ink)]">{{ certificate.certificate_number }}</dd>
            </div>
            <div v-if="certificate.issued_at" class="ml-auto flex gap-1 text-right">
              <dt class="text-[var(--muted)]">Issued</dt>
              <dd class="text-[var(--ink)]">
                <time :datetime="certificate.issued_at">{{ formatDate(certificate.issued_at) }}</time>
              </dd>
            </div>
          </dl>
        </div>
      </a>
    </div>
  </section>
</template>

<style scoped>
.certificate-card {
  transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
}

.certificate-link-icon {
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
}

.certificate-card:focus-visible {
  border-color: var(--primary);
}

.certificate-card:focus-visible .certificate-link-icon {
  background: var(--primary-action);
  border-color: var(--primary-action);
  color: white;
}

@media (hover: hover) {
  .certificate-card:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--primary) 30%, var(--line));
    box-shadow: 0 8px 24px color-mix(in srgb, var(--primary) 15%, transparent);
  }

  .certificate-card:hover .certificate-link-icon {
    background: var(--primary-action);
    border-color: color-mix(in srgb, var(--primary) 30%, var(--line));
    color: white;
  }
}

@media (prefers-reduced-motion: reduce) {
  .certificate-card,
  .certificate-link-icon {
    transition: none;
  }

  .certificate-card:hover {
    transform: none;
  }
}
</style>
