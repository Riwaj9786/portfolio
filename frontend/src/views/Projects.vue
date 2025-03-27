<script setup>
import NavBar from '@/components/NavBar.vue';
import ProjectsPage from '@/components/ProjectsPage.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import MediaLinks from '@/components/MediaLinks.vue';

import { RouterView } from 'vue-router';
</script>

<template>
   <div class="flex flex-col min-h-screen">
      <NavBar/>
      <div class="flex-grow text-white">
         <ProjectsPage/>
      </div>
      <div class="mx-12 mt-auto">
         <FooterComponent/>
      </div>
   </div>
</template>
