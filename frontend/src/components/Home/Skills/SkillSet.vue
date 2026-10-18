<script setup>
import SkillSetCategories from "./SkillSetCategories.vue";
import portfolioContent from "@/content";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";

const categories = ref([]);
const route = useRoute();
const selectedCategory = ref("");
const skills = ref([]);
const errorMessage = ref("");
const loading = ref(true);

onMounted(async () => {
  try {
    const [categoryResponse, skillResponse] = await Promise.all([
      portfolioContent.get("skill/categories/"),
      portfolioContent.get("skill/"),
    ]);
    categories.value = categoryResponse.data;
    skills.value = skillResponse.data;
    selectedCategory.value = categories.value.some((c) => c.name === route.query.skillCategory)
      ? route.query.skillCategory : categories.value[0]?.name || "";
  } catch (_) {
    errorMessage.value =
      "Skills could not be loaded from the portfolio content.";
  } finally {
    loading.value = false;
  }
});
watch(() => route.query.skillCategory, (category) => {
  if (categories.value.some((c) => c.name === category)) selectedCategory.value = category;
});

const categoryNames = computed(() => categories.value.map(({ name }) => name));
const categoryById = computed(
  () => new Map(categories.value.map(({ id, name }) => [id, name])),
);
const categoryName = (skill) =>
  categoryById.value.get(skill.category) || "Other";
const score = (level) => Math.min(10, Math.max(0, Number(level) || 0));
const ratingLabel = (level) =>
   score(level) >= 9
      ? "Expert"
      : score(level) >= 7
         ? "Advanced"
         : score(level) >= 5
         ? "Proficient"
         : "Growing";
   const visibleSkills = computed(() => {
   return skills.value
      .filter((skill) => categoryName(skill) === selectedCategory.value)
      .sort(
         (a, b) => score(b.level) - score(a.level) || a.name.localeCompare(b.name),
      );
   });
</script>

<template>
  <section class="surface h-full min-w-0 overflow-hidden p-3 sm:p-4 lg:p-5" aria-labelledby="skills-title">
    <header class="mb-3 border-b border-[var(--line)] pb-3">
      <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--primary)]">Tools & capabilities</p>
          <h2 id="skills-title" class="mt-1 text-xl font-bold tracking-[-.04em] text-[var(--ink)] sm:text-2xl">Skills by category</h2>
        </div>
        <p v-if="!loading && !errorMessage" class="pt-1 text-[11px] text-[var(--muted)]">
          <strong class="text-[var(--ink)]">{{ skills.length }}</strong> skills
          <span class="mx-1.5" aria-hidden="true">/</span>
          <strong class="text-[var(--ink)]">{{ categories.length }}</strong> disciplines
        </p>
      </div>
      <p class="mt-2 text-[11px] leading-relaxed text-[var(--muted)] sm:text-xs">
        Explore the tools I work with across engineering, design, and delivery.
        Proficiency is self-assessed on a scale of 10.
      </p>
    </header>

    <p v-if="errorMessage" role="alert" class="py-3 text-sm text-red-500">{{ errorMessage }}</p>
    <div v-else-if="loading" role="status" class="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
      <span class="sr-only">Loading skills…</span>
      <div v-for="n in 6" :key="n" class="h-16 animate-pulse rounded-xl bg-purple-500/10" aria-hidden="true"></div>
    </div>
    <template v-else>
      <SkillSetCategories :list="categoryNames" :activeCategory="selectedCategory" @categorySelected="selectedCategory = $event" />
      <div class="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[10px] text-[var(--muted)] sm:text-[11px]">
        <p role="status">{{ visibleSkills.length }} {{ visibleSkills.length === 1 ? 'skill' : 'skills' }} in {{ selectedCategory }}</p>
        <span>Sorted by proficiency</span>
      </div>

      <div v-if="visibleSkills.length" class="grid grid-cols-1 gap-2 pt-2 min-[400px]:grid-cols-2">
        <article v-for="skill in visibleSkills" :key="skill.id || skill.name" class="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5 transition-colors hover:border-purple-400/50">
          <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
            <h3 class="min-w-0 flex-1 break-words text-xs font-bold leading-snug text-[var(--ink)] sm:text-sm">{{ skill.name }}</h3>
            <span class="shrink-0 text-[9px] font-bold uppercase tracking-wide text-[var(--primary)]">{{ ratingLabel(skill.level) }}</span>
          </div>
          <div class="mt-2 h-1 overflow-hidden rounded-full bg-purple-500/10" role="meter" :aria-label="`${skill.name} proficiency`" :aria-valuenow="score(skill.level)" aria-valuemin="0" aria-valuemax="10">
            <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" :style="{ width: `${score(skill.level) * 10}%` }"></div>
          </div>
        </article>
      </div>
      <p v-else class="py-6 text-center text-sm text-[var(--muted)]">No skills in this category yet.</p>
    </template>
  </section>
</template>
