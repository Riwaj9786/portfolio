<script setup>
import { computed, ref, useId } from "vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";

const props = defineProps({
  company: { type: String, required: true },
  company_url: { type: String, default: "" },
  logo: { type: String, default: "" },
  roles: { type: Array, default: () => [] },
});

const instanceId = useId();
const closedRoles = ref(new Set());
const roleKey = (role) => role.id || `${role.title}-${role.start_date}`;
const hasDetails = (role) => Boolean(role.description || role.achievements?.length);
function toggleRole(role) {
  const key = roleKey(role);
  const next = new Set(closedRoles.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  closedRoles.value = next;
}

const formatDate = (value, precision = "month") => {
  if (!value) return "Present";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        ...(precision === "year" ? {} : { month: "short" }),
        timeZone: "UTC",
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
  const precision = props.roles.every((role) => role.date_precision === "year")
    ? "year"
    : "month";
  return `${formatDate(earliest, precision)} — ${latest ? formatDate(latest, precision) : "Present"}`;
});
</script>

<template>
  <article
    class="experience-group my-3 overflow-hidden rounded-xl lg:my-4 lg:rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl"
  >
    <header
      class="flex flex-col w-full gap-2 border-b border-[var(--line)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:gap-3 lg:px-7 lg:py-5"
    >
      <div class="flex min-w-0 items-center gap-3">
        <img
          v-if="logo"
          :src="logo"
          :alt="`${company} logo`"
          class="h-10 w-10 shrink-0 rounded-xl border border-[var(--line)] object-contain p-1 lg:h-12 lg:w-12"
        />
        <div class="min-w-0">
          <p
            class="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[var(--primary)]"
          >
            {{ roles.length > 1 ? `${roles.length} roles` : "" }}
          </p>
          <div
            class="flex flex-wrap justify-between items-baseline gap-x-3 gap-y-1"
          >
            <h3
              class="text-base font-bold tracking-tight lg:text-xl text-[var(--ink)]"
            >
              {{ company }}
            </h3>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span v-if="roles.length > 1" class="text-xs text-[var(--muted)]">{{
          companyPeriod
        }}</span>
        <span
          v-if="roles.length === 1"
          class="text-xs font-medium text-[var(--muted)]"
          >{{ formatDate(roles[0].start_date, roles[0].date_precision) }} —
          {{ formatDate(roles[0].end_date, roles[0].date_precision) }}</span
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

    <div class="px-4 py-4 lg:px-7 lg:py-6">
      <ol
        class="relative"
        :class="roles.length > 1 ? 'ml-2 border-l border-purple-400/35' : ''"
      >
        <li
          v-for="(role, index) in roles"
          :key="role.id || `${role.title}-${role.start_date}`"
          v-reveal="{ timeline: true }"
          class="timeline-role relative pb-4 lg:pb-7 last:pb-0"
          :class="roles.length > 1 ? 'pl-5 lg:pl-7' : ''"
        >
          <span
            v-if="roles.length > 1"
            class="absolute -left-[7px] top-1.5 h-[13px] w-[13px] rounded-full border-[3px] border-[var(--surface-solid)] bg-[var(--primary-action)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_16%,transparent)]"
          ></span>
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <h4 class="text-sm font-semibold text-[var(--ink)] lg:text-base">
                <button v-if="hasDetails(role)" type="button" class="role-details-toggle" :aria-expanded="!closedRoles.has(roleKey(role))" :aria-controls="`${instanceId}-role-${index}`" @click="toggleRole(role)">
                  {{ role.title }}<i class="pi pi-chevron-down" :class="{ 'is-collapsed': closedRoles.has(roleKey(role)) }" aria-hidden="true"></i>
                </button>
                <template v-else>{{ role.title }}</template>
              </h4>
              <span
                v-if="role.job_type"
                class="text-[10px] font-medium uppercase tracking-wider lg:text-xs text-[var(--primary)]"
                >{{ role.job_type }}</span
              >
            </div>
            <time
              v-if="roles.length > 1"
              class="shrink-0 text-xs text-[var(--muted)]"
              >{{ formatDate(role.start_date, role.date_precision) }} —
              {{ formatDate(role.end_date, role.date_precision) }}</time
            >
          </div>
          <Transition name="role-details">
            <div v-show="!closedRoles.has(roleKey(role))" :id="`${instanceId}-role-${index}`">
          <p
            v-if="role.description"
            class="mt-3 whitespace-pre-line text-xs leading-relaxed text-justify text-[var(--muted)]"
          >
            {{ role.description }}
          </p>
          <ul
            v-if="role.achievements?.length"
            v-stagger
            class="experience-achievements mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[var(--muted)] lg:text-sm"
            aria-label="Achievements"
          >
            <li
              v-for="(achievement, achievementIndex) in role.achievements"
              :key="achievementIndex"
            >
              {{ achievement }}
            </li>
          </ul>
            </div>
          </Transition>
          <div v-if="role.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
            <SkillButton
              v-for="skill in role.skills"
              :key="skill.name"
              :text="skill.name"
            />
          </div>
          <div
            v-if="roles.length > 1 && index < roles.length - 1"
            class="mt-4 lg:mt-6 h-px bg-[var(--line)]"
          ></div>
        </li>
      </ol>
    </div>
  </article>
</template>

<style scoped>
.role-details-toggle { display:inline-flex;align-items:baseline;gap:.65rem;text-align:left;font:inherit;color:inherit;border-radius:4px; }
.role-details-toggle i { font-size:.55rem;color:var(--primary);transition:transform .2s; }
.role-details-toggle i.is-collapsed { transform:rotate(-90deg); }
.role-details-toggle:hover { color:var(--primary); }
.role-details-toggle:focus-visible { outline:2px solid var(--primary);outline-offset:4px; }
.timeline-role>span { transition:box-shadow .3s,background-color .3s; }
.timeline-role.is-story-active>span,.timeline-role:focus-within>span { box-shadow:0 0 0 5px color-mix(in srgb,var(--primary) 18%,transparent); }
.role-details-enter-active,.role-details-leave-active { transition:opacity .18s,translate .18s; }
.role-details-enter-from,.role-details-leave-to { opacity:0;translate:0 4px; }
@media(prefers-reduced-motion:reduce) { .role-details-toggle i,.timeline-role>span,.role-details-enter-active,.role-details-leave-active { transition:none; } }
</style>
