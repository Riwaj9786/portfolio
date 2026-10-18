<script setup>
import { nextTick, ref } from 'vue';
const props = defineProps({ list: { type: Array, required: true }, activeCategory: { type: String, default: 'All' } });
const emit = defineEmits(['categorySelected']);
const toggle = ref(null);
async function selectCategory(name) {
  emit('categorySelected', name);
  await nextTick();
  const button = [...toggle.value.querySelectorAll('button')].find((item) => item.dataset.category === name);
  if (!button) return;
  const container = toggle.value.getBoundingClientRect();
  const bounds = button.getBoundingClientRect();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (bounds.left < container.left || bounds.right > container.right) {
    toggle.value.scrollBy({ left: bounds.left - container.left - (container.width - bounds.width) / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
  }
}
async function navigate(event, index) {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? props.list.length - 1 :
    (index + (event.key === 'ArrowRight' ? 1 : -1) + props.list.length) % props.list.length;
  await selectCategory(props.list[next].name);
  toggle.value.querySelectorAll('button')[next].focus({ preventScroll: true });
}
</script>

<template>
  <div ref="toggle" class="category-toggle scrollbar-hide" role="group" aria-label="Filter projects by category">
    <button v-for="(category, index) in list" :key="category.name" :data-category="category.name" type="button"
      :aria-pressed="category.name === activeCategory" :class="{ selected: category.name === activeCategory }"
      @click="selectCategory(category.name)" @keydown="navigate($event, index)">
      <span class="toggle-dot" aria-hidden="true"></span>{{ category.name === 'All' ? 'All projects' : category.name }}
    </button>
  </div>
</template>

<style scoped>
.category-toggle { display:flex;gap:4px;padding:5px;width:fit-content;max-width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:999px;background:color-mix(in srgb,var(--bg-2) 65%,var(--surface-solid)); }
.category-toggle button { display:flex;align-items:center;justify-content:center;gap:.5rem;flex-shrink:0;min-height:40px;padding:.6rem 1rem;border:1px solid transparent;border-radius:999px;font-size:.7rem;font-weight:650;white-space:nowrap;color:var(--muted);transition:background .2s,color .2s,box-shadow .2s,border-color .2s; }
.category-toggle button:hover:not(.selected) { color:var(--ink);background:var(--surface); }
.category-toggle button.selected { color:white;background:var(--primary);border-color:color-mix(in srgb,var(--primary-bright) 50%,transparent);box-shadow:0 3px 10px color-mix(in srgb,var(--primary) 22%,transparent); }
.toggle-dot { width:5px;height:5px;flex-shrink:0;border-radius:50%;background:currentColor;opacity:.45; }.selected .toggle-dot { opacity:1; }
.category-toggle button:focus-visible { outline:2px solid var(--primary);outline-offset:-3px; }.category-toggle button.selected:focus-visible { outline-color:white; }
@media(min-width:640px) { .category-toggle button { padding:.65rem 1.25rem;font-size:.8rem; } }
@media(prefers-reduced-motion:reduce) { .category-toggle button { transition:none; } }
</style>
