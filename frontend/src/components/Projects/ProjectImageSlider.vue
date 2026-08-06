<script setup>
import { ref, watch } from "vue";

const props = defineProps({
   images: {
      type: Array,
      required: true,
   },
});

const currentIndex = ref(0);
const isFullscreen = ref(false);

const nextSlide = () => {
   currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prevSlide = () => {
   currentIndex.value =
      currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1;
};

const openFullscreen = () => {
   isFullscreen.value = true;
};

const closeFullscreen = () => {
   isFullscreen.value = false;
};

watch(
   () => props.images,
   () => {
      currentIndex.value = 0;
   }
);
</script>


<template>
   <div
      v-if="images && images.length"
      class="relative mt-5 h-[250px] w-full overflow-hidden rounded-2xl border border-[var(--line)] shadow-lg sm:mt-6 sm:h-[380px] lg:h-[420px]"
      role="region"
      aria-label="Project image slider"
   >
      <transition name="fade" mode="out-in">
         <img
         :key="images[currentIndex].image"
         :src="images[currentIndex].image"
         :alt="`Project image ${currentIndex + 1}`"
         class="w-full h-full object-contain bg-black/25 cursor-pointer"
         @click="openFullscreen"
         />
      </transition>

      <button
         @click="prevSlide"
         aria-label="Previous slide"
         class="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55 sm:left-4"
      >
         <i class="pi pi-angle-left text-xl"></i>
      </button>
      <button
         @click="nextSlide"
         aria-label="Next slide"
         class="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur hover:bg-black/55 sm:right-4"
      >
         <i class="pi pi-angle-right text-xl"></i>
      </button>

      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
         <span
         v-for="(image, index) in images"
         :key="index"
         @click="currentIndex = index"
         :aria-label="`Go to slide ${index + 1}`"
         role="button"
         :class="[
            'w-3 h-3 cursor-pointer rounded-full',
            currentIndex === index ? 'bg-white' : 'bg-white/40',
         ]"
         ></span>
      </div>
   </div>

   <!-- Caption BELOW the slider container -->
   <div v-if="images && images.length" class="mt-2 text-center text-[var(--muted)] text-sm px-4">
      {{ images[currentIndex].caption }}
   </div>

   <div
      v-if="isFullscreen"
      class="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center"
      @click.self="closeFullscreen"
   >
      <img
         :src="images[currentIndex].image"
         :alt="`Fullscreen image ${currentIndex + 1}`"
         class="max-h-[80dvh] max-w-[94vw] object-contain"
      />
      <div class="text-white text-sm mt-4 px-4 text-center">
         {{ images[currentIndex].caption }}
      </div>
      <button
         @click="closeFullscreen"
         class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-black/50 text-2xl text-white hover:bg-black"
         aria-label="Close fullscreen"
      >
         ×
      </button>
   </div>
</template>
