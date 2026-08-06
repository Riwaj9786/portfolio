<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axiosInstance from "@/axios";

const data = ref([]),
  loading = ref(true),
  error = ref(null),
  currentIndex = ref(0);
let intervalId;
const rotate = () => {
  clearInterval(intervalId);
  if (data.value.length > 1)
    intervalId = setInterval(
      () => (currentIndex.value = (currentIndex.value + 1) % data.value.length),
      7000,
    );
};
const move = (direction) => {
  currentIndex.value =
    (currentIndex.value + direction + data.value.length) % data.value.length;
  rotate();
};
onMounted(async () => {
  try {
    data.value = (
      await axiosInstance.get("testimonial/testimonials/")
    ).data.filter((item) => item.to_publish);
    rotate();
  } catch (_) {
    error.value = "Testimonials are unavailable right now.";
  } finally {
    loading.value = false;
  }
});
onUnmounted(() => clearInterval(intervalId));
const initials = (name) =>
  name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
</script>

<template>
  <div v-if="loading" class="surface h-72 animate-pulse"></div>
  <div
    v-else-if="data.length"
    class="surface relative overflow-hidden p-5 sm:p-8 lg:p-9"
  >
    <span
      class="absolute -right-4 -top-12 select-none font-serif text-[12rem] leading-none text-purple-500/10"
      >“</span
    >
    <Transition name="page" mode="out-in">
      <div :key="currentIndex" class="relative">
        <div class="mb-7 flex items-center gap-2 text-[var(--primary)]">
          <p>Testimonials</p>
          <i v-for="n in 5" :key="n" class="pi pi-star-fill text-xs"></i>
        </div>
        <blockquote
          class="max-w-2xl text-sm font-light leading-relaxed text-justify tracking-[-.02em] text-[var(--ink)] sm:text-md"
        >
          “{{ data[currentIndex].testimonial }}”
        </blockquote>
        <div
          class="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-[var(--line)] pt-6"
        >
          <div class="flex items-center gap-4">
            <img
              v-if="data[currentIndex].image"
              :src="data[currentIndex].image"
              :alt="data[currentIndex].name"
              class="h-12 w-12 rounded-full object-cover ring-2 ring-purple-400/25"
            />
            <span
              v-else
              class="grid h-12 w-12 place-items-center rounded-full bg-[var(--primary)] text-sm font-bold text-white"
              >{{ initials(data[currentIndex].name) }}</span
            >
            <div>
              <p class="font-bold text-[var(--ink)]">
                {{ data[currentIndex].name }}
              </p>
              <p class="text-xs text-[var(--muted)]">
                {{ data[currentIndex].position
                }}<span v-if="data[currentIndex].company">
                  · {{ data[currentIndex].company }}</span
                >
              </p>
            </div>
          </div>
          <div v-if="data.length > 1" class="flex gap-2">
            <button
              class="testimonial-arrow"
              aria-label="Previous testimonial"
              @click="move(-1)"
            >
              <i class="pi pi-arrow-left"></i></button
            ><button
              class="testimonial-arrow"
              aria-label="Next testimonial"
              @click="move(1)"
            >
              <i class="pi pi-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
  <div v-else class="surface p-8 text-center text-sm text-[var(--muted)]">
    {{ error || "Testimonials coming soon." }}
  </div>
</template>
