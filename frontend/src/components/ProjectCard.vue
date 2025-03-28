<script setup>
import SkillButton from './SkillButton.vue';

const props = defineProps({
   name: {
      type: String,
      default: 'Title of Project'
   },
   banner_image: {
      type: File,
      required: false
   },
   skills: {
      type: Array,
      default: () => []
   },
   client: {
      type: String,
      default: 'Rioz Graphics'
   },
   start_date: {
      type: Date,
      default: '2024-03-11',
      required: true
   },
   end_date: {
      type: Date
   },
   link: {
      type: String,
      required: false
   }
})

const formatDate = (dateString) => {
   if (!dateString) return '';
      try {
         const options = { year: 'numeric', month: 'short' };
         const date = new Date(dateString);
         if (isNaN(date.getTime())) return '';
         return date.toLocaleDateString(undefined, options);
      } catch (e) {
         return ''; 
      }
}
</script>

<template>
   <a :href="link" target="_blank">
      <div class="w-full h-full">
         <div 
            class="relative h-full w-full flex flex-col p-4 bg-white/5 rounded-xl border border-white/5 
                  hover:bg-white/10 hover:border-white/20 transition-all duration-300 group
                  min-h-[380px]"
         >
            <div class="w-full h-36 rounded-lg mb-3 bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
               <div class="absolute inset-0">
                  <img 
                     :src="banner_image" 
                     class="w-full h-full object-cover object-center"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
               </div>
            </div>

            <div class="flex justify-between items-center text-xs text-gray-400 mb-2">
               <div class="truncate pr-2">{{ client || "Project" }}</div>
               <div class="whitespace-nowrap">
                  {{ formatDate(start_date) }}
                  <span v-if="start_date && end_date"> - </span>
                  {{ formatDate(end_date) }}
               </div>
            </div>

            <h3 class="text-xl font-medium text-white group-hover:text-cyan-400 mb-3 transition-colors duration-300 line-clamp-2 min-h-[3rem]">
               {{ name }}
            </h3>

            <div class="mt-auto">
               <div class="flex flex-wrap gap-2 w-full">
                  <SkillButton 
                     v-for="(skill, index) in skills" 
                     :key="index" 
                     :text="skill.name" 
                     class="text-xs flex-shrink-0"
                  />
               </div>
            </div>

            <div class="absolute bottom-3 right-3 text-gray-400 group-hover:bg-cyan-500/40 group-hover:text-cyan-400 transition-colors duration-300 
                        flex items-center justify-center w-7 h-7 rounded-full bg-white/5">
               <i class="pi pi-arrow-up-right text-sm"></i>
            </div>
         </div>
      </div>
   </a>
</template>