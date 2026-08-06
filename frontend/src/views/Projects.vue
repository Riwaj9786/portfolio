<script setup>
import ProjectsPage from '@/components/Projects/ProjectsPage.vue';

import { RouterView } from 'vue-router';
</script>

<template>
   <div class="flex flex-col min-h-screen">
      <div class="flex-grow text-[var(--ink)]">
         <ProjectsPage/>
      </div>
   </div>
</template>
