<script setup>
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);

onMounted(async () => {
   try {
      const response = await axiosInstance.get('information/resume/');
      data.value = response.data[0];
   } catch (error) {
      data.value = { resume: "#" };
   }
});
</script>

<template>
   <div class="flex flex-wrap justify-between items-center p-4 md:p-8 min-h-[4rem]">
      <RouterLink to="/" class="flex items-center justify-start">
         <div class="h-10 w-10 md:h-12 md:w-12">
            <img src="../assets/Rioz.png" alt="Logo" class="w-full h-full object-contain" />
         </div>
      </RouterLink>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2 lg:gap-x-6 text-white text-xs md:text-sm">
         <RouterLink to="/projects" class="hover:text-cyan-500">Projects</RouterLink>
         <!-- <RouterLink to="/blogs" class="hover:text-cyan-500">Blogs</RouterLink> -->
         <RouterLink to="/contact" class="hover:text-cyan-500">Contact</RouterLink>
         
         <a :href="data.resume" target="_blank" class="rounded-full border border-white px-4 py-2 hover:bg-white/10 hover:border-cyan-500 hover:text-cyan-500">
            Resume ↓
         </a>
      </div>
   </div>
</template>
