<script setup>
import ProjectDescription from "@/components/Projects/ProjectDescription.vue";
import ProjectSideHandles from "@/components/Projects/ProjectSideHandles.vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";
import ImportantLinks from "@/components/Projects/ImportantLinks.vue";
import ProjectImageSlider from "@/components/Projects/ProjectImageSlider.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "@/axios";

const route = useRoute();
const slug = route.params.slug;

const project = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
   try {
      const response = await axiosInstance.get(`projects/project/${slug}/`);
      project.value = response.data;
   } catch (err) {
      error.value = err.response?.data?.detail || err.message;
   } finally {
      loading.value = false;
   }
});

const isBannerFullscreen = ref(false);

const openBannerFullscreen = () => {
   isBannerFullscreen.value = true;
};

const closeBannerFullscreen = () => {
   isBannerFullscreen.value = false;
};
</script>

<template>
   <div class="grid grid-cols-1 lg:grid-cols-3 gap-x-4 mx-4 lg:mx-12">
      <div class="flex my-4 p-6 col-span-1 lg:hidden">
         <img class="w-full h-auto" :src="project.banner_image"/>
      </div>

      <div class="col-span-2">
         <ProjectDescription
            :name="project.name"
            :description="project.description"
         />
         <div class="lg:p-6">
            <ProjectImageSlider v-if="project.project_images?.length" :images="project.project_images" />
         </div>
      </div>

      <div class="flex flex-col col-span-1 mb-4 p-6 gap-y-8">
         <div class="mt-4 hidden lg:block">
            <img class="w-full h-auto" :src="project.banner_image" />
         </div>

         <ProjectSideHandles
            :client="project.client"
            :start_date="project.start_date"
            :end_date="project.end_date"
            :category="project.category"
         />

         <div>
            <p class="text-white mb-2 font-bold">Tools Used:</p>
            <div class="flex flex-wrap gap-2">
               <SkillButton
                  v-for="(skill, index) in project.skills"
                  :key="index"
                  :text="skill.name"
               />
            </div>
         </div>

         <div v-if="project.project_links && project.project_links.length">
            <p class="text-white mb-2 font-bold">Important Links:</p>
            <div class="flex flex-wrap gap-2">
               <ImportantLinks
                  v-for="(link, index) in project.project_links"
                  :name="link.name"
                  :link="link.link"
               />
            </div>
         </div>

         <div v-if="project.distinct_features" class="description-container">
            <p class="text-white mb-2 font-bold">Distinct Features:</p>
            <div
               v-html="project.distinct_features"
               class="text-gray-300 text-md lg:text-lg "
            ></div>
         </div>
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

   .description-container b,
   .description-container strong {
      color: cyan;
      opacity: 70%;
   }

   .description-container a {
      text-decoration: underline;
   }
</style>