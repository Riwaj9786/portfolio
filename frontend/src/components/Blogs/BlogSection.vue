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
   <div class="w-full">
      <div class="w-full">

         <!-- Error -->
         <div v-if="error" class="text-red-500 text-sm text-center mb-4">
            {{ error }}
         </div>

         <!-- Search Bar -->
         <div class="relative mb-9 flex w-full items-center">
            <i class="pi pi-search absolute left-4 text-sm text-[var(--muted)]"></i>
            <input
               class="h-12 w-full rounded-full py-2 pl-11 pr-4 text-sm"
               v-model="searchQuery"
               @input="$emit('updateSearch', searchQuery)"
               type="text"
               placeholder="Search the journal…"
            />
         </div>

         <!-- Loading -->
         <div v-if="loading" class="space-y-4 py-4"><div v-for="i in 4" :key="i" class="h-40 animate-pulse rounded-2xl bg-purple-500/10"></div>
         </div>

         <!-- Blog Cards -->
         <div v-else-if="paginatedBlogs.length" class="w-full">
         <BlogCard
            v-for="(blog, index) in paginatedBlogs"
            :key="blog.id || blog.slug"
            :index="(currentPage - 1) * itemsPerPage + index"
            :title="blog.title"
            :content="blog.content"
            :banner_image="blog.banner_image"
            :published_at="blog.published_at"
            :slug="blog.slug"
         />
         </div>
         <div v-else class="surface py-14 text-center"><i class="pi pi-file-edit text-2xl text-[var(--primary)]"></i><h3 class="mt-4 font-bold">No articles found</h3><p class="mt-1 text-sm text-[var(--muted)]">Try a broader search term.</p></div>

         <!-- Pagination -->
         <div v-if="totalPages > 1" class="mt-8 flex flex-wrap justify-center gap-2">
            <button
               @click="goToPage(currentPage - 1)"
               :disabled="currentPage === 1"
               class="pagination-button"
            >
               Prev
            </button>

            <button
               v-for="page in totalPages"
               :key="page"
               @click="goToPage(page)"
               :class="[
                  'pagination-button',
                  page === currentPage ? '!border-[var(--primary)] !bg-[var(--primary)] !text-white' : ''
               ]"
            >
               {{ page }}
            </button>

            <button
               @click="goToPage(currentPage + 1)"
               :disabled="currentPage === totalPages"
               class="pagination-button"
            >
               Next
            </button>
         </div>
      </div>
   </div>
</template>
