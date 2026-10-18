<script setup>
defineProps({
   name: {
      type: String,
      required: true
   },
   link: {
      type: String,
      default: ""
   },
});
</script>

<template>
   <a
      v-if="link"
      :href="link"
      target="_blank"
      rel="noopener noreferrer"
      class="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-xs transition hover:border-[var(--primary)]"
   >
      <div class="flex justify-between items-start w-full">
         <div class="text-[var(--ink)] group-hover:text-[var(--primary)]">
            {{ name }}
         </div>
      </div>

      <div class="shrink-0 text-[var(--primary)]">
         <i class="pi pi-arrow-up-right text-xs" aria-hidden="true"></i>
      </div>
   </a>

   <div v-else class="p-4 rounded bg-white/5 text-[var(--ink)]">
      {{ name }}
   </div>
</template>
