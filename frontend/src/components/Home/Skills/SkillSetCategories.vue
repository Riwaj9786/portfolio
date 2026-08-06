<script setup>
defineProps({ list: { type: Array, required: true }, activeCategory: String })
const emit = defineEmits(['categorySelected'])
</script>

<template>
  <div class="scrollbar-hide flex gap-2 overflow-x-auto" role="tablist" aria-label="Skill categories">
    <button v-for="item in list" :key="item" role="tab" :aria-selected="item === activeCategory" class="shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition" :class="item === activeCategory ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md shadow-purple-500/20' : 'border-[var(--line)] text-[var(--muted)] hover:border-purple-400/40 hover:text-[var(--ink)]'" @click="emit('categorySelected', item)">{{ item }}</button>
  </div>
</template>
