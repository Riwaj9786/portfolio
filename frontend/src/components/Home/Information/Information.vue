<script setup>
import { ref, onMounted } from "vue";
import portfolioContent from "@/content";
import MediaLinks from "@/components/Home/Information/MediaLinks.vue";

const data = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await portfolioContent.get("information/profile/");
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
    class="flex flex-col justify-center py-5 sm:py-6 lg:min-h-[calc(100vh-5rem)] lg:pr-12"
  >
    <div class="relative mx-auto w-full max-w-[240px] rounded-[1.25rem] sm:max-w-[280px] lg:mx-0 lg:max-w-xl lg:rounded-[2rem] shadow-[var(--shadow)]">
      <div
        v-if="loading"
        class="aspect-[4/5] w-full animate-pulse rounded-[1.25rem] lg:rounded-[2rem] bg-gray-800"
      ></div>
      <div v-else>
        <img
          class="aspect-[4/5] w-full rounded-[1.25rem] lg:rounded-[2rem] object-cover grayscale-[10%] transition duration-700 hover:scale-[1.015]"
          :src="data.profile_pic"
          :alt="`${data.name || 'Er. Riwaj Bhurtel'} portrait`"
        />

        <div
          class="absolute inset-x-2 bottom-2 flex gap-1.5 rounded-xl lg:inset-x-4 lg:bottom-4 lg:gap-2 lg:rounded-[1.3rem] border border-white/20 bg-black/20 p-2 backdrop-blur-md"
        >
          <RouterLink
            to="/projects"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2 py-2.5 text-[10px] font-bold text-purple-800 shadow-lg transition hover:-translate-y-0.5 min-[390px]:px-3 lg:text-xs xl:text-sm"
            >Explore my work <i class="pi pi-arrow-up-right text-[10px]"></i
          ></RouterLink>
          <RouterLink
            to="/connect"
            class="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-2 py-2.5 text-[10px] font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20 min-[390px]:px-3 lg:text-xs xl:text-sm"
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
        class="mt-5 text-xl font-bold leading-[.95] tracking-[-.055em] text-[var(--ink)] sm:text-2xl lg:mt-9 lg:text-3xl xl:text-5xl"
      >
        {{ data.name }}
      </div>
    </div>

    <div class="w-full">
      <div
        v-if="loading"
        class="pt-1 h-6 w-1/2 bg-gray-700 rounded animate-pulse"
      ></div>
      <div v-else class="mt-2 text-xs font-medium leading-relaxed text-[#8b5cf6] sm:text-sm lg:mt-3 lg:text-base">
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
        class="max-w-xl pt-3 text-xs text-justify leading-relaxed text-[var(--muted)] sm:text-sm lg:pt-5 lg:text-base"
      >
        {{ data.short_bio }}
      </div>
    </div>
  </section>
</template>
