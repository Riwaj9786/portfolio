<script setup>
import { ref } from 'vue';

const props = defineProps({
   list: {
      type: Array,
      required: true
   },
   activeCategory: {
      type: String, 
      default: null
   }
});

const emit = defineEmits(['categorySelected']);
const isDropdownOpen = ref(false);

const categoryClickHandler = (category) => {
   emit('categorySelected', category.name); 
   isDropdownOpen.value = false;
};
</script>

<template>
   <div class="border border-gray-300 md:border-none md:bg-white/10 rounded-xl p-3 w-full shadow-md">
      <div class="relative sm:hidden">
         <button 
         @click="isDropdownOpen = !isDropdownOpen"
         class="w-full flex justify-between items-center text-white bg-gray-800 text-sm md:text-lg font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
         >
            {{ activeCategory || "Select Category" }}
            <span 
               :class="isDropdownOpen ? 'rotate-180' : ''" 
               class="transition-transform duration-200"
            >
               ⌄
            </span>
         </button>

         <transition
         enter-active-class="transition duration-150 ease-out"
         leave-active-class="transition duration-100 ease-in"
         >
         <div 
            v-if="isDropdownOpen"
            class="absolute left-0 w-full bg-gray-900 rounded-lg mt-2 shadow-lg z-10 overflow-hidden"
         >
            <button 
               v-for="(category, index) in list" 
               :key="index"
               @click="categoryClickHandler(category)"
               class="w-full text-left px-4 py-2 text-white hover:bg-cyan-500 cursor-pointer transition-colors"
               :class="{ 'bg-cyan-500': category.name === activeCategory }"
            >
               {{ category.name }}
            </button>
         </div>
         </transition>
      </div>

      <div class="hidden sm:flex flex-wrap justify-evenly items-center gap-2">
         <button 
         v-for="(category, index) in list"
         :key="index"
         @click="categoryClickHandler(category)"
         class="text-white text-xs sm:text-xs md:text-sm px-4 py-2 rounded-lg cursor-pointer transition-all duration-200"
         :class="{
            'bg-cyan-500': category.name === activeCategory,
            'hover:bg-cyan-500/50': category.name !== activeCategory
         }"
         >
         {{ category.name }}
         </button>
      </div>
   </div>
</template>