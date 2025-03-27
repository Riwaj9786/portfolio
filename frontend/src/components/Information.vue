<script setup>
import {ref, onMounted} from 'vue';
import axiosInstance from '@/axios';
import MediaLinks from './MediaLinks.vue';
import axios from 'axios';

const data = ref([]);
const loading = ref(true)
const error = ref(null);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('information/profile/');
      data.value = response.data[0];
   } catch(error) {
      error.value = "Error Fetching Data!";
   } finally {
      loading.value = false;
   }
});
</script>

<template>
      <div class="mx-12 flex flex-col">
         <div class="mt-6 lg:mt-12">
            <div>
               <img class="h-50 lg:h-80 rounded-xl" :src="data.profile_pic" alt="Image">
            </div>
            <div v-if="data && data.name" class="mt-5 text-4xl font-bold text-white lg:text-6xl hover:text-cyan-500">{{ data.name }}</div>
            <div class="pt-1 lg:pt-5 lg:text-2xl text-white">{{ data.title }}</div>
            <hr class="mt-3 text-white" />
            <div class="pt-2 text-justify text-xs lg:text-xl text-gray-300">{{ data.short_bio }}</div>
         </div>
         <div class="mt-8 lg:mt-24 bottom-12">
            <MediaLinks/>
         </div>
      </div>
</template>