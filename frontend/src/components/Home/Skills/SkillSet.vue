<script setup>
import SkillSetCategories from './SkillSetCategories.vue';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';
import { computed } from 'vue';

const categories = ref([]);
const selectedCategory = ref(null);
const skills = ref([]);
const errorMessage = ref(null);
const loading = ref(false);
const imageLoaded = ref({}); // Track loaded state for each image

onMounted(async () => {
   try {
      const response = await axiosInstance.get('skill/categories/');
      categories.value = response.data.map(category => category.name);

      if (categories.value.length > 0) {
         selectedCategory.value = categories.value[0];
         fetchSkills(categories.value[0]);
      }
   } catch (error) {
      console.error("Error Fetching Categories:", error);
      errorMessage.value = "Failed to load categories";
   }
});

const fetchSkills = async (category) => {
   selectedCategory.value = category;
   loading.value = true;
   skills.value = [];
   imageLoaded.value = {}; // Reset loaded state when fetching new skills

   try {
      const encodedCategory = encodeURIComponent(category);
      const response = await axiosInstance.get(`skill/?category__name=${encodedCategory}`);
      skills.value = response.data;
      
      // Initialize image loaded state
      skills.value.forEach((skill, index) => {
         imageLoaded.value[index] = false;
      });
   } catch (error) {
      console.error("Error fetching skills:", error);
      errorMessage.value = "Failed to load skills";
   } finally {
      loading.value = false;
   }
};

const handleImageLoad = (index) => {
   imageLoaded.value[index] = true;
};

const topSkills = computed(() => [...skills.value].sort((a, b) => Number(b.level) - Number(a.level)).slice(0, 6));
const ratingLabel = level => Number(level) >= 9 ? 'Expert' : Number(level) >= 7 ? 'Advanced' : Number(level) >= 5 ? 'Proficient' : 'Growing';
</script>

<template>
   <div class="surface h-full overflow-hidden p-4 sm:p-7">
      <div class="mb-7 flex flex-col gap-4 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
         <div><p class="text-xs font-bold uppercase tracking-[.18em] text-[var(--primary)]">Top expertise</p><h2 class="mt-2 text-3xl font-bold tracking-[-.04em] text-[var(--ink)]">Skills by category</h2><p class="mt-2 max-w-md text-sm text-[var(--muted)]">Highest-rated tools and capabilities in each discipline.</p></div>
      </div>
      <div v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">
         {{ errorMessage }}
      </div>

      <SkillSetCategories v-if="categories.length" :list="categories" :activeCategory="selectedCategory" @categorySelected="fetchSkills" />
      
      <div v-else-if="!errorMessage" class="text-[var(--muted)] text-center">Loading categories...</div>

      <div v-if="selectedCategory">         
         <div v-if="loading" class="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2"><div v-for="n in 6" :key="n" class="h-20 animate-pulse rounded-2xl bg-purple-500/10"></div></div>

         <Transition name="page" mode="out-in">
         <div v-if="topSkills.length" :key="selectedCategory" class="grid grid-cols-1 gap-3 pt-5 sm:grid-cols-2">
            <div v-for="(skill, index) in topSkills" :key="skill.id || skill.name" class="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:-translate-y-1 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10">
               <span class="absolute right-3 top-2 text-3xl font-black text-purple-500/[.07]">0{{ index + 1 }}</span>
               <!-- Skeleton loader for logo -->
               <div v-if="!imageLoaded[index]" class="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
               
               <!-- Actual image (hidden until loaded) -->
               <img 
                  :src="skill.logo" 
                  :alt="skill.name" 
                  class="h-11 w-11 rounded-xl bg-white/80 p-1.5 object-contain shadow-sm"
                  :class="{'hidden': !imageLoaded[index]}"
                  @load="handleImageLoad(index)"
               >
               
               <div class="w-full">
                  <div class="flex items-center justify-between gap-3"><h3 class="font-bold text-[var(--ink)]">{{ skill.name }}</h3><span class="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">{{ ratingLabel(skill.level) }}</span></div>
                  <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-purple-500/10" :aria-label="`${skill.level} out of 10`">
                     <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" :style="{width: skill.level * 10 + '%'}"></div>
                  </div>
               </div>
            </div>
         </div>
         </Transition>
         <div v-if="!loading && !skills.length" class="text-[var(--muted)] text-center mt-2">No skills available for this category.</div>
      </div>
   </div>
</template>
