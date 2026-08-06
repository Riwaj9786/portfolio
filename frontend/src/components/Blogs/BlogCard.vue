<script setup>
defineProps({
  title: String,
  content: String,
  banner_image: [String, File],
  published_at: [String, Date],
  slug: String,
  index: { type: Number, default: 0 },
});
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};
const excerpt = (html) => {
  if (!html) return "";
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 180 ? `${text.slice(0, 180)}…` : text;
};
</script>

<template>
  <RouterLink
    :to="`/blogs/${slug}`"
    class="article-row group grid gap-5 border-b border-[var(--line)] py-7 first:pt-0 sm:grid-cols-[52px_1fr_180px] sm:items-center"
  >
    <span class="hidden font-mono text-xs text-[var(--muted)] sm:block">{{
      String(index + 1).padStart(2, "0")
    }}</span>
    <div class="min-w-0 order-2 sm:order-none">
      <time
        class="text-[11px] font-bold uppercase tracking-[.16em] text-[var(--primary)]"
        >{{ formatDate(published_at) }}</time
      >
      <h2
        class="mt-2 text-2xl font-bold leading-tight tracking-[-.035em] text-[var(--ink)] transition group-hover:text-[var(--primary)] sm:text-3xl"
      >
        {{ title }}
      </h2>
      <p class="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
        {{ excerpt(content) }}
      </p>
      <span
        class="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[var(--ink)]"
        >Read article
        <i
          class="pi pi-arrow-right text-[10px] transition-transform group-hover:translate-x-1"
        ></i
      ></span>
    </div>
    <div
      class="order-1 h-48 overflow-hidden rounded-[1.2rem] bg-purple-500/10 sm:order-none sm:h-32"
    >
      <img
        :src="banner_image"
        :alt="title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
    </div>
  </RouterLink>
</template>

<style scoped>
.article-row {
  position: relative;
}
.article-row::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 0;
  height: 1px;
  background: var(--primary);
  transition: width 0.45s ease;
}
.article-row:hover::after {
  width: 100%;
}
</style>
