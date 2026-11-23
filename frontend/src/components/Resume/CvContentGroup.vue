<script setup>
import { computed, ref, useId, watch } from 'vue';

const props = defineProps({
   group: { type: Object, required: true },
   selected: { type: Array, default: () => [] },
   disabled: { type: Boolean, default: false },
});
const emit = defineEmits(['change']);
const instanceId = useId();
const query = ref('');
const collections = computed(() => props.group.organizations || (props.group.categories || []).map((category) => ({
   ...category, items: props.group.items.filter((item) => category.itemIds.includes(item.id)),
})));
const expanded = ref(new Set(collections.value.slice(0, 1).map((collection) => collection.id)));
const count = (ids) => ids.filter((id) => props.selected.includes(id)).length;
const allIds = computed(() => props.group.items.map((item) => item.id));
const noun = computed(() => ({ skills: 'skill categories', projects: 'projects', work: 'positions', leadership: 'positions', education: 'qualifications', certifications: 'certifications' })[props.group.id] || 'items');
const filteredCollections = computed(() => collections.value.map((collection) => ({
   ...collection,
   items: collection.items.filter((item) => item.label.toLowerCase().includes(query.value.trim().toLowerCase())),
})).filter((collection) => collection.items.length));
const allExpanded = computed(() => collections.value.every((collection) => expanded.value.has(collection.id)));
const isOpen = (collection) => expanded.value.has(collection.id);
watch(query, () => {
   if (query.value.trim()) expanded.value = new Set(filteredCollections.value.map((collection) => collection.id));
});

function toggle(collection) {
   const next = new Set(expanded.value);
   if (next.has(collection.id)) next.delete(collection.id); else next.add(collection.id);
   expanded.value = next;
}
function toggleAll() {
   expanded.value = allExpanded.value ? new Set() : new Set(collections.value.map((collection) => collection.id));
}
</script>

<template>
   <fieldset class="cv-selector" :disabled="disabled">
      <legend class="sr-only">{{ group.label }}</legend>
      <div class="selection-toolbar">
         <label>
            <input
               type="checkbox"
               :checked="count(allIds) === allIds.length"
               :indeterminate="count(allIds) > 0 && count(allIds) < allIds.length"
               @change="emit('change', allIds, $event.target.checked)"
            />
            <span>Include all {{ noun }}</span>
         </label>
         <span class="selection-count">{{ selected.length }} of {{ group.items.length }} selected</span>
      </div>

      <label v-if="group.id === 'projects'" class="project-search">
         <i class="pi pi-search" aria-hidden="true"></i>
         <input v-model="query" type="search" placeholder="Search project titles" aria-label="Search projects to include" @keydown.enter.prevent />
      </label>

      <template v-if="collections.length">
         <div class="collection-toolbar">
            <span>{{ group.id === 'projects' ? 'Select a category or choose individual projects.' : 'Select an organization or choose individual positions.' }}</span>
            <button type="button" :disabled="Boolean(query.trim())" @click="toggleAll">{{ allExpanded ? 'Collapse all' : 'Expand all' }}</button>
         </div>
         <div class="collections">
            <section v-for="(collection, index) in filteredCollections" :key="collection.id" class="collection" :class="{ 'has-selection': count(collection.itemIds) > 0 }">
               <header class="collection-header">
                  <label class="collection-select"><input
                     type="checkbox"
                     :aria-label="`Include all ${noun} in ${collection.label}`"
                     :checked="count(collection.itemIds) === collection.itemIds.length"
                     :indeterminate="count(collection.itemIds) > 0 && count(collection.itemIds) < collection.itemIds.length"
                     @change="emit('change', collection.itemIds, $event.target.checked)"
                  /></label>
                  <button
                     type="button"
                     class="collection-toggle"
                     :aria-expanded="isOpen(collection)"
                     :aria-controls="`${instanceId}-collection-${index}`"
                     @click="toggle(collection)"
                  >
                     <span class="collection-name">{{ collection.label }}</span>
                     <span class="collection-count">{{ count(collection.itemIds) }} / {{ collection.itemIds.length }}</span>
                     <i class="pi pi-chevron-down" :class="{ 'is-open': isOpen(collection) }" aria-hidden="true"></i>
                  </button>
               </header>
               <div v-show="isOpen(collection)" :id="`${instanceId}-collection-${index}`" class="collection-items">
                  <label v-for="item in collection.items" :key="item.id" class="selection-item" :class="{ 'is-selected': selected.includes(item.id) }">
                     <input type="checkbox" :checked="selected.includes(item.id)" @change="emit('change', [item.id], $event.target.checked)" />
                     <span>{{ item.label }}</span>
                  </label>
               </div>
            </section>
         </div>
         <div v-if="!filteredCollections.length" class="empty-search">
            <p>No matching projects.</p>
            <button type="button" @click="query = ''">Clear search</button>
         </div>
      </template>
      <div v-else class="selection-cards" :class="{ 'skill-cards': group.id === 'skills' }">
         <label v-for="item in group.items" :key="item.id" class="selection-card" :class="{ 'is-selected': selected.includes(item.id) }">
            <input type="checkbox" :checked="selected.includes(item.id)" @change="emit('change', [item.id], $event.target.checked)" />
            <span>
               <strong>{{ item.label }}</strong>
               <small v-if="item.detail">{{ item.detail }}</small>
            </span>
         </label>
      </div>
   </fieldset>
</template>

<style scoped>
.cv-selector { min-width: 0; margin: 0; padding: 0; border: 0; }
input[type='checkbox'] { flex: 0 0 18px; width: 18px; height: 18px; margin: .15rem 0 0; accent-color: var(--primary); cursor: pointer; }
.selection-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; margin-bottom: 1rem; }
.selection-toolbar label { display: flex; align-items: center; gap: .65rem; min-height: 44px; font-size: .875rem; font-weight: 600; cursor: pointer; }
.selection-count { color: var(--muted); font-size: .8125rem; }
.collection-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin: .5rem 0 .75rem; color: var(--muted); font-size: .8125rem; line-height: 1.6; }
.collection-toolbar button, .empty-search button { flex-shrink: 0; min-height: 44px; color: var(--primary); font-size: .8125rem; font-weight: 600; }
.collections, .selection-cards { display: grid; gap: .75rem; }
.collection { overflow: hidden; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); }
.collection.has-selection { border-color: color-mix(in srgb, var(--primary) 30%, var(--line)); }
.collection-header { display: flex; align-items: flex-start; gap: .75rem; padding: 0 1rem; }
.collection-select { display: grid; flex: 0 0 44px; place-items: center; align-self: flex-start; min-height: 64px; margin-left: -.5rem; cursor: pointer; }
.collection-select > input { margin: 0; }
.collection-toggle { display: flex; align-items: center; flex: 1; gap: .75rem; min-width: 0; min-height: 64px; padding: 1rem 0; text-align: left; }
.collection-name { flex: 1; font-size: .875rem; font-weight: 600; line-height: 1.6; overflow-wrap: anywhere; }
.collection-count { color: var(--muted); font-size: .8125rem; white-space: nowrap; }
.collection-toggle > i { font-size: .625rem; color: var(--muted); transform: rotate(-90deg); }
.collection-toggle > i.is-open { transform: rotate(0); }
.collection-items { border-top: 1px solid var(--line); }
.selection-item { display: flex; align-items: flex-start; gap: .75rem; min-height: 48px; padding: .8rem 1rem .8rem 2.5rem; font-size: .875rem; line-height: 1.6; cursor: pointer; }
.selection-item + .selection-item { border-top: 1px solid var(--line); }
.selection-item > span { min-width: 0; overflow-wrap: anywhere; }
.selection-item.is-selected, .selection-card.is-selected { background: color-mix(in srgb, var(--primary) 4%, var(--surface-solid)); }
.selection-cards.skill-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.selection-card { display: flex; align-items: flex-start; gap: .75rem; padding: 1rem; border: 1px solid var(--line); border-radius: 14px; cursor: pointer; }
.selection-card.is-selected { border-color: color-mix(in srgb, var(--primary) 30%, var(--line)); }
.selection-card > span { min-width: 0; }
.selection-card strong { display: block; font-size: .875rem; font-weight: 600; line-height: 1.5; }
.selection-card small { display: block; margin-top: .5rem; color: var(--muted); font-size: .8125rem; line-height: 1.75; }
.project-search { display: flex; align-items: center; gap: .75rem; padding: 0 1rem; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-solid); }
.project-search > i { color: var(--muted); font-size: .875rem; }
.project-search input { width: 100%; min-width: 0; min-height: 48px; background: transparent; font: inherit; font-size: 1rem; outline: none; }
.project-search:focus-within { outline: 2px solid var(--primary); outline-offset: 2px; }
.empty-search { padding: 2rem; text-align: center; color: var(--muted); font-size: .875rem; }
button { cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
button:focus-visible, input[type='checkbox']:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
@media (max-width: 600px) {
   .selection-cards.skill-cards { grid-template-columns: 1fr; }
   .selection-item { padding-left: 1.25rem; }
   .collection-toolbar { align-items: flex-start; gap: .5rem; }
}
</style>
