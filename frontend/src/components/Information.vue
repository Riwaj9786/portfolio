<script setup>
import {ref, onMounted} from 'vue';
import axiosInstance from '@/axios';
import MediaLinks from './MediaLinks.vue';
import axios from 'axios';
import FooterComponent from './FooterComponent.vue';

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
      <div class="mx-12 flex flex-col">
         <div class="mt-6 lg:mt-12">
            <!-- Profile Picture Skeleton -->
            <div v-if="loading" class="h-50 lg:h-80 rounded-xl bg-gray-700 animate-pulse"></div>
            <div v-else>
               <img class="h-50 lg:h-80 rounded-xl" :src="data.profile_pic" alt="Image">
            </div>
            
            <!-- Name Skeleton -->
            <div v-if="loading" class="mt-5 h-10 w-3/4 bg-gray-700 rounded animate-pulse"></div>
            <div v-else-if="data && data.name" class="mt-5 text-4xl font-bold text-white lg:text-6xl hover:text-cyan-500">{{ data.name }}</div>
            
            <!-- Title Skeleton -->
            <div v-if="loading" class="pt-1 lg:pt-5 h-6 w-1/2 bg-gray-700 rounded animate-pulse"></div>
            <div v-else class="pt-1 lg:pt-5 lg:text-2xl text-white">{{ data.title }}</div>
            
            <hr class="mt-3 text-white" />
            
            <!-- Bio Skeleton -->
            <div v-if="loading" class="pt-2 space-y-2">
               <div class="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
               <div class="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
               <div class="h-4 w-4/6 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div v-else class="pt-2 text-justify text-xs lg:text-xl text-gray-300">{{ data.short_bio }}</div>
         </div>
      </div>
</template>