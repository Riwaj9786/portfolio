<script setup>
import BlogSection from '@/components/Blogs/BlogSection.vue';

import { ref, onMounted } from 'vue';
import axiosInstance from '@/axios';
import FeaturedBlog from './FeaturedBlog.vue';

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
   <div class="px-4 py-8 w-full flex justify-center">
      <div class="w-full flex flex-col lg:flex-row gap-6">
         <!-- Featured Blog with sticky on lg+ -->
         <div class="w-full lg:w-1/3 lg:sticky lg:top-8 self-start">
            <FeaturedBlog />
         </div>

         <!-- Blog Cards Section -->
         <div class="w-full lg:w-2/3 flex flex-col gap-6">
            <BlogSection />
         </div>
      </div>
   </div>
</template>

