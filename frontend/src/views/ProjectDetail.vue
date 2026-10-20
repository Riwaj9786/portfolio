<script setup>
import ProjectDescription from "@/components/Projects/ProjectDescription.vue";
import ProjectSideHandles from "@/components/Projects/ProjectSideHandles.vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";
import ImportantLinks from "@/components/Projects/ImportantLinks.vue";
import ProjectImageSlider from "@/components/Projects/ProjectImageSlider.vue";

import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import portfolioContent from "@/content";

const route = useRoute();

const project = ref([]);
const loading = ref(true);
const error = ref(null);

const bannerFailed = ref(false);
watch(() => route.params.slug, async (slug, _, onCleanup) => {
  let stale = false;
  onCleanup(() => { stale = true; });
  loading.value = true;
  error.value = null;
  bannerFailed.value = false;
  try {
    const response = await portfolioContent.get(`projects/project/${slug}/`);
    if (!stale) project.value = response.data;
  } catch (err) {
    if (!stale) error.value = err.response?.data?.detail || err.message;
  } finally {
    if (!stale) loading.value = false;
  }
}, { immediate: true });
</script>

<template>
  <div class="portfolio-project-detail page-wrap">
    <div v-if="loading" class="grid gap-6 lg:grid-cols-3">
      <div
        class="h-96 animate-pulse rounded-[2rem] bg-purple-500/10 lg:col-span-2"
      ></div>
      <div class="h-96 animate-pulse rounded-[2rem] bg-purple-500/10"></div>
    </div>
    <div v-else-if="error" class="surface p-10 text-center">
      <p class="font-bold text-red-400">Unable to load this project</p>
      <p class="mt-2 text-sm text-[var(--muted)]">{{ error }}</p>
      <RouterLink to="/projects" class="mt-5 inline-block text-[var(--primary)]"
        >Back to projects →</RouterLink
      >
    </div>
    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:gap-8"
    >
      <RouterLink
        to="/projects"
        class="order-first inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)] lg:col-span-2"
        ><i class="pi pi-arrow-left text-xs"></i> All projects</RouterLink
      >
      <div class="order-2 min-w-0 space-y-5 lg:order-none lg:space-y-7">
        <nav class="flex flex-wrap gap-4 px-1 text-[11px] font-semibold text-[var(--muted)]" aria-label="Project sections">
          <a href="#project-overview" class="hover:text-[var(--primary)]">Overview</a>
          <a v-if="project.project_images?.length" href="#project-gallery" class="hover:text-[var(--primary)]">Gallery</a>
        </nav>
        <section v-reveal id="project-overview" class="surface scroll-mt-28 p-1 sm:p-2" aria-label="Project overview">
        <ProjectDescription
          :name="project.name"
          :description="project.description"
        />
        </section>
        <section v-reveal v-if="project.project_images?.length" id="project-gallery" class="surface scroll-mt-28 p-4 sm:p-6" aria-labelledby="project-gallery-title">
          <div class="flex items-center justify-between gap-3"><h2 id="project-gallery-title" class="text-sm font-bold text-[var(--ink)] sm:text-base">Project gallery</h2><span class="text-[10px] text-[var(--muted)]">{{ project.project_images.length }} images</span></div>
          <ProjectImageSlider
            :images="project.project_images"
          />
        </section>
      </div>

      <aside
        id="project-details" aria-label="Project details"
        class="detail-aside scroll-mt-28 order-1 flex h-fit flex-col gap-y-6 p-4 sm:p-5 lg:order-none lg:sticky lg:top-28"
      >
        <div class="flex items-center justify-between gap-2 border-b border-[var(--line)] pb-3"><p class="text-[10px] font-bold uppercase tracking-[.15em] text-[var(--primary)]">Project at a glance</p><i class="pi pi-briefcase text-xs text-[var(--muted)]" aria-hidden="true"></i></div>
        <div class="relative overflow-hidden rounded-[1.2rem] bg-purple-500/10">
          <img
            v-if="project.banner_image && !bannerFailed"
            @error="bannerFailed = true"
            class="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
            :src="project.banner_image"
            :alt="project.name"
          />
          <div v-else class="detail-thumbnail aspect-[4/3]" aria-hidden="true"><span>{{ project.name?.slice(0, 1) }}</span></div>
        </div>

        <ProjectSideHandles
          :client="project.client"
          :start_date="project.start_date"
          :end_date="project.end_date"
          :category="project.category"
        />

        <div class="border-t border-[var(--line)] pt-4">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]"
          >
            Tools used
          </p>
          <div class="flex flex-wrap gap-2">
            <SkillButton
              v-for="(skill, index) in project.skills"
              :key="index"
              :text="skill.name"
            />
          </div>
        </div>

        <div v-if="project.project_links && project.project_links.length" class="border-t border-[var(--line)] pt-4">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]"
          >
            Important links
          </p>
          <div class="flex flex-wrap gap-2">
            <ImportantLinks
              v-for="(link, index) in project.project_links"
              :key="index"
              :name="link.name"
              :link="link.link"
            />
          </div>
        </div>

        <div v-if="project.distinct_features" class="description-container border-t border-[var(--line)] pt-4">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]"
          >
            Distinct features
          </p>
          <div
            v-html="project.distinct_features"
            class="text-[var(--muted)] text-xs lg:text-sm text-justify"
          ></div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style>
.description-container ul,
.description-container ol {
  padding-left: 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.description-container ul {
  list-style-type: disc;
}

.description-container ol {
  list-style-type: decimal;
}

.description-container ul li,
.description-container ol li {
  margin-left: 1rem;
  margin-bottom: 0.25rem;
}

.description-container b,
.description-container strong {
  color: var(--primary);
  opacity: 70%;
}

.description-container a {
  text-decoration: underline;
}
</style>

<style scoped>
.detail-thumbnail { display:grid;place-items:center;overflow:hidden;background: var(--surface); }
.detail-thumbnail span { display:grid;place-items:center;width:110px;height:110px;background: var(--primary-action);border-radius:30%;color:white;font-size:4.5rem;font-weight:800;box-shadow:15px 20px 40px color-mix(in srgb,var(--primary) 20%,transparent); }
a:focus-visible { outline:2px solid var(--primary);outline-offset:4px; }
</style>
