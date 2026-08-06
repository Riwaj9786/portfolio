<script setup>
import { computed } from "vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";

const props = defineProps({
  company: { type: String, required: true },
  company_url: { type: String, default: "" },
  roles: { type: Array, default: () => [] },
});

const formatDate = (value) => {
  if (!value) return "Present";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
      }).format(date);
};

const companyPeriod = computed(() => {
  if (!props.roles.length) return "";
  const starts = props.roles
    .map((role) => new Date(role.start_date))
    .filter((date) => !Number.isNaN(date.getTime()));
  const earliest = new Date(Math.min(...starts));
  const hasCurrentRole = props.roles.some((role) => !role.end_date);
  const ends = props.roles
    .map((role) => (role.end_date ? new Date(role.end_date) : null))
    .filter(Boolean);
  const latest = hasCurrentRole ? null : new Date(Math.max(...ends));
  return `${formatDate(earliest)} — ${latest ? formatDate(latest) : "Present"}`;
});
</script>

<template>
  <article
    class="experience-group my-4 overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl"
  >
    <header
      class="flex flex-col w-full gap-3 border-b border-[var(--line)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
    >
      <div>
        <p
          class="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]"
        >
          {{
            roles.length > 1
              ? `${roles.length} roles · Career progression`
              : "Experience"
          }}
        </p>
        <div class="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1">
          <h3 class="text-xl font-bold tracking-tight text-[var(--ink)]">
            {{ company }}
          </h3>

        </div>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="roles.length > 1" class="text-xs text-[var(--muted)]">{{
          companyPeriod
        }}</span>
        <span
          v-if="roles.length === 1"
          class="text-xs font-medium text-[var(--muted)]"
          >{{ formatDate(roles[0].start_date) }} —
          {{ formatDate(roles[0].end_date) }}</span
        >
        <a
          v-if="company_url"
          :href="company_url"
          target="_blank"
          rel="noopener noreferrer"
          class="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--primary)] hover:-translate-y-0.5 hover:border-[var(--primary)]"
          :aria-label="`Visit ${company} website`"
        >
          <i class="pi pi-arrow-up-right text-xs"></i>
        </a>
      </div>
    </header>

    <div class="px-5 py-6 sm:px-7">
      <ol
        class="relative"
        :class="roles.length > 1 ? 'ml-2 border-l border-purple-400/35' : ''"
      >
        <li
          v-for="(role, index) in roles"
          :key="role.id || `${role.title}-${role.start_date}`"
          class="relative pb-7 last:pb-0"
          :class="roles.length > 1 ? 'pl-7' : ''"
        >
          <span
            v-if="roles.length > 1"
            class="absolute -left-[7px] top-1.5 h-[13px] w-[13px] rounded-full border-[3px] border-[var(--surface-solid)] bg-[var(--primary)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_16%,transparent)]"
          ></span>
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h4 class="font-semibold text-[var(--ink)]">{{ role.title }}</h4>
              <span
                class="text-xs font-medium uppercase tracking-wider text-[var(--primary)]"
                >{{ role.job_type }}</span
              >
            </div>
            <time
              v-if="roles.length > 1"
              class="shrink-0 text-xs text-[var(--muted)]"
              >{{ formatDate(role.start_date) }} —
              {{ formatDate(role.end_date) }}</time
            >
          </div>
          <div v-if="role.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
            <SkillButton
              v-for="skill in role.skills"
              :key="skill.name"
              :text="skill.name"
            />
          </div>
          <div
            v-if="roles.length > 1 && index < roles.length - 1"
            class="mt-6 h-px bg-gradient-to-r from-[var(--line)] to-transparent"
          ></div>
        </li>
      </ol>
    </div>
  </article>
</template>
