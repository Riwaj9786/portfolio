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
</script>

<template>
  <RouterLink
    :to="`/projects/${slug}`"
    class="project-card group block h-full overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-3 shadow-[var(--shadow)]"
  >
    <div class="card-content relative z-[1] flex h-full min-h-[430px] flex-col">
      <div
        class="relative h-52 overflow-hidden rounded-[1.2rem] bg-purple-500/10 sm:h-60"
      >
        <img
          v-if="banner_image"
          :src="banner_image"
          :alt="name"
          loading="lazy"
          class="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        <div v-else class="generated-thumbnail" aria-hidden="true">
          <span class="thumbnail-ring ring-one"></span>
          <span class="thumbnail-ring ring-two"></span>
          <span class="thumbnail-orb"></span>
          <span class="thumbnail-letter">{{ (name || 'Project').slice(0, 1) }}</span>
        </div>
        <div
          class="absolute inset-0 bg-black/20"
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
            class="grid h-10 w-10 place-items-center rounded-full bg-purple-500/10 text-[var(--primary)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-[var(--primary-action)] group-hover:text-white"
            ><i class="pi pi-arrow-up-right text-sm"></i
          ></span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.generated-thumbnail { position:absolute;inset:0;display:grid;place-items:center;overflow:hidden;background: var(--surface); }
.thumbnail-ring { position:absolute;width:300px;height:300px;border:1px solid color-mix(in srgb,var(--primary) 45%,transparent);border-radius:50%; }
.ring-one { left:5%;top:-45%;transform:rotate(-35deg) scaleX(.55); }
.ring-two { right:0;bottom:-60%;transform:rotate(40deg) scaleX(.6); }
.thumbnail-orb { position:absolute;width:115px;height:115px;border-radius:30%;background: var(--primary-action);transform:rotate(-25deg);box-shadow:15px 20px 30px color-mix(in srgb,var(--primary) 18%,transparent); }
.thumbnail-letter { position:relative;color:white;font-size:5rem;line-height:1;font-weight:800;letter-spacing:-.07em; }
.project-card {
  position: relative;
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--primary) 48%, transparent);
  box-shadow: 0 28px 80px color-mix(in srgb, var(--primary) 16%, transparent);
}

</style>
