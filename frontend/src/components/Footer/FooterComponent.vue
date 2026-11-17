<script setup>
import MediaLinks from '@/components/Home/Information/MediaLinks.vue';
</script>

<template>
   <div
      class="page-container flex flex-wrap items-center justify-center md:justify-between gap-5 py-8"
   >
      <MediaLinks />

      <p
         class="text-[var(--muted)] text-sm w-full sm:w-auto text-center sm:text-left"
      >
         &copy; {{ new Date().getFullYear() }} Er. Riwaj Bhurtel. Built with care.
         <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" class="mt-1 block text-xs hover:text-[var(--primary)]">Weather by Open-Meteo</a>
      </p>
   </div>
</template>
