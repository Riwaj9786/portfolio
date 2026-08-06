<script setup>
import SkillButton from "@/components/Home/Skills/SkillButton.vue";

defineProps({
  name: String,
  banner_image: [String, File],
  skills: { type: Array, default: () => [] },
  client: String,
  start_date: [String, Date],
  end_date: [String, Date],
  slug: String,
});
const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short" });
};
const spotlight = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty(
    "--mouse-x",
    `${event.clientX - rect.left}px`,
  );
  event.currentTarget.style.setProperty(
    "--mouse-y",
    `${event.clientY - rect.top}px`,
  );
};
</script>

<template>
  <RouterLink
    :to="`/projects/${slug}`"
    class="project-card group block h-full overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]"
    @mousemove="spotlight"
  >
    <div class="card-content relative z-[1] flex h-full min-h-[430px] flex-col">
      <div
        class="relative h-52 overflow-hidden rounded-[1.2rem] bg-purple-500/10 sm:h-60"
      >
        <img
          :src="banner_image"
          :alt="name"
          loading="lazy"
          class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
        ></div>
        <span
          class="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md"
          >{{ client || "Independent project" }}</span
        >
      </div>
      <div class="flex flex-1 flex-col px-2 pb-2 pt-5">
        <div
          class="mb-3 flex items-center justify-between text-[11px] uppercase tracking-wider text-[var(--muted)]"
        >
          <span
            >{{ formatDate(start_date)
            }}<template v-if="end_date">
              — {{ formatDate(end_date) }}</template
            ></span
          >
        </div>
        <h2
          class="text-2xl font-bold leading-tight tracking-[-.035em] text-[var(--ink)] transition group-hover:text-[var(--primary)]"
        >
          {{ name }}
        </h2>
        <div class="mt-5 flex flex-wrap gap-1.5">
          <SkillButton
            v-for="skill in skills.slice(0, 4)"
            :key="skill.name"
            :text="skill.name"
          /><span
            v-if="skills.length > 4"
            class="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-[var(--primary)]"
            >+{{ skills.length - 4 }}</span
          >
        </div>
        <div
          class="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-5"
        >
          <span class="text-sm font-semibold text-[var(--ink)]"
            >View project</span
          ><span
            class="grid h-10 w-10 place-items-center rounded-full bg-purple-500/10 text-[var(--primary)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[var(--primary)] group-hover:text-white"
            ><i class="pi pi-arrow-up-right text-sm"></i
          ></span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.project-card {
  position: relative;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.project-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    420px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    color-mix(in srgb, var(--primary) 22%, transparent),
    transparent 48%
  );
  opacity: 0;
  transition: opacity 0.25s;
  pointer-events: none;
}
.project-card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--primary) 48%, transparent);
  box-shadow: 0 28px 80px color-mix(in srgb, var(--primary) 16%, transparent);
}
.project-card:hover::before {
  opacity: 1;
}
</style>
