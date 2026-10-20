<script setup>
const props = defineProps({
   text: String
})
</script>

<template>
   <div class="bg-purple-500/10 rounded-full px-2.5 py-0.5 lg:px-4 lg:py-1">
      <div class="text-[var(--primary)] text-[10px] lg:text-xs">{{ props.text }}</div>
   </div>
</template>