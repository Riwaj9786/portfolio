<script setup>
import { ref } from 'vue';

const searchQuery = ref('');

const emit = defineEmits(['updateSearch']);

const updateSearch = () => {
   emit('updateSearch', searchQuery.value);
};
</script>

<template>
   <div class="w-full max-w-md relative">
      <input
         v-model="searchQuery"
         @input="updateSearch"
         type="text"
         placeholder="Search projects..."
         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300 focus:outline-none"
      />
      <svg
         class="absolute right-3 top-3 text-gray-400 h-5 w-5"
         xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 20 20"
         fill="currentColor"
      >
         <path
            fill-rule="evenodd"
            d="M8 2a6 6 0 0 1 4.472 9.966l4.78 4.78a1 1 0 1 1-1.414 1.414l-4.78-4.78A6 6 0 1 1 8 2Zm0 2a4 4 0 1 0 2.828 6.828A4 4 0 0 0 8 4Z"
            clip-rule="evenodd"
         />
      </svg>
   </div>
</template>
