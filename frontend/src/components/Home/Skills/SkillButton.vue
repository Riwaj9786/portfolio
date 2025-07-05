<script setup>
const props = defineProps({
   text: String
})
</script>

<template>
   <div class="bg-cyan-500/20 rounded-full px-4 py-1">
      <div class="text-cyan-500 text-xs">{{ props.text }}</div>
   </div>
</template>