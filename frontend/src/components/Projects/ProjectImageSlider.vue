<script setup>
import { nextTick, ref, watch } from "vue";

const props = defineProps({
   images: {
      type: Array,
      required: true,
   },
});

const currentIndex = ref(0);
const isFullscreen = ref(false);
const closeButton = ref(null);

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

watch(isFullscreen, async (isOpen, _, onCleanup) => {
   if (!isOpen) return;

   const trigger = document.activeElement;
   const previousOverflow = document.body.style.overflow;
   document.body.style.overflow = "hidden";

   onCleanup(() => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
   });

   await nextTick();
   if (isFullscreen.value) closeButton.value?.focus();
});

watch(
   () => props.images,
   () => {
      currentIndex.value = 0;
      closeFullscreen();
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
         <button
            :key="images[currentIndex].image"
            type="button"
            class="block h-full w-full cursor-zoom-in bg-black/25 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)]"
            :aria-label="`View project image ${currentIndex + 1} fullscreen`"
            aria-haspopup="dialog"
            @click="openFullscreen"
         >
            <img
               :src="images[currentIndex].image"
               :alt="images[currentIndex].caption || `Project image ${currentIndex + 1}`"
               class="h-full w-full object-contain"
            />
         </button>
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

   <Teleport to="body">
      <div
         v-if="isFullscreen && images.length"
         role="dialog"
         aria-modal="true"
         aria-label="Fullscreen project image"
         class="fixed inset-0 z-[200] flex h-[100dvh] flex-col items-center justify-center bg-black/95 px-4 py-20"
         @click.self="closeFullscreen"
         @keydown.esc.stop.prevent="closeFullscreen"
         @keydown.tab.prevent="closeButton?.focus()"
      >
         <img
            :src="images[currentIndex].image"
            :alt="images[currentIndex].caption || `Fullscreen image ${currentIndex + 1}`"
            class="min-h-0 max-h-[80dvh] max-w-full object-contain"
         />
         <div v-if="images[currentIndex].caption" class="mt-4 max-h-20 shrink-0 overflow-y-auto px-4 text-center text-sm text-white">
            {{ images[currentIndex].caption }}
         </div>
         <button
            ref="closeButton"
            type="button"
            @click="closeFullscreen"
            class="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-3xl text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            aria-label="Close fullscreen"
         >
            <span aria-hidden="true">×</span>
         </button>
      </div>
   </Teleport>
</template>
