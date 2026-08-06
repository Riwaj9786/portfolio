<script setup>
defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <label class="relative block w-full">
    <span class="sr-only">Search projects</span>
    <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]"></i>
    <input :value="modelValue" @input="emit('update:modelValue', $event.target.value)" type="search" placeholder="Search by project name…" class="h-12 w-full rounded-full py-3 pl-11 pr-11 text-sm" />
    <button v-if="modelValue" type="button" aria-label="Clear search" class="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] hover:bg-purple-500/10 hover:text-[var(--primary)]" @click="emit('update:modelValue', '')"><i class="pi pi-times text-xs"></i></button>
  </label>
</template>
