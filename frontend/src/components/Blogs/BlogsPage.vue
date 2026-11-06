<script setup>
import BlogSection from "@/components/Blogs/BlogSection.vue";

import { ref, onMounted } from "vue";
import portfolioContent from "@/content";
import FeaturedBlog from "./FeaturedBlog.vue";

const featuredBlog = ref(null);

onMounted(async () => {
  try {
    const response = await portfolioContent.get("blogs/featured_blog/");
    featuredBlog.value = response.data?.[0]?.blog ?? null;
  } catch (err) {
    console.error(err);
  }
});
</script>

<template>
  <div
    class="portfolio-journal page-container py-9 sm:py-12 lg:py-20"
  >
    <div class="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-2 lg:items-end">
      <div>
        <h1 class="section-title">
          The journal<span class="text-[var(--primary)]">.</span>
        </h1>
      </div>
      <p
        class="max-w-md text-sm leading-relaxed text-[var(--muted)] lg:justify-self-end"
      >
        Long-form thoughts on engineering, design, leadership, and the lessons
        found between shipping and learning.
      </p>
    </div>
    <div
      class="grid w-full grid-cols-1 gap-9 sm:gap-12"
      :class="{ 'lg:grid-cols-[360px_minmax(0,1fr)]': featuredBlog }"
    >
      <!-- Featured Blog with sticky on lg+ -->
      <div v-if="featuredBlog" class="w-full lg:sticky lg:top-28 self-start">
        <FeaturedBlog :blog="featuredBlog" />
      </div>

      <!-- Blog Cards Section -->
      <div class="w-full min-w-0">
        <BlogSection />
      </div>
    </div>
  </div>
</template>
