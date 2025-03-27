<script setup>
import NavBar from "@/components/NavBar.vue";
import Information from "@/components/Information.vue";
import Experience from "@/components/Experience.vue";
import ProjectsButton from "@/components/ProjectsButton.vue";
import SkillSet from "@/components/SkillSet.vue";
import ServicesHome from "@/components/ServicesHome.vue";

import { ref, onMounted } from "vue";
import axiosInstance from "@/axios";
import axios from "axios";
import { RouterLink } from "vue-router";

const data = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
   try{
      const response = await axiosInstance.get('information/description/')
      data.value = response.data[0];
   } catch (error){
      error.value = "Error Fetching Data!"
   } finally {
      loading.value = false
   }
})
</script>

<template>
   <div>
      <NavBar />
   </div>
   <div class="grid grid-cols-1 lg:grid-cols-2">
      <div class="relative h-auto">
         <div class="lg:sticky top-0">
            <Information />
         </div>
      </div>
      <div class="flex flex-col">
         <p class="text-justify text-xs hidden md:block md:text-sm xl:text-lg text-gray-200 mt-12 mx-12">
            {{ data.description }}
         </p>
         <div class="m-12">
            <Experience />
         </div>
         <div class="m-2 flex justify-center">
            <ProjectsButton/>
         </div>
         <div class="m-12">
            <ServicesHome/>
         </div>
         <div class="m-12">
            <SkillSet/>
         </div>
      </div>
   </div>
</template>