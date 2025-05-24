<script setup>
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const data = ref([]);
const menuOpen = ref(false);

onMounted(async () => {
   try {
      const response = await axiosInstance.get('information/resume/');
      data.value = response.data[0];
   } catch (error) {
      data.value = { resume: "#" };
   }
});

const toggleMenu = () => {
   menuOpen.value = !menuOpen.value;
};
</script>

<template>
   <div class="w-full text-white p-4">
      <div class="flex justify-between items-center px-4 py-3 md:px-8">
         <RouterLink to="/" class="flex items-center">
            <div class="h-10 w-10 md:h-12 md:w-12">
               <img src="../assets/Rioz.jpg" alt="Logo" class="w-full h-full object-contain" />
            </div>
         </RouterLink>

         <button @click="toggleMenu" class="md:hidden text-white focus:outline-none">
            <svg v-if="!menuOpen" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
               stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>

         <div class="hidden md:flex gap-x-8 items-center text-xs md:text-sm">
            <div class="flex gap-x-6 items-center">
               <RouterLink to="/projects" class="hover:text-cyan-400">Projects</RouterLink>
               <!-- <RouterLink to="/blogs" class="hover:text-cyan-400">Blogs</RouterLink> -->
               <RouterLink to="/connect" class="hover:text-cyan-400">Connect</RouterLink>
            </div>
            <a :href="data.resume" target="_blank"
               class="ml-6 rounded-full border border-white px-4 py-2 hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400">
               Resume ↓
            </a>
         </div>
      </div>

      <div v-if="menuOpen" class="md:hidden px-4 pt-2 pb-4 flex flex-col gap-4 text-center text-sm">
         <div class="flex flex-col gap-4">
            <RouterLink to="/projects" @click="toggleMenu" class="hover:text-cyan-400">Projects</RouterLink>
            <!-- <RouterLink to="/blogs" @click="toggleMenu" class="hover:text-cyan-400">Blogs</RouterLink> -->
            <RouterLink to="/connect" @click="toggleMenu" class="hover:text-cyan-400">Connect</RouterLink>
         </div>
         <div class="mt-4">
            <a :href="data.resume" target="_blank"
               class="rounded-full border border-white px-4 py-2 hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400">
               Resume ↓
            </a>
         </div>
      </div>
   </div>
</template>
