<script setup>
import { computed, onMounted, ref } from "vue";
import portfolioContent from "@/content";
import { academicQualificationCards } from "@/academicQualifications.mjs";
import ExperienceCard from "./ExperienceCard.vue";

const qualifications = ref([]);
const qualificationCards = computed(() =>
  academicQualificationCards(qualifications.value),
);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    qualifications.value = (
      await portfolioContent.get("education/qualifications/")
    ).data;
  } catch (cause) {
    console.error("Unable to load academic qualifications:", cause);
    error.value = "Academic qualifications could not be loaded.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section
    id="academic-qualifications"
    class="mb-5 sm:mb-6 lg:mb-10"
    aria-labelledby="academic-qualifications-title"
    :aria-busy="loading"
  >
    <header v-reveal class="mb-4 lg:mb-6">
      <h2 id="academic-qualifications-title" class="section-title">
        Academic Qualifications
      </h2>
    </header>
    <div
      v-if="loading"
      class="h-28 animate-pulse rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
      aria-label="Loading academic qualifications"
    ></div>
    <p v-else-if="error" role="alert" class="py-4 text-sm text-red-500">
      {{ error }}
    </p>
    <div v-else-if="qualificationCards.length" class="space-y-3">
      <ExperienceCard
        class="academic-card"
        v-for="qualification in qualificationCards"
        :key="qualification.id"
        :company="qualification.company"
        :company_url="qualification.company_url"
        :roles="qualification.roles"
        item_label="qualifications"
        period=""
      />
    </div>
    <p v-else class="py-6 text-sm text-[var(--muted)]">
      No academic qualifications to display.
    </p>
  </section>
</template>

<style scoped>
.academic-card :deep(.role-item .role-summary) {
  grid-template-columns: minmax(0, 1fr) auto 1rem;
}
.academic-card :deep(.role-summary .role-period) {
  grid-column: 2;
  grid-row: 1;
  text-align: right;
  white-space: nowrap;
}
.academic-card :deep(.role-summary .role-chevron) {
  grid-column: 3;
  grid-row: 1;
}
</style>
