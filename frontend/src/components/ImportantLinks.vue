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
      class="relative bg-white/5 block w-full p-4 rounded-full group hover:bg-white/10 transition"
   >
      <div class="flex justify-between items-start w-full">
         <div class="text-white group-hover:text-cyan-500">
            {{ name }}
         </div>
      </div>

      <div
         class="absolute bottom-3 right-3 text-gray-400 group-hover:bg-cyan-500/40 group-hover:text-cyan-400 
         transition-colors duration-300 flex items-center justify-center w-7 h-7 rounded-full bg-white/5"
      >
         <i class="pi pi-arrow-up-right text-sm"></i>
      </div>
   </a>

   <div v-else class="p-4 rounded bg-white/5 text-white">
      {{ name }}
   </div>
</template>
