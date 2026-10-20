<script setup>
import ServiceCard from "@/components/Home/Services/ServiceCard.vue";
import portfolioContent from "@/content";
import { ref, onMounted } from "vue";

const data = ref([]);

onMounted(async () => {
  try {
    const response = await portfolioContent.get("service/services/");
    data.value = response.data;
  } catch (error) {
    error.value = "Error Fetching Data!";
  }
});
</script>

<template>
  <div
    class="services-section flex flex-col relative rounded-xl text-[var(--ink)]"
  >
    <div id="services-title" class="section-title mb-4 lg:mb-8">
      What I bring to the table.
    </div>
    <div class="w-full">
      <div v-stagger class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <div v-for="(service, index) in data" :key="index">
          <ServiceCard
            :title="service.title"
            :icon="service.icon"
            :description="service.description"
          />
        </div>
      </div>
    </div>
  </div>
</template>
