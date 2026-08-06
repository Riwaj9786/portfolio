<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <RouterLink to="/projects">
    <div
      class="flex items-center rounded-full border border-[var(--line)] px-6 py-2 text-xs text-[var(--ink)] hover:border-[var(--primary)] hover:bg-purple-500/10 hover:text-[var(--primary)] md:text-lg"
    >
      View my Projects
      <i class="px-2 pi pi-arrow-up-right"></i>
    </div>
  </RouterLink>
</template>
