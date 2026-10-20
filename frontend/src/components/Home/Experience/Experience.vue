<script setup>
import { enterContent, leaveContent, cancelTransition } from "@/motion/portfolioMotion";
import ExperienceCard from "./ExperienceCard.vue";
import portfolioContent from "@/content";
import { computed, ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const data = ref([]);
const loading = ref(true);
const error = ref(null);
const activeCategory = ref("professional");
const route = useRoute();
watch(
  () => route.query.journey,
  (category) => {
    activeCategory.value =
      category === "leadership" ? "leadership" : "professional";
  },
  { immediate: true },
);
const tabs = [
  { value: "professional", label: "Professional" },
  { value: "leadership", label: "Leadership" },
];
function handleTabKey(event, index) {
  const key = event.key;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(key)) return;
  event.preventDefault();
  const next =
    key === "Home" ? 0 : key === "End" ? 1 : (index + 1) % tabs.length;
  activeCategory.value = tabs[next].value;
  event.currentTarget.parentElement
    .querySelectorAll('[role="tab"]')
    [next].focus();
}

const groupedExperiences = computed(() => {
  const companies = new Map();

  data.value
    .filter(
      (experience) =>
        (experience.category || "professional") === activeCategory.value,
    )
    .forEach((experience) => {
      const key =
        experience.company?.trim().toLocaleLowerCase() ||
        `experience-${experience.id}`;
      if (!companies.has(key)) {
        companies.set(key, {
          company: experience.company,
          company_url: experience.company_url,
          logo: experience.logo,
          roles: [],
        });
      }
      const group = companies.get(key);
      group.roles.push(experience);
      if (!group.company_url && experience.company_url)
        group.company_url = experience.company_url;
      if (!group.logo && experience.logo) group.logo = experience.logo;
    });

  return Array.from(companies.values())
    .map((group) => ({
      ...group,
      roles: group.roles.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.roles[0]?.start_date) - new Date(a.roles[0]?.start_date),
    );
});

onMounted(async () => {
  try {
    const response = await portfolioContent.get("experience/experiences/");
    data.value = response.data;
  } catch (err) {
    error.value = "Error Fetching Data!";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="journey-section" aria-labelledby="journey-title">
    <header v-reveal class="mb-4 lg:mb-6">
      <h2 id="journey-title" class="section-title">My Journey</h2>
      <p class="mt-2 text-xs leading-relaxed text-[var(--muted)] lg:text-sm">
        A blend of professional expertise, leadership, and meaningful
        contributions.
      </p>
    </header>
    <div class="journey-tabs" role="tablist" aria-label="Experience categories">
      <span
        class="journey-tab-indicator"
        :class="{ 'is-leadership': activeCategory === 'leadership' }"
        aria-hidden="true"
      ></span>
      <button
        v-for="(tab, index) in tabs"
        :id="`journey-tab-${tab.value}`"
        :key="tab.value"
        type="button"
        role="tab"
        :aria-selected="activeCategory === tab.value"
        :aria-controls="`journey-panel-${tab.value}`"
        :tabindex="activeCategory === tab.value ? 0 : -1"
        :class="{ 'is-active': activeCategory === tab.value }"
        @click="activeCategory = tab.value"
        @keydown="handleTabKey($event, index)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div
      :id="`journey-panel-${activeCategory}`"
      role="tabpanel"
      :aria-labelledby="`journey-tab-${activeCategory}`"
      tabindex="0"
    >
      <!-- Skeleton Loading State -->
      <div v-if="loading" class="space-y-6">
        <div
          v-for="n in 3"
          :key="'skeleton-' + n"
          class="p-6 border border-gray-700 rounded-lg animate-pulse"
        >
          <div class="flex justify-between">
            <div class="h-6 w-3/4 bg-gray-700 rounded"></div>
            <div class="h-4 w-1/4 bg-gray-700 rounded"></div>
          </div>
          <div class="mt-4 h-5 w-1/2 bg-gray-700 rounded"></div>
          <div class="mt-4 flex space-x-2">
            <div class="h-4 w-16 bg-gray-700 rounded"></div>
            <div class="h-4 w-16 bg-gray-700 rounded"></div>
          </div>
          <div class="mt-6 grid grid-cols-5 gap-2">
            <div
              v-for="skill in 5"
              :key="skill"
              class="h-4 bg-gray-700 rounded"
            ></div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="text-red-500 p-4 border border-red-500 rounded"
      >
        {{ error }}
      </div>

      <!-- Actual Content -->
      <Transition v-else :css="false" mode="out-in" @enter="enterContent" @leave="leaveContent" @enter-cancelled="cancelTransition" @leave-cancelled="cancelTransition">
        <div :key="activeCategory" v-stagger>
          <div v-for="company in groupedExperiences" :key="company.company">
            <ExperienceCard
              :company="company.company"
              :company_url="company.company_url"
              :logo="company.logo"
              :roles="company.roles"
            />
          </div>
          <p
            v-if="!groupedExperiences.length"
            class="py-6 text-sm text-[var(--muted)]"
          >
            No experiences in this category yet.
          </p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.journey-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  position: relative;
  isolation: isolate;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  margin-bottom: 1rem;
}
.journey-tab-indicator {
  position: absolute;
  z-index: -1;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc((100% - 8px) / 2);
  border-radius: 999px;
  background: var(--primary-action);
  transition: transform 0.32s cubic-bezier(.22,1,.36,1);
}
.journey-tab-indicator.is-leadership {
  transform: translateX(100%);
}
.journey-tabs button {
  min-height: 44px;
  padding: 0.5rem 0.4rem;
  font-size: clamp(0.62rem, 1.4vw, 0.78rem);
  font-weight: 700;
  color: var(--muted);
  border-radius: 999px;
  transition: color 0.25s;
}
.journey-tabs button.is-active {
  color: white;
}
.journey-tabs button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
.journey-enter-active,
.journey-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s;
}
.journey-enter-from,
.journey-leave-to {
  opacity: 0;
  transform: translateY(5px);
}
@media (prefers-reduced-motion: reduce) {
  .journey-tab-indicator,
  .journey-tabs button,
  .journey-enter-active,
  .journey-leave-active {
    transition: none;
  }
}
</style>
