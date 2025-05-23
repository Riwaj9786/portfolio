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
   <div class="text-white p-6 mt-4">
      <div class="mb-6">
         <h1 class="font-bold text-md lg:text-3xl">{{ name }}</h1>
      </div>

      <div class="text-justify text-xs lg:text-lg description-container">
         <div
            v-if="description && description.trim().length"
            v-html="description"
            :class="[
               'text-gray-300 leading-relaxed transition-all duration-300 ease-in-out',
               expanded ? '' : 'line-clamp-15 overflow-hidden'
            ]"
         ></div>

         <div v-else class="text-gray-300 italic">No description available.</div>

         <button
            v-if="description && description.length > 1000"
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
      color: cyan;
      opacity: 70%;
   }

   .description-container table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.95rem;
      text-align: left;
      background-color: #0B0A2B; /* Base color */
      color: #f0f0f0;
   }

   .description-container th,
   .description-container td {
      border: 1px solid #23224B; /* 10% lighter */
      padding: 0.75rem 1rem;
   }

   .description-container th {
      background-color: #23224B; /* 10% lighter */
      color: cyan;
      font-weight: bold;
   }

   .description-container tr:nth-child(even) {
      background-color: #090823; /* 10% darker */
   }

   .description-container tr:hover {
      background-color: #050513; /* 20–30% darker */
   }

</style>
