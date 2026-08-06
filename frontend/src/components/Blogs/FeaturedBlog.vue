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
   <RouterLink :to="`/blogs/${data.slug}`" class="block w-full">
      <div class="w-full self-start">
         <div class="surface group overflow-hidden p-3">
            <div class="flex items-center justify-between px-3 pb-3 pt-2"><p class="eyebrow">Featured read</p><i class="pi pi-bookmark text-[var(--primary)]"></i></div>

            <div v-if="loading" class="text-[var(--muted)]">Loading...</div>
            <div v-else-if="error" class="text-red-400">{{ error }}</div>
            <div v-else>
               <div class="overflow-hidden rounded-[1.2rem]">
               <img
                  :src="data.banner_image"
                  alt="Featured Blog Image"
                  loading="lazy"
                  decoding="async"
                  class="h-64 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
               />
               </div>
               <div class="p-4"><h2 class="mb-2 text-2xl font-bold tracking-tight">{{ data.title }}</h2>
               <p class="mb-5 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]" v-html="contentTruncated(data.content, 150)"></p>
               <div class="relative w-full overflow-hidden rounded-full bg-purple-500/10 px-4 py-2.5">
                  <div class="flex justify-between items-center w-full">
                     <span class="text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                        Read More
                     </span>
                     <span
                        class="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 text-gray-400 group-hover:bg-cyan-500/40 transition-all duration-300"
                     >
                        <i class="pi pi-arrow-up-right text-sm"></i>
                     </span>
                  </div>
               </div></div>
            </div>
         </div>
      </div>
   </RouterLink>
</template>
