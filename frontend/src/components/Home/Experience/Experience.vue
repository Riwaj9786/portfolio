<script setup>
import ExperienceCard from './ExperienceCard.vue';
import axiosInstance from '@/axios';
import { computed, ref, onMounted } from 'vue';

const data = ref([]);
const loading = ref(true);
const error = ref(null);

const groupedExperiences = computed(() => {
   const companies = new Map();

   data.value.forEach((experience) => {
      const key = experience.company?.trim().toLocaleLowerCase() || `experience-${experience.id}`;
      if (!companies.has(key)) {
         companies.set(key, {
            company: experience.company,
            company_url: experience.company_url,
            roles: []
         });
      }
      const group = companies.get(key);
      group.roles.push(experience);
      if (!group.company_url && experience.company_url) group.company_url = experience.company_url;
   });

   return Array.from(companies.values())
      .map((group) => ({
         ...group,
         roles: group.roles.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
      }))
      .sort((a, b) => new Date(b.roles[0]?.start_date) - new Date(a.roles[0]?.start_date));
});

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
      <div v-for="company in groupedExperiences" :key="company.company">
         <ExperienceCard :company="company.company" :company_url="company.company_url" :roles="company.roles" />
      </div>
   </div>
</template>
