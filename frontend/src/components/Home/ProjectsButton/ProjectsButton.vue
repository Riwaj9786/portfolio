<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
   <RouterLink to='/projects'>
      <div class="flex py-2 px-6 text-xs md:text-lg rounded-full items-center text-white hover:text-cyan-500 border border-white hover:bg-white/10 hover:border-cyan-500">
         View my Projects
         <i class="px-2 pi pi-arrow-up-right"></i>
      </div>
   </RouterLink>
</template>