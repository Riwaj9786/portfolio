<script setup>
import ProjectCard from './ProjectCard.vue';
import ProjectCategory from './ProjectCategory.vue';
import SearchComponent from './SearchComponent.vue';
import { ref, onMounted, watch } from 'vue';
import axiosInstance from '@/axios';

const categories = ref([]);
const projects = ref([]);
const filteredProjects = ref([]);
const searchQuery = ref('');
const errorMessage = ref(null);
const selectedCategory = ref(null);
const loading = ref(false);

onMounted(async () => {
   try {
      const response = await axiosInstance.get('projects/categories/');
      categories.value = [{ name: 'All' }, ...response.data]; // Add "All" category
      selectedCategory.value = categories.value[0];
      fetchProjects('All'); // Fetch all projects initially
   } catch (error) {
      errorMessage.value = "Error Fetching Categories!";
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
         response = await axiosInstance.get(`projects/`);
      } else {
         const encodedCategory = encodeURIComponent(category);
         response = await axiosInstance.get(`projects/?category__name=${encodedCategory}`);
      }

      projects.value = response.data;
      applySearchFilter();
   } catch (error) {
      errorMessage.value = "Failed to load Projects";
   } finally {
      loading.value = false;
   }
};

const applySearchFilter = () => {
   if (searchQuery.value) {
      filteredProjects.value = projects.value.filter((project) =>
         project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
   } else {
      filteredProjects.value = projects.value;
   }
};

watch(searchQuery, applySearchFilter);
</script>

<template>
   <div class="px-4 py-8 w-full flex flex-col items-center">
      <div class="w-full max-w-7xl space-y-8 flex flex-col items-center">
         <div v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">
            {{ errorMessage }}
         </div>
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
         <div 
            v-if="!filteredProjects.length && !errorMessage" 
            class="text-center py-12 text-white/60 w-full"
         >
            <p class="text-lg">No projects found</p>
            <p v-if="selectedCategory" class="text-sm mt-2">
               Try selecting a different category
            </p>
         </div>

         <div v-if="selectedCategory" class="mt-6">
            <div v-if="loading" class="text-gray-400 text-center mt-2">Loading Projects...</div>
               <div v-if="filteredProjects.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
                  <ProjectCard
                     v-for="(project, index) in filteredProjects" 
                     :key="index"
                     :name="project.name"
                     :banner_image="project.banner_image"
                     :skills="project.skills"
                     :client="project.client"
                     :start_date="project.start_date"
                     :end_date="project.end_date"
                     :link="project.link"
                     class="h-full transition-opacity duration-300 w-full max-w-xs sm:max-w-none"
                  />
               </div>
         </div>
      </div>
   </div>
</template>
