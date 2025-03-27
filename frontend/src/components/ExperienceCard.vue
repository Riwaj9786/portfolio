<script setup>
import { computed } from 'vue';
import SkillButton from './SkillButton.vue';

// Define props
const props = defineProps({
   title: String,
   company: String,
   company_url: String,
   start_date: String,
   end_date: [String, null],
   job_type: String,
   skills: Array
});

const formatDate = (dateString) => {
   if (!dateString) return 'Present';

   const date = new Date(dateString);
   return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(date);
};

const formattedStartDate = computed(() => formatDate(props.start_date));
const formattedEndDate = computed(() => props.end_date ? formatDate(props.end_date) : 'Present');

</script>

<template>
   <a :href="company_url" class="block" target="_blank">
      <div class="group bg-white/5 hover:bg-white/10 hover:border-inner rounded-3xl p-6 h-full flex items-center my-4">
         <div class="flex flex-col md:grid md:grid-cols-8 md:justify-center relative w-full h-full">
            <div class="col-span-2 flex flex-col justify-center md:items-start items-center h-full">
               <div class="text-white text-sm">
                  {{ formattedStartDate }} - {{ formattedEndDate }}
               </div>
               <div class="text-gray-500 text-xs">{{ job_type }}</div>
            </div>
            <div class="col-span-5 ml-2 flex group-hover:text-cyan-500 justify-start items-start h-full">
               <div class="flex flex-col items-start mt-4 md:mt-0">
                  <div class="text-white font-bold group-hover:text-cyan-500">
                     {{ title }} ᐧ {{ company }}
                  </div>
                  <div class="flex flex-wrap mt-2 gap-1">
                     <SkillButton v-for="(skill, index) in skills" :key="index" :text="skill.name"/>
                  </div>
               </div>
            </div>
            <div v-if="company_url" class="col-span-1 flex absolute bottom-3 right-3 justify-end items-end h-full">
               <i class="pi pi-arrow-up-right text-white group-hover:text-cyan-500"></i>
            </div>
         </div>
      </div>
   </a>
</template>
