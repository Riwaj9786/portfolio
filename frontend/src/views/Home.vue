<script setup>
import Information from "@/components/Home/Information/Information.vue";
import Experience from "@/components/Home/Experience/Experience.vue";
import ProjectsButton from "@/components/Home/ProjectsButton/ProjectsButton.vue";
import SkillSet from "@/components/Home/Skills/SkillSet.vue";
import ServicesHome from "@/components/Home/Services/ServicesHome.vue";
import Testimonials from "@/components/Home/Testimonial/Testimonials.vue";

import { ref, onMounted } from "vue";
import axiosInstance from "@/axios";

const data = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
   try {
      const response = await axiosInstance.get("information/description/");
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
   <div class="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[.9fr_1.1fr]">
      <div class="relative border-b border-white/10 lg:border-b-0 lg:border-r">
         <div class="lg:sticky lg:top-10">
            <Information />
         </div>
      </div>
      <div class="flex min-w-0 flex-col px-5 py-8 sm:px-9 lg:px-12 lg:py-12 xl:px-12">
         <section class="mb-8 reveal sm:mb-10">
            <div v-if="loading" class="space-y-2 animate-pulse">
               <div class="h-4 w-full bg-gray-700 rounded"></div>
               <div class="h-4 w-5/6 bg-gray-700 rounded"></div>
               <div class="h-4 w-4/6 bg-gray-700 rounded"></div>
               <div class="h-4 w-full bg-gray-700 rounded"></div>
               <div class="h-4 w-3/4 bg-gray-700 rounded"></div>
            </div>
            <p v-else-if="error" class="text-red-400">{{ error }}</p>
            <div v-else v-html="data.description" class="description-container text-justify text-base md:text-md"></div>
         </section>
         <section class="mb-8 sm:mb-10">
            <Experience />
         </section>
         <section class="mb-8 sm:mb-10">
            <ServicesHome/>
         </section>
         <section class="mb-8 sm:mb-10">
            <Testimonials/>
         </section>
         <section>
            <SkillSet/>
         </section>
      </div>
   </div>
</template>

<style>
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

   /* ✅ Cyan text for bold content */
   .description-container b,
   .description-container strong {
      color: var(--primary); /* Tailwind's cyan-400 */
   }
</style>
