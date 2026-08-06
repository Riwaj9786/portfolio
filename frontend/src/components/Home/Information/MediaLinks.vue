<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import axiosInstance from '@/axios';

const data = ref([]);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('information/media/');
      data.value = response.data;
   } catch(error) {
      error.value = "Error Fetching Data!";
   }
});
</script>

<template>
   <div class="flex items-center gap-1 text-[var(--ink)]">
      <div v-for="(platform, index) in data" :key="index">
         <div v-if="platform.platform_name === 'fb'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="Facebook">
               <i class="pi pi-facebook"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'ig'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">
               <i class="pi pi-instagram"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'gh'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="GitHub">
               <i class="pi pi-github"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'lkin'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="LinkedIn">
               <i class="pi pi-linkedin"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'be'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="Behance">
               <i class="fab fa-behance"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'x'">
            <a :href="platform.link" target="_blank" rel="noopener" class="social-link" aria-label="X / Twitter">
               <i class="pi pi-twitter"></i>
            </a>
         </div>
      </div>
   </div>
</template>
