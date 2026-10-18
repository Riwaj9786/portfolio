<script setup>
const props = defineProps({
   text: String
})
</script>

<template>
   <div class="bg-cyan-500/20 rounded-full px-2.5 py-0.5 lg:px-4 lg:py-1">
      <div class="text-cyan-500 text-[10px] lg:text-xs">{{ props.text }}</div>
   </div>
</template>