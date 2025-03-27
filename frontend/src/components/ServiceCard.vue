<script setup>
const props = defineProps({
   title: String,
   icon: File,
   description: String
})
</script>

<template>
   <div class="border border-white hover:border-cyan-500 group hover:bg-white/10 rounded-xl h-full flex flex-col">
      <div class="p-4 flex flex-col items-center h-full">
         <div class="h-12 w-12 group-hover:border group-hover:border-cyan-500 rounded-full">
            <img :src="icon" alt="Icon">
         </div>
         <div class="text-2xl font-bold text-center text-wrap text-white p-4 group-hover:text-cyan-500">
            {{ title }}
         </div>
         <div class="text-xs text-center mt-2 text-gray-400">
            {{ description }}
         </div>
      </div>
   </div>
</template>