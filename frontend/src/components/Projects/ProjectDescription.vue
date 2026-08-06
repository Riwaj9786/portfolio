<script setup>
import { ref } from "vue";

const props = defineProps({
   name: {
      type: String,
      required: true
   },
   description: {
      type: String,
      default: ""
   }
});

const expanded = ref(false);
</script>

<template>
   <div class="px-1 py-3 text-[var(--ink)] sm:p-6">
      <div class="mb-6">
         <h1 class="font-bold text-xl lg:text-3xl">{{ name }}</h1>
      </div>

      <div class="description-container text-justify text-sm sm:text-base lg:text-lg">
         <div
            v-if="description && description.trim().length"
            v-html="description"
            :class="[
               'text-[var(--muted)] leading-relaxed transition-all duration-300 ease-in-out',
               expanded ? '' : 'line-clamp-12 overflow-hidden'
            ]"
         ></div>

         <div v-else class="text-[var(--muted)] italic">No description available.</div>

         <button
            v-if="description && description.length > 800"
            @click="expanded = !expanded"
            class="text-cyan-400 hover:underline mt-4 block"
         >
            {{ expanded ? 'Read Less' : 'Read More' }}
         </button>
      </div>
   </div>
</template>



<style>
   .description-container h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
   }

   .description-container h2 {
      font-size: 1.5rem;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
   }

   .description-container h3 {
      font-size: 1.25rem;
      margin-top: 1rem;
      margin-bottom: 0.75rem;
   }

   .description-container ul,
   .description-container ol {
      padding-left: 1.25rem;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
   }

   .description-container ul {
      list-style-type: disc;
   }

   .description-container ol {
      list-style-type: decimal;
   }

   .description-container ul li,
   .description-container ol li {
      margin-left: 1rem;
      margin-bottom: 0.25rem;
   }

   /* Reduce spacing for nested lists */
   .description-container ul ul,
   .description-container ol ul,
   .description-container ul ol,
   .description-container ol ol {
      margin-top: 0.25rem;
      margin-bottom: 0.25rem;
      padding-left: 1rem;
   }

   .description-container ul ul li,
   .description-container ol ul li,
   .description-container ul ol li,
   .description-container ol ol li {
      margin-left: 0.75rem;
      margin-bottom: 0.15rem;
   }

   .description-container b,
   .description-container strong {
      color: var(--primary);
      opacity: 70%;
   }

   .description-container table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.95rem;
      text-align: left;
      background-color: var(--surface-solid);
      color: var(--ink);
   }

   .description-container th,
   .description-container td {
      border: 1px solid var(--line);
      padding: 0.75rem 1rem;
   }

   .description-container th {
      background-color: color-mix(in srgb, var(--primary) 10%, var(--surface-solid));
      color: var(--primary);
      font-weight: bold;
   }

   .description-container tr:nth-child(even) {
      background-color: color-mix(in srgb, var(--surface-solid) 88%, var(--bg));
   }

   .description-container tr:hover {
      background-color: color-mix(in srgb, var(--primary) 8%, var(--surface-solid));
   }

</style>
