<script setup>
import MediaLinks from '@/components/Home/Information/MediaLinks.vue';
</script>

<template>
   <div
      class="flex flex-wrap items-center justify-center md:justify-between gap-5 px-5 py-8 md:px-12 w-full"
   >
      <MediaLinks />

      <p
         class="text-[var(--muted)] text-sm w-full sm:w-auto text-center sm:text-left"
      >
         &copy; {{ new Date().getFullYear() }} Er. Riwaj Bhurtel. Built with care.
      </p>
   </div>
</template>
