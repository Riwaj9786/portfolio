<script setup>
const props = defineProps({
   title: String,
   icon: File,
   description: String
})
</script>

<template>
   <div class="group flex h-full flex-col rounded-xl lg:rounded-[1.5rem] border border-white/10 bg-white/[.025] hover:-translate-y-1 hover:border-[#8b5cf6]/50">
      <div class="flex h-full flex-col items-start p-4 lg:p-6">
         <div class="grid h-9 w-9 lg:h-12 lg:w-12 place-items-center rounded-full bg-white/5 p-2 group-hover:bg-[#8b5cf6]/15">
            <img :src="icon" alt="Icon">
         </div>
         <div class="pt-4 text-base lg:pt-8 lg:text-xl font-bold text-[var(--ink)] group-hover:text-[var(--primary)]">
            {{ title }}
         </div>
         <div class="mt-2 text-xs lg:mt-3 lg:text-sm leading-relaxed text-[var(--muted)]">
            {{ description }}
         </div>
      </div>
   </div>
</template>
