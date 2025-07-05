<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axiosInstance from '@/axios';
import BlogCard from '@/components/Blogs/BlogCard.vue';

const blogs = ref([]);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 6;
const loading = ref(true);
const error = ref(null);

let debounceTimeout;

const fetchBlogs = async (query = '') => {
   loading.value = true;
   try {
      console.log('Fetching blogs with search:', query);
      const response = await axiosInstance.get('blogs/blogs/', {
         params: query ? { search: query } : {},
      });
      blogs.value = response.data;
      error.value = null;
   } catch (err) {
      error.value = 'Error Fetching Data!';
      console.error(err);
   } finally {
      loading.value = false;
   }
};

// Initial fetch
onMounted(() => {
   fetchBlogs();
});

// Dynamic server-side search
watch(searchQuery, (value) => {
   clearTimeout(debounceTimeout);
   debounceTimeout = setTimeout(() => {
      currentPage.value = 1;
      fetchBlogs(value);
   }, 300);
});

// Pagination logic (frontend)
const totalPages = computed(() =>
   Math.ceil(blogs.value.length / itemsPerPage)
);

const paginatedBlogs = computed(() => {
   const start = (currentPage.value - 1) * itemsPerPage;
   return blogs.value.slice(start, start + itemsPerPage);
});

const goToPage = (page) => {
   if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
   }
};
</script>


<template>
   <div class="px-4 w-full flex flex-col items-center">
      <div class="w-full max-w-7xl space-y-8 flex flex-col items-center">

         <!-- Error -->
         <div v-if="error" class="text-red-500 text-sm text-center mb-4">
            {{ error }}
         </div>

         <!-- Search Bar -->
         <div class="flex w-full px-4 items-center">
            <input
               class="flex w-full py-2 px-4 rounded-lg focus:ring focus:ring-blue-300 focus-outline items-center border border-white "
               v-model="searchQuery"
               @input="$emit('updateSearch', searchQuery)"
               type="text"
               placeholder="Search Blogs..."
            />
         </div>

         <!-- Loading -->
         <div v-if="loading" class="w-full py-12 flex flex-col items-center space-y-4">
            <div class="animate-pulse flex space-x-4 w-full max-w-md">
               <div class="flex-1 space-y-4 py-1">
                  <div class="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div class="space-y-2">
                  <div class="h-4 bg-gray-700 rounded"></div>
                  <div class="h-4 bg-gray-700 rounded w-5/6"></div>
                  </div>
               </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center">
               <div
                  v-for="i in 3"
                  :key="i"
                  class="w-full max-w-xs sm:max-w-none h-64 bg-gray-800 rounded-lg animate-pulse"
               ></div>
            </div>
         </div>

         <!-- Blog Cards -->
         <div
         v-else
         class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full justify-items-center px-4"
         >
         <BlogCard
            v-for="(blog, index) in paginatedBlogs"
            :key="index"
            :title="blog.title"
            :content="blog.content"
            :banner_image="blog.banner_image"
            :published_at="blog.published_at"
            :slug="blog.slug"
         />
         </div>

         <!-- Pagination -->
         <div v-if="totalPages > 1" class="mt-8 flex flex-wrap justify-center gap-2">
            <button
               @click="goToPage(currentPage - 1)"
               :disabled="currentPage === 1"
               class="px-3 py-1 bg-blue-900 text-white rounded disabled:opacity-50"
            >
               Prev
            </button>

            <button
               v-for="page in totalPages"
               :key="page"
               @click="goToPage(page)"
               :class="[
                  'px-3 py-1 rounded',
                  page === currentPage ? 'bg-white text-black' : 'bg-blue-800 text-white'
               ]"
            >
               {{ page }}
            </button>

            <button
               @click="goToPage(currentPage + 1)"
               :disabled="currentPage === totalPages"
               class="px-3 py-1 bg-blue-900 text-white rounded disabled:opacity-50"
            >
               Next
            </button>
         </div>
      </div>
   </div>
</template>
