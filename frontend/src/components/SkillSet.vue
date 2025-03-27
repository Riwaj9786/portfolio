<script setup>
import SkillSetCategories from './SkillSetCategories.vue';
import axiosInstance from '@/axios';
import { ref, onMounted } from 'vue';

const categories = ref([]);
const selectedCategory = ref(null);
const skills = ref([]);
const errorMessage = ref(null);
const loading = ref(false);

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

   try {
      const encodedCategory = encodeURIComponent(category);
      const response = await axiosInstance.get(`skill/?category__name=${encodedCategory}`);
      skills.value = response.data;
   } catch (error) {
      console.error("Error fetching skills:", error);
      errorMessage.value = "Failed to load skills";
   } finally {
      loading.value = false;
   }
};
</script>

<template>
   <div class="bg-white/5 h-full rounded-xl p-4">
      <div v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">
         {{ errorMessage }}
      </div>

      <SkillSetCategories v-if="categories.length" :list="categories" :activeCategory="selectedCategory" @categorySelected="fetchSkills" />
      
      <div v-else-if="!errorMessage" class="text-gray-400 text-center">Loading categories...</div>

      <div v-if="selectedCategory" class="mt-6">         
         <div v-if="loading" class="text-gray-400 text-center mt-2">Loading skills...</div>

         <div v-if="skills.length" class="flex flex-col gap-2">
            <div v-for="(skill, index) in skills" :key="index" class="flex w-full p-2 rounded-xl items-center gap-3">
               <img :src="skill.logo" :alt="skill.name" class="w-10 h-10 max-h-10 rounded-full object-contain">
               <div class="w-full">
                  <h3 class="text-white font-semibold">{{ skill.name }}</h3>
                  <div class="bg-gray-500 rounded-full h-2 mt-1">
                     <div class="bg-cyan-500 h-2 rounded-full" :style="{width: skill.level * 10 + '%'}"></div>
                  </div>
               </div>
            </div>
         </div>
         <div v-if="!loading && !skills.length" class="text-gray-500 text-center mt-2">No skills available for this category.</div>
      </div>
   </div>
</template>
