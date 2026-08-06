<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from "@/axios";
import MediaLinks from "@/components/Home/Information/MediaLinks.vue";

const data = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await axiosInstance.get("information/profile/");
    data.value = response.data[0];
  } catch (err) {
    error.value = "Error Fetching Data!";
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section
    class="flex min-h-[calc(100vh-5rem)] flex-col justify-center px-5 py-6 sm:px-9 lg:px-12 xl:px-16"
  >
    <div class="relative w-full max-w-xl rounded-[2rem] shadow-[var(--shadow)]">
      <div
        v-if="loading"
        class="aspect-[4/5] w-full animate-pulse rounded-[2rem] bg-gray-800"
      ></div>
      <div v-else>
        <img
          class="aspect-[4/5] w-full rounded-[2rem] object-cover grayscale-[10%] transition duration-700 hover:scale-[1.015]"
          :src="data.profile_pic"
          :alt="`${data.name || 'Er. Riwaj Bhurtel'} portrait`"
        />

        <div
          class="absolute inset-x-4 bottom-4 flex gap-2 rounded-[1.3rem] border border-white/20 bg-black/20 p-2 backdrop-blur-md"
        >
          <RouterLink
            to="/projects"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2 py-2.5 text-[10px] font-bold text-purple-800 shadow-lg transition hover:-translate-y-0.5 min-[390px]:px-3 min-[390px]:text-xs sm:text-sm"
            >Explore my work <i class="pi pi-arrow-up-right text-[10px]"></i
          ></RouterLink>
          <RouterLink
            to="/connect"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-2 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20 min-[390px]:px-3 min-[390px]:text-xs sm:text-sm"
            >Send a message <i class="pi pi-send text-[10px]"></i
          ></RouterLink>
        </div>
      </div>
    </div>
    <div class="w-full">
      <div
        v-if="loading"
        class="mt-5 h-8 w-3/4 bg-gray-700 rounded animate-pulse"
      ></div>
      <div
        v-else-if="data && data.name"
        class="mt-9 text-2xl font-bold leading-[.95] tracking-[-.055em] text-[var(--ink)] sm:text-3xl xl:text-5xl"
      >
        {{ data.name }}
      </div>
    </div>

    <div class="w-full">
      <div
        v-if="loading"
        class="pt-1 h-6 w-1/2 bg-gray-700 rounded animate-pulse"
      ></div>
      <div v-else class="mt-3 text-base font-medium text-[#8b5cf6] sm:text-md">
        {{ data.title }}
      </div>
    </div>

    <div class="w-full">
      <div v-if="loading" class="pt-2 space-y-2">
        <div class="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
        <div class="h-4 w-4/6 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div
        v-else
        class="max-w-xl pt-5 text-sm leading-relaxed text-[var(--muted)] sm:text-base"
      >
        {{ data.short_bio }}
      </div>
    </div>
  </section>
</template>
