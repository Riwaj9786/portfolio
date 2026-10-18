<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({ list: { type: Array, required: true }, activeCategory: String });
const emit = defineEmits(['categorySelected']);
const categoryStrip = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let resizeObserver;
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function updateArrows() {
  const strip = categoryStrip.value;
  if (!strip) return;
  canScrollLeft.value = strip.scrollLeft > 1;
  canScrollRight.value = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1;
}
function scrollCategories(direction) {
  const strip = categoryStrip.value;
  if (!strip) return;
  strip.scrollBy({ left: direction * strip.clientWidth * 0.75, behavior: scrollBehavior() });
}
async function revealSelected() {
  await nextTick();
  const strip = categoryStrip.value;
  const selected = strip?.querySelector('[aria-pressed="true"]');
  if (selected) {
    const stripBounds = strip.getBoundingClientRect();
    const bounds = selected.getBoundingClientRect();
    if (bounds.left < stripBounds.left || bounds.right > stripBounds.right) {
      strip.scrollBy({ left: bounds.left - stripBounds.left - (strip.clientWidth - bounds.width) / 2, behavior: scrollBehavior() });
    }
  }
  updateArrows();
}
watch(() => [props.list, props.activeCategory], revealSelected, { deep: true });
onMounted(() => {
  resizeObserver = new ResizeObserver(updateArrows);
  resizeObserver.observe(categoryStrip.value);
  revealSelected();
});
onBeforeUnmount(() => resizeObserver?.disconnect());
</script>

<template>
  <div class="flex min-w-0 items-center gap-2" role="group" aria-label="Skill category navigation">
    <button type="button" class="category-arrow" aria-label="Scroll categories left" :disabled="!canScrollLeft" @click="scrollCategories(-1)">
      <i class="pi pi-chevron-left" aria-hidden="true"></i>
    </button>
    <div ref="categoryStrip" class="scrollbar-hide flex min-w-0 flex-1 gap-2 overflow-x-auto py-1" role="group" aria-label="Skill categories" @scroll.passive="updateArrows">
      <button v-for="item in list" :key="item" type="button" :aria-pressed="item === activeCategory"
        class="shrink-0 rounded-full border px-3 py-2 text-[10px] lg:px-4 lg:text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        :class="item === activeCategory
          ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md shadow-purple-500/20'
          : 'border-[var(--line)] text-[var(--muted)] hover:border-purple-400/40 hover:text-[var(--ink)]'"
        @click="emit('categorySelected', item)">{{ item }}</button>
    </div>
    <button type="button" class="category-arrow" aria-label="Scroll categories right" :disabled="!canScrollRight" @click="scrollCategories(1)">
      <i class="pi pi-chevron-right" aria-hidden="true"></i>
    </button>
  </div>
</template>

<style scoped>
.category-arrow { display:grid; place-items:center; flex-shrink:0; width:2.25rem; height:2.25rem; border:1px solid var(--line); border-radius:50%; color:var(--primary); background:var(--surface); font-size:.7rem; cursor:pointer; }
.category-arrow:hover:not(:disabled) { border-color:var(--primary); }
.category-arrow:disabled { opacity:.3; cursor:default; }
.category-arrow:focus-visible { outline:2px solid var(--primary); outline-offset:2px; }
</style>
