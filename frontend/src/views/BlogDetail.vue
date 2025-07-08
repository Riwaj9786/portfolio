<script setup>
import ProjectImageSlider from "@/components/Projects/ProjectImageSlider.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "@/axios";

const route = useRoute();
const slug = route.params.slug;

const blog = ref([]);
const loading = ref(true);
const error = ref(null);

const copied = ref(false);

const copyLink = async () => {
   try {
      await navigator.clipboard.writeText(window.location.href);
      copied.value = true;
      setTimeout(() => (copied.value = false), 2000);
   } catch (err) {
      console.error('Failed to copy: ', err);
   }
};

onMounted(async () => {
   try {
      const response = await axiosInstance.get(`blogs/blogs/${slug}/`);
      blog.value = response.data;
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const updatedContent = response.data.content.replace(
         /src=(["'])\/media\//g,
         `src=$1${backendUrl}/media/`
      );
      blog.value = { ...response.data, content: updatedContent };
   } catch (err) {
      error.value = err.response?.data?.detail || err.message;
   } finally {
      loading.value = false;
   }
});

const isBannerFullscreen = ref(false);

const openBannerFullscreen = () => {
   isBannerFullscreen.value = true;
};

const closeBannerFullscreen = () => {
   isBannerFullscreen.value = false;
};

const formatDate = (dateString) => {
   if (!dateString) return '';
   try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString(undefined, options);
   } catch (e) {
      return '';
   }
};
</script>

<template>
   <div class="gap-x-4 md:px-8 lg:px-12 py-8 mx-12">
      <div class="flex">
         <img
            :src="blog.banner_image"
            :alt="title"
            class="w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105
                     h-60 sm:h-75 md:h-90 lg:h-100 xl:h-120"
         />
      </div>

      <div class="flex flex-col lg:p-4">
         <div class="w-full justify-between items-center flex flex-row">
            <div class="text-gray-400 text-sm md:text-md py-4">{{ formatDate(blog.published_at) }}</div>
            <div>
               <button
                  @click="copyLink"
                  class="flex items-center gap-2 px-4 py-2 border border-blue-300 text-white rounded hover:bg-white/20 hover:text-white transition duration-200"
               >
                  <i
                     class="pi pi-share-alt"
                     :class="copied ? 'text-green-400' : 'text-white group-hover:text-white'"
                  ></i>
                  <span v-if="copied" class="text-sm font-medium">Copied!</span>
               </button>
            </div>
         </div>
         <div class="text-white w-full text-3xl md:text-4xl lg:text-5xl font-bold">
            {{ blog.title }}
         </div>
         <div 
            class="text-white lg:text-lg py-12 text-justify description-container"
            v-html="blog.content">
         </div>
         <div class="lg:p-6">
            <ProjectImageSlider v-if="blog.blog_images?.length" :images="blog.blog_images" />
         </div>
      </div>
   </div>
</template>


<style>
   .description-container ul,
   .description-container ol {
      padding-left: 1.25rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
   }

   .description-container ul {
      list-style-type: disc;
   }

   .description-container ol {
      list-style-type: decimal;
   }

   .description-container ul li,
   .description-container ol li {
      margin-left: 1rem;
      margin-bottom: 0.25rem; 
   }

   .description-container b,
   .description-container strong {
      color: cyan;
      opacity: 70%;
   }

   .description-container img {
      max-height: 500px;
      display: block;
      margin-left: auto;
      margin-right: auto;
      margin-top: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      object-fit: contain;
   }

   .description-container a {
      text-decoration: underline;
      font-style: italic;
   }
</style>