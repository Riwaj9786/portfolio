<script setup>
defineProps({ list: { type: Array, required: true }, activeCategory: { type: String, default: 'All' } })
const emit = defineEmits(['categorySelected'])
</script>

<template>
  <div class="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Project categories">
    <button v-for="category in list" :key="category.name" type="button" role="tab" :aria-selected="category.name === activeCategory" class="shrink-0 rounded-full border px-4 py-2.5 text-sm font-semibold transition" :class="category.name === activeCategory ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-lg shadow-purple-500/20' : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-purple-400/40 hover:text-[var(--ink)]'" @click="emit('categorySelected', category.name)">{{ category.name }}</button>
  </div>
</template>
