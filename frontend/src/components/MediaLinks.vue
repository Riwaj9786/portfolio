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
   <div class="flex items-center text-white">
      <div v-for="(platform, index) in data" :key="index">
         <div v-if="platform.platform_name === 'fb'">
            <a :href="platform.link" target="_blank">
               <i class="pi pi-facebook mx-2 hover:text-blue-500" style="font-size: 1.5rem;"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'ig'">
            <a :href="platform.link" target="_blank">
               <i class="pi pi-instagram mx-2 hover:text-pink-500" style="font-size: 1.5rem;"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'gh'">
            <a :href="platform.link" target="_blank">
               <i class="pi pi-github mx-2 hover:text-gray-500" style="font-size: 1.5rem;"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'lkin'">
            <a :href="platform.link" target="_blank">
               <i class="pi pi-linkedin mx-2 hover:text-blue-300" style="font-size: 1.5rem;"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'be'">
            <a :href="platform.link" target="_blank">
               <i class="fab fa-behance mx-2 text-white hover:text-blue-400" style="font-size: 1.5rem;"></i>
            </a>
         </div>
         <div v-if="platform.platform_name === 'x'">
            <a :href="platform.link" target="_blank">
               <i class="pi pi-twitter mx-2 hover:text-blue-400" style="font-size: 1.5rem;"></i>
            </a>
         </div>
      </div>
   </div>
</template>
