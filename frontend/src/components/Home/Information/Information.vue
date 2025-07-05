<script setup>
import {ref, onMounted} from 'vue';
import axiosInstance from '@/axios';
import MediaLinks from '@/components/Home/Information/MediaLinks.vue';
import axios from 'axios';

const data = ref([]);
const loading = ref(true)
const error = ref(null);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('information/profile/');
      data.value = response.data[0];
   } catch(err) {
      error.value = "Error Fetching Data!";
      console.error(err);
   } finally {
      loading.value = false;
   }
});
</script>

<template>
   <div class="px-4 sm:px-6 md:px-10 lg:px-24 xl:px-32 py-6 flex flex-col items-center lg:items-start">
      
      <!-- Image -->
      <div class="w-full">
         <div v-if="loading" class="rounded-xl bg-gray-700 w-full aspect-[4/3] animate-pulse"></div>
         <div v-else>
         <img 
            class="w-full max-h-[400px] md:max-h-[500px] lg:max-h-[650px] object-cover rounded-xl" 
            :src="data.profile_pic" 
            alt="Profile Image"
         />
         </div>
      </div>

      <!-- Name -->
      <div class="w-full">
         <div v-if="loading" class="mt-5 h-8 w-3/4 bg-gray-700 rounded animate-pulse"></div>
         <div v-else-if="data && data.name" 
         class="mt-5 font-bold text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-center lg:text-left hover:text-cyan-500 transition">
         {{ data.name }}
         </div>
      </div>

      <!-- Title -->
      <div class="w-full">
         <div v-if="loading" class="pt-1 h-6 w-1/2 bg-gray-700 rounded animate-pulse"></div>
         <div v-else 
         class="pt-1 text-white text-base sm:text-lg md:text-xl lg:text-2xl text-center lg:text-left">
         {{ data.title }}
         </div>
      </div>

      <hr class="mt-4 w-full border-gray-600" />

      <!-- Short Bio -->
      <div class="w-full">
         <div v-if="loading" class="pt-2 space-y-2">
         <div class="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
         <div class="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
         <div class="h-4 w-4/6 bg-gray-700 rounded animate-pulse"></div>
         </div>
         <div v-else 
         class="pt-3 text-justify text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
         {{ data.short_bio }}
         </div>
      </div>

      <!-- Media Links -->
      <div class="w-full py-8">
         <MediaLinks />
      </div>
   </div>
</template>
