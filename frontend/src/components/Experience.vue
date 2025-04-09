<script setup>
import ExperienceCard from './ExperienceCard.vue';
import axios from 'axios';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
   try {
      const response = await axiosInstance.get('experience/experiences/');
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
   <!-- Skeleton Loading State -->
   <div v-if="loading" class="space-y-6">
      <div v-for="n in 3" :key="'skeleton-'+n" class="p-6 border border-gray-700 rounded-lg animate-pulse">
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
            <div v-for="skill in 5" :key="skill" class="h-4 bg-gray-700 rounded"></div>
         </div>
      </div>
   </div>

   <!-- Error State -->
   <div v-else-if="error" class="text-red-500 p-4 border border-red-500 rounded">
      {{ error }}
   </div>

   <!-- Actual Content -->
   <div v-else>
      <div v-for="(experience, index) in data" :key="index">
         <ExperienceCard 
            :title="experience.title"
            :company="experience.company"
            :company_url="experience.company_url"
            :start_date="experience.start_date"
            :end_date="experience.end_date"
            :job_type="experience.job_type"
            :skills="experience.skills"
         />
      </div>
   </div>
</template>