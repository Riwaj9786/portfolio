<script setup>
import { ref, onMounted } from 'vue';
import axiosInstance from '@/axios';

const data = ref({});
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
   try {
      const response = await axiosInstance.get('blogs/featured_blog/');
      data.value = response.data[0].blog;
   } catch (err) {
      error.value = 'Error Fetching Data!';
      console.error(err);
   } finally {
      loading.value = false;
   }
});

const contentTruncated = (content, length = 120) => {
   if (!content) return '';
   return content.length > length ? content.substring(0, length) + '...' : content;
};
</script>

<template>
   <RouterLink :to="`/blogs/${data.slug}`" class="w-full max-w-sm">
      <div class="w-full self-start lg:px-9">
         <div class="bg-white/5 hover:bg-white/10 group rounded-lg p-6">
            <p class="text-3xl my-2 font-bold">Featured Blog:</p>

            <div v-if="loading" class="text-white">Loading...</div>
            <div v-else-if="error" class="text-red-400">{{ error }}</div>
            <div v-else class="border border-gray-600 group-hover:border-gray-400 p-4 rounded-lg">
               <img
                  :src="data.banner_image"
                  alt="Featured Blog Image"
                  loading="lazy"
                  decoding="async"
                  class="w-full h-64 rounded-lg mb-4 object-cover object-center group-hover:scale-105 transition-transform duration-300"
               />
               <h2 class="text-xl font-semibold mb-2">{{ data.title }}</h2>
               <p class="text-gray-300 mb-4" v-html="contentTruncated(data.content, 120)"></p>
               <button class="relative px-4 py-2 rounded-full bg-white/5 group transition w-full overflow-hidden">
                  <div class="flex justify-between items-center w-full">
                     <span class="text-white group-hover:text-cyan-500 transition-colors">
                        Read More
                     </span>
                     <span
                        class="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-gray-400 group-hover:bg-cyan-500/40 transition-all duration-300"
                     >
                        <i class="pi pi-arrow-up-right text-sm"></i>
                     </span>
                  </div>
               </button>
            </div>
         </div>
      </div>
   </RouterLink>
</template>