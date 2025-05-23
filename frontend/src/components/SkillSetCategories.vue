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
   emit('categorySelected', category);
   isDropdownOpen.value = false;
};

const scrollContainer = ref(null);

const scrollLeft = () => {
   if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: -150, behavior: 'smooth' });
   }
};

const scrollRight = () => {
   if (scrollContainer.value) {
      scrollContainer.value.scrollBy({ left: 150, behavior: 'smooth' });
   }
};
</script>

<template>
   <div class="border md:border-none md:bg-white/10 rounded-xl p-3 w-full shadow-md">
      <div class="relative sm:hidden">
         <button 
         @click="isDropdownOpen = !isDropdownOpen"
         class="w-full flex justify-between items-center text-white bg-gray-800 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
         >
            {{ activeCategory || "Select Category" }}
            <span class="transition-transform duration-200" :class="isDropdownOpen ? 'rotate-180' : ''">
               ⌄
            </span>
         </button>
         
         <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
         >
            <div 
               v-if="isDropdownOpen"
               class="absolute left-0 w-full mt-1 bg-gray-900 rounded-lg shadow-lg z-10 overflow-hidden"
            >
               <button
                  v-for="(item, index) in list"
                  :key="index"
                  @click="categoryClickHandler(item)"
                  class="w-full text-left px-4 py-2 text-white hover:bg-cyan-500 transition-colors"
                  :class="{ 'bg-cyan-500': item === activeCategory }"
               >
                  {{ item }}
               </button>
            </div>
         </transition>
      </div>
      <div class="relative hidden sm:block">
         <button
            @click="scrollLeft"
            aria-label="Scroll left"
            class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
         >
            <i class="pi pi-angle-left"></i>
         </button>

         <div
            ref="scrollContainer"
            class="overflow-x-auto whitespace-nowrap scrollbar-hide mx-10"
         >
            <div class="flex gap-2 w-max items-center">
               <button
                  v-for="(item, index) in list"
                  :key="index"
                  @click="categoryClickHandler(item)"
                  class="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                  :class="{
                     'bg-cyan-500': item === activeCategory,
                     'hover:bg-cyan-500/50': item !== activeCategory
                  }"
               >
                  {{ item }}
               </button>
            </div>
         </div>

         <button
            @click="scrollRight"
            aria-label="Scroll right"
            class="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700"
         >
            <i class="pi pi-angle-right"></i>
         </button>
      </div>

   </div>
</template>

<style>
.scrollbar-hide::-webkit-scrollbar {
   display: none;
}
.scrollbar-hide {
   scrollbar-width: none;
}
</style>