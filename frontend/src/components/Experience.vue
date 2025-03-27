<script setup>
import ExperienceCard from './ExperienceCard.vue';
import axios from 'axios';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('experience/experiences/');
      data.value = response.data;
   } catch(error) {
      error.value = "Error Fetching Data!";
   }
});
</script>

<template> 
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
</template>