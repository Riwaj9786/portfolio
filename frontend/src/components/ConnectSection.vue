<script setup>
import Information from './Information.vue';
import MediaLinks from './MediaLinks.vue';
import axios from 'axios';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);
const isLoading = ref(true); // Add loading state
const error = ref(null); // Properly declare error ref

onMounted(async () => {
   try {
      const response = await axiosInstance.get('contact/information/');
      data.value = response.data[0];
   } catch(err) {
      error.value = "Error Fetching Data!";
      console.error(err);
   } finally {
      isLoading.value = false; // Set loading to false when done
   }
});
</script>

<template>
   <div class="flex flex-col justify-between md:m-2 bg-white/5 rounded-xl p-6 md:p-8 h-full">
      <div>
         <div class="text-4xl font-bold text-white pt-8 pb-4">
            Connect
         </div>
         <hr class="text-white">
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="flex-grow flex items-center justify-center">
         <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="flex-grow flex items-center justify-center text-red-500">
         {{ error }}
      </div>
      
      <!-- Content -->
      <div v-else class="flex flex-col flex-grow mt-4">
         <div class="flex text-gray-300 text-xl mb-6 flex-grow">
            <div class="flex flex-col w-full justify-end text-xs md:text-lg md:text-left">
               <div class="hidden xl:block w-full h-full rounded-xl">
                  <img class="max-h-[250px]" :src="data.contact_banner" alt="Banner Image" />
               </div>
               <div class="my-2">
                  <i class="pi pi-whatsapp px-2"></i>
                  {{ data.whatsapp }}
               </div>
               <div class="my-2">
                  <i class="pi pi-map-marker px-2"></i>
                  {{ data.address }}
               </div>
               <div class="my-2">
                  <i class="pi pi-envelope px-2"></i>
                  riwajbhurtel9786@gmail.com
               </div>
            </div>
         </div>
         <div class="flex flex-row md:border mt-4 md:p-4 items-center justify-between md:border-cyan-500 rounded-xl">
            <div class="text-white text-sm hidden md:block">Connect with me:</div>
            <MediaLinks/>
         </div>
      </div>
   </div>
</template>