<script setup>
import ProjectImageSlider from "@/components/Projects/ProjectImageSlider.vue";

import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "@/axios";

const route = useRoute();
const slug = route.params.slug;

const blog = ref([]);
const loading = ref(true);
const error = ref(null);

const copied = ref(false);

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

onMounted(async () => {
  try {
    const response = await axiosInstance.get(`blogs/blogs/${slug}/`);
    blog.value = response.data;
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

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const options = { year: "numeric", month: "short", day: "numeric" };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, options);
  } catch (e) {
    return "";
  }
};
</script>

<template>
  <article class="page-wrap max-w-[1050px]">
    <div v-if="loading" class="space-y-6">
      <div class="h-8 w-40 animate-pulse rounded-full bg-purple-500/10"></div>
      <div class="h-28 animate-pulse rounded-2xl bg-purple-500/10"></div>
      <div
        class="h-[420px] animate-pulse rounded-[2rem] bg-purple-500/10"
      ></div>
    </div>
    <div v-else-if="error" class="surface p-10 text-center">
      <p class="font-bold text-red-400">Unable to load this article</p>
      <p class="mt-2 text-sm text-[var(--muted)]">{{ error }}</p>
    </div>
    <template v-else>
      <RouterLink
        to="/blogs"
        class="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--primary)]"
        ><i class="pi pi-arrow-left text-xs"></i> Back to journal</RouterLink
      >
      <header class="mx-auto mb-8 max-w-4xl text-left sm:mb-10 sm:text-center">
        <p class="eyebrow mb-5">
          Journal · {{ formatDate(blog.published_at) }}
        </p>
        <h1 class="section-title">{{ blog.title }}</h1>
        <button
          @click="copyLink"
          class="mx-auto mt-7 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2.5 text-sm font-semibold hover:border-[var(--primary)]"
        >
          <i
            class="pi"
            :class="
              copied
                ? 'pi-check text-green-400'
                : 'pi-share-alt text-[var(--primary)]'
            "
          ></i
          >{{ copied ? "Link copied" : "Share article" }}
        </button>
      </header>
      <div
        class="overflow-hidden rounded-[1.25rem] border border-[var(--line)] shadow-[var(--shadow)] sm:rounded-[2rem]"
      >
        <img
          :src="blog.banner_image"
          :alt="blog.title"
          class="aspect-[4/3] w-full object-cover sm:aspect-[16/8]"
        />
      </div>
      <div class="mx-auto flex max-w-5xl flex-col">
        <div
          class="description-container py-8 text-sm text-justify sm:py-12 sm:text-lg"
          v-html="blog.content"
        ></div>
        <div class="lg:p-6">
          <ProjectImageSlider
            v-if="blog.blog_images?.length"
            :images="blog.blog_images"
          />
        </div>
      </div>
    </template>
  </article>
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
  color: var(--primary);
  opacity: 70%;
}

.description-container img {
  max-height: 500px;
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  object-fit: contain;
}

.description-container a {
  text-decoration: underline;
  font-style: italic;
}
</style>
