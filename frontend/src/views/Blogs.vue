<script setup>
import NavBar from '@/components/NavBar/NavBar.vue';
import FooterComponent from '@/components/Footer/FooterComponent.vue';
import BlogsPage from '@/components/Blogs/BlogsPage.vue';
</script>

<template>
   <div class="flex flex-col min-h-screen">
      <div class="flex-grow text-[var(--ink)]">
         <BlogsPage />
      </div>
   </div>
</template>
