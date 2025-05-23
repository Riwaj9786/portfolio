<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import ProjectCard from './ProjectCard.vue';
import ProjectCategory from './ProjectCategory.vue';
import SearchComponent from './SearchComponent.vue';
import axiosInstance from '@/axios';

const categories = ref([]);
const projects = ref([]);
const filteredProjects = ref([]);
const searchQuery = ref('');
const errorMessage = ref(null);
const selectedCategory = ref(null);
const loading = ref(false);

const currentPage = ref(1);
const itemsPerPage = 6;

// Fetch categories and initial projects
onMounted(async () => {
   try {
      loading.value = true;
      const response = await axiosInstance.get('projects/categories/');
      categories.value = [{ name: 'All' }, ...response.data];
      selectedCategory.value = categories.value[0];
      await fetchProjects('All');
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
      if (category === 'All') {
         response = await axiosInstance.get('projects/project/');
      } else {
         const encodedCategory = encodeURIComponent(category);
         response = await axiosInstance.get(`projects/project/?category__name=${encodedCategory}`);
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
         project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
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
   <div class="px-4 py-8 w-full flex flex-col items-center">
      <div class="w-full max-w-7xl space-y-8 flex flex-col items-center">
         <!-- Error message -->
         <div v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">
            {{ errorMessage }}
         </div>

         <!-- Category & Search -->
         <div class="flex flex-col sm:flex-row sm:justify-between w-full items-center gap-4 sm:gap-8">
            <div class="w-full sm:w-2/3">
               <ProjectCategory 
                  v-if="categories.length"
                  :list="categories"
                  :activeCategory="selectedCategory"
                  @categorySelected="fetchProjects"
               />
            </div>
            <div class="w-full sm:w-1/3">
               <SearchComponent @updateSearch="(query) => (searchQuery = query)" />
            </div>
         </div>

         <!-- Loading State -->
         <div v-if="loading" class="w-full py-12 flex flex-col items-center space-y-4">
            <div class="animate-pulse flex space-x-4 w-full max-w-md">
               <div class="flex-1 space-y-4 py-1">
                  <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div class="space-y-2">
                     <div class="h-4 bg-gray-700 rounded"></div>
                     <div class="h-4 bg-gray-700 rounded w-5/6"></div>
                  </div>
               </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
               <div v-for="i in 3" :key="i" class="w-full max-w-xs sm:max-w-none h-64 bg-gray-800 rounded-lg animate-pulse"></div>
            </div>
         </div>

         <!-- Empty State -->
         <div 
            v-else-if="!filteredProjects.length && !errorMessage" 
            class="text-center py-12 text-white/60 w-full"
         >
            <p class="text-lg">No projects found</p>
            <p v-if="selectedCategory" class="text-sm mt-2">
               Try selecting a different category
            </p>
         </div>

         <!-- Project List -->
         <div v-else class="mt-6 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
               <ProjectCard
                  v-for="(project, index) in paginatedProjects" 
                  :key="index"
                  :name="project.name"
                  :banner_image="project.banner_image"
                  :skills="project.skills"
                  :client="project.client"
                  :start_date="project.start_date"
                  :end_date="project.end_date"
                  :link="project.link"
                  :slug="project.slug"
                  class="h-full transition-all duration-300 hover:scale-[1.02] w-full max-w-xs sm:max-w-none"
               />
            </div>
         </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="mt-8 flex justify-center gap-2">
         <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-blue-900 text-white rounded disabled:opacity-50"
         >
            Prev
         </button>
         <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="[
               'px-3 py-1 rounded',
               page === currentPage ? 'bg-white text-black' : 'bg-blue-800 text-white'
            ]"
         >
            {{ page }}
         </button>
         <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-blue-900 text-white rounded disabled:opacity-50"
         >
            Next
         </button>
      </div>
   </div>
</template>
