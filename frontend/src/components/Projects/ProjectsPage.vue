<script setup>
import { ref, onMounted, watch, computed } from "vue";
import ProjectCard from "@/components/Projects/ProjectCard.vue";
import ProjectCategory from "@/components/Projects/ProjectCategory.vue";
import SearchComponent from "@/components/Projects/SearchComponent.vue";
import axiosInstance from "@/axios";

const categories = ref([]);
const projects = ref([]);
const filteredProjects = ref([]);
const searchQuery = ref("");
const errorMessage = ref(null);
const selectedCategory = ref(null);
const loading = ref(false);

const currentPage = ref(1);
const itemsPerPage = 6;

// Fetch categories and initial projects
onMounted(async () => {
  try {
    loading.value = true;
    const response = await axiosInstance.get("projects/categories/");
    categories.value = [{ name: "All" }, ...response.data];
    selectedCategory.value = "All";
    await fetchProjects("All");
  } catch (error) {
    errorMessage.value = "Error fetching categories!";
  } finally {
    loading.value = false;
  }
});

const fetchProjects = async (category) => {
  selectedCategory.value = category;
  loading.value = true;
  projects.value = [];
  filteredProjects.value = [];

  try {
    let response;
    if (category === "All") {
      response = await axiosInstance.get("projects/project/");
    } else {
      const encodedCategory = encodeURIComponent(category);
      response = await axiosInstance.get(
        `projects/project/?category__name=${encodedCategory}`,
      );
    }

    projects.value = response.data;
    applySearchFilter();
  } catch (error) {
    errorMessage.value = "Failed to load projects.";
  } finally {
    loading.value = false;
  }
};

// Search filter
const applySearchFilter = () => {
  if (searchQuery.value) {
    filteredProjects.value = projects.value.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
    );
  } else {
    filteredProjects.value = projects.value;
  }
};

// Watch for search changes
watch(searchQuery, applySearchFilter);

// Reset to page 1 when data changes
watch([filteredProjects, searchQuery], () => {
  currentPage.value = 1;
});

// Paginated results
const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProjects.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => {
  return Math.ceil(filteredProjects.value.length / itemsPerPage);
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>

<template>
  <main
    class="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-9 sm:py-12 lg:px-14 lg:py-20"
  >
    <header class="mb-10 grid items-end gap-6 sm:mb-14 sm:gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 class="section-title max-w-3xl">
          Thoughtful work,<br /><span class="text-[var(--primary)]"
            >built to matter.</span
          >
        </h1>
        <p class="mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)]">
          A collection of digital products, visual identities, and engineering
          work shaped around real problems.
        </p>
      </div>
      <SearchComponent v-model="searchQuery" />
    </header>

    <section
      class="sticky top-20 z-20 -mx-2 mb-6 border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-2 py-3 backdrop-blur-xl sm:mb-8 sm:py-4"
    >
      <ProjectCategory
        v-if="categories.length"
        :list="categories"
        :activeCategory="selectedCategory"
        @categorySelected="fetchProjects"
      />
    </section>

    <div class="mb-6 flex items-center justify-between gap-4">
      <p class="text-sm text-[var(--muted)]">
        <strong class="text-[var(--ink)]">{{ filteredProjects.length }}</strong>
        {{ filteredProjects.length === 1 ? "project" : "projects"
        }}<span v-if="selectedCategory !== 'All'">
          in {{ selectedCategory }}</span
        >
      </p>
      <button
        v-if="searchQuery"
        class="text-xs font-bold text-[var(--primary)] hover:underline"
        @click="searchQuery = ''"
      >
        Clear search
      </button>
    </div>

    <div
      v-if="errorMessage"
      class="surface mb-8 flex flex-col items-center p-10 text-center"
    >
      <span
        class="grid h-12 w-12 place-items-center rounded-full bg-red-500/10 text-red-400"
        ><i class="pi pi-exclamation-circle"></i
      ></span>
      <p class="mt-4 font-bold">Projects couldn’t be loaded</p>
      <p class="mt-1 text-sm text-[var(--muted)]">{{ errorMessage }}</p>
      <button
        class="mt-5 rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-bold text-white"
        @click="fetchProjects(selectedCategory || 'All')"
      >
        Try again
      </button>
    </div>

    <div
      v-if="loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="h-[430px] animate-pulse rounded-[1.6rem] border border-[var(--line)] bg-purple-500/10"
      ></div>
    </div>

    <div
      v-else-if="!filteredProjects.length && !errorMessage"
      class="surface py-20 text-center"
    >
      <span
        class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-purple-500/10 text-[var(--primary)]"
        ><i class="pi pi-search text-xl"></i
      ></span>
      <h2 class="mt-5 text-xl font-bold">No matching projects</h2>
      <p class="mt-2 text-sm text-[var(--muted)]">
        Try another keyword or browse all categories.
      </p>
      <button
        class="mt-5 rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-bold hover:border-[var(--primary)]"
        @click="
          searchQuery = '';
          fetchProjects('All');
        "
      >
        Reset filters
      </button>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard
        v-for="project in paginatedProjects"
        :key="project.id || project.slug"
        :name="project.name"
        :banner_image="project.banner_image"
        :skills="project.skills"
        :client="project.client"
        :start_date="project.start_date"
        :end_date="project.end_date"
        :slug="project.slug"
      />
    </div>

    <nav
      v-if="totalPages > 1"
      class="mt-12 flex items-center justify-center gap-2"
      aria-label="Project pagination"
    >
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="pagination-button"
        aria-label="Previous page"
      >
        <i class="pi pi-angle-left"></i>
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        @click="goToPage(page)"
        class="pagination-button"
        :class="
          page === currentPage
            ? '!border-[var(--primary)] !bg-[var(--primary)] !text-white'
            : ''
        "
        :aria-current="page === currentPage ? 'page' : undefined"
      >
        {{ page }}
      </button>
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="pagination-button"
        aria-label="Next page"
      >
        <i class="pi pi-angle-right"></i>
      </button>
    </nav>
  </main>
</template>
