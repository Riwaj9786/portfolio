<script setup>
import ServiceCard from './ServiceCard.vue';
import axios from 'axios';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('service/services/');
      data.value = response.data;
   } catch(error) {
      error.value = "Error Fetching Data!";
   }
});
</script>

<template>
   <div class="flex flex-col relative rounded-xl items-center text-white">
      <div class="flex text-2xl font-bold p-6">Services</div>
      <div class="w-full">
         <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="(service, index) in data" :key="index">
               <ServiceCard
                  :title="service.title"
                  :icon="service.icon"
                  :description="service.description" 
               />
            </div>
         </div>
      </div>
</div>
</template>