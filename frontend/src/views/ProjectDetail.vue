<script setup>
import ProjectDescription from "@/components/Projects/ProjectDescription.vue";
import ProjectSideHandles from "@/components/Projects/ProjectSideHandles.vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";
import ImportantLinks from "@/components/Projects/ImportantLinks.vue";
import ProjectImageSlider from "@/components/Projects/ProjectImageSlider.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "@/axios";

const route = useRoute();
const slug = route.params.slug;

const project = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await axiosInstance.get(`projects/project/${slug}/`);
    project.value = response.data;
  } catch (err) {
    error.value = err.response?.data?.detail || err.message;
  } finally {
    loading.value = false;
  }
});

const isBannerFullscreen = ref(false);

const openBannerFullscreen = () => {
  isBannerFullscreen.value = true;
};

const closeBannerFullscreen = () => {
  isBannerFullscreen.value = false;
};
</script>

<template>
  <div class="page-wrap">
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
      <div class="order-2 min-w-0 lg:order-none">
        <ProjectDescription
          :name="project.name"
          :description="project.description"
        />
        <div class="mt-7">
          <ProjectImageSlider
            v-if="project.project_images?.length"
            :images="project.project_images"
          />
        </div>
      </div>

      <aside
        class="detail-aside order-1 flex h-fit flex-col gap-y-6 p-4 sm:p-5 lg:order-none lg:sticky lg:top-28"
      >
        <div class="overflow-hidden rounded-[1.2rem] bg-purple-500/10">
          <img
            class="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
            :src="project.banner_image"
            :alt="project.name"
          />
        </div>

        <ProjectSideHandles
          :client="project.client"
          :start_date="project.start_date"
          :end_date="project.end_date"
          :category="project.category"
        />

        <div>
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

        <div v-if="project.project_links && project.project_links.length">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]"
          >
            Important links
          </p>
          <div class="flex flex-wrap gap-2">
            <ImportantLinks
              v-for="(link, index) in project.project_links"
              :name="link.name"
              :link="link.link"
            />
          </div>
        </div>

        <div v-if="project.distinct_features" class="description-container text-justify">
          <p
            class="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--muted)]"
          >
            Distinct features
          </p>
          <div
            v-html="project.distinct_features"
            class="text-[var(--muted)] text-xs lg:text-sm"
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
