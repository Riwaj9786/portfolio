<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axiosInstance from "@/axios";

const data = ref([]);
const loading = ref(true);
const error = ref(null);
const currentIndex = ref(0);
let intervalId = null;

const startRotation = () => {
   clearInterval(intervalId);
   intervalId = setInterval(() => {
      if (data.value.length > 0) {
         currentIndex.value = (currentIndex.value + 1) % data.value.length;
      }
   }, 6000);
};

const showNext = () => {
   currentIndex.value = (currentIndex.value + 1) % data.value.length;
   startRotation();
};

const showPrev = () => {
   currentIndex.value =
      (currentIndex.value - 1 + data.value.length) % data.value.length;
   startRotation();
};

const jumpToIndex = (index) => {
   currentIndex.value = index;
   startRotation();
};

onMounted(async () => {
   try {
      const response = await axiosInstance.get("testimonial/testimonials/");
      data.value = response.data.filter((item) => item.to_publish === true);
      if (data.value.length > 1) {
         startRotation();
      }
   } catch (err) {
      error.value = "Error fetching data!";
      console.error(err);
   } finally {
      loading.value = false;
   }
});

onUnmounted(() => {
   clearInterval(intervalId);
});
</script>

<template>
   <div class="max-w-5xl mx-auto">
      <!-- Testimonial card -->
      <div
         v-if="!loading && data.length"
         class="flex bg-white/5 hover:bg-white/10 p-6 rounded-xl transition-all duration-500"
      >
         <div
         class="flex flex-col md:flex-row items-center justify-center"
         >
            <!-- Left: Image and Info -->
            <div
               class="flex flex-col items-center text-center md:text-left md:w-1/3"
            >
               <!-- Image -->
               <div class="h-24 w-24 rounded-full overflow-hidden bg-gray-300">
                  <img
                  v-if="data[currentIndex].image"
                  :src="data[currentIndex].image"
                  alt="Profile Image"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  />
                  <div
                  v-else
                  class="flex items-center justify-center h-full w-full text-3xl font-bold text-white bg-blue-600"
                  >
                  {{
                     data[currentIndex].name
                        .split(" ")
                        .map((word) => word[0])
                        .join("")
                        .toUpperCase()
                  }}
                  </div>
               </div>

               <!-- Name -->
               <div
                  class="text-white text-lg md:text-xl font-semibold truncate max-w-[200px]"
               >
                  {{ data[currentIndex].name }}
               </div>

               <!-- Position -->
               <div
                  class="text-gray-300 text-xs md:text-sm uppercase truncate max-w-[200px]"
               >
                  {{ data[currentIndex].position }}
               </div>

               <!-- Company -->
               <div
                  class="text-gray-300 text-xs md:text-sm truncate max-w-[200px]"
               >
                  {{ data[currentIndex].company }}
               </div>
            </div>

            <!-- Right: Testimonial text -->
            <div
               class="flex min-w-0 items-center justify-center p-6"
               style="word-break: break-word"
            >
               <blockquote
                  class="text-justify text-white md:px-4 before:content-['“'] after:content-['”']"
               >
                  {{ data[currentIndex].testimonial }}
               </blockquote>
            </div>
         </div>
      </div>

      <!-- Pagination Dots OUTSIDE the testimonial card -->
      <div
         v-if="!loading && data.length > 1"
         class="flex justify-center space-x-3 mt-4"
      >
         <button
         v-for="(item, index) in data"
         :key="index"
         @click="jumpToIndex(index)"
         :class="[
            'h-4 w-4 rounded-full focus:outline-none',
            currentIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70',
         ]"
         aria-label="'Go to testimonial ' + (index + 1)"
         />
      </div>

      <!-- Loading and Error States -->
      <div v-else-if="loading" class="text-white text-center">Loading...</div>
      <div v-else class="text-red-400 text-center">{{ error }}</div>
   </div>
</template>

