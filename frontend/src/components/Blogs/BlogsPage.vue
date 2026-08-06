<script setup>
import BlogSection from "@/components/Blogs/BlogSection.vue";

import { ref, onMounted } from "vue";
import axiosInstance from "@/axios";
import FeaturedBlog from "./FeaturedBlog.vue";

const data = ref({});
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await axiosInstance.get("blogs/featured_blog/");
    data.value = response.data[0].blog;
  } catch (err) {
    error.value = "Error Fetching Data!";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const contentTruncated = (content, length = 120) => {
  if (!content) return "";
  return content.length > length
    ? content.substring(0, length) + "..."
    : content;
};
</script>

<template>
  <div
    class="mx-auto w-full max-w-[1440px] px-5 py-9 sm:px-9 sm:py-12 lg:px-14 lg:py-20"
  >
    <div class="mb-10 grid gap-5 sm:mb-14 lg:grid-cols-2 lg:items-end">
      <div>
        <h1 class="section-title">
          The journal<span class="text-[#a855f7]">.</span>
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
      class="grid w-full grid-cols-1 gap-9 sm:gap-12 lg:grid-cols-[360px_minmax(0,1fr)]"
    >
      <!-- Featured Blog with sticky on lg+ -->
      <div class="w-full lg:sticky lg:top-28 self-start">
        <FeaturedBlog />
      </div>

      <!-- Blog Cards Section -->
      <div class="w-full min-w-0">
        <BlogSection />
      </div>
    </div>
  </div>
</template>
