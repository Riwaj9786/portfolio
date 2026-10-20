<script setup>
const props = defineProps({
   title: String,
   icon: File,
   description: String,
});
</script>

<template>
   <div
      class="service-card group flex h-full flex-col rounded-xl lg:rounded-[1.5rem] border border-white/10 bg-white/[.025] hover:-translate-y-1 hover:border-[var(--primary)]"
   >
      <div class="flex h-full flex-col items-start p-4 lg:p-6">
         <div
         class="grid h-12 w-12 lg:h-18 lg:w-18 place-items-center rounded-full bg-white/5 p-2 group-hover:bg-purple-500/15"
         >
         <img :src="icon" alt="Icon" />
         </div>
         <div
         class="text-base lg:text-xl font-bold text-[var(--ink)] group-hover:text-[var(--primary)]"
         >
         {{ title }}
         </div>
         <div
         class="text-xs lg:text-sm leading-relaxed text-[var(--muted)]"
         >
         {{ description }}
         </div>
      </div>
   </div>
</template>
