<script setup>
import { computed, ref, useId } from "vue";
import SkillButton from "@/components/Home/Skills/SkillButton.vue";

const props = defineProps({
  company: { type: String, required: true },
  company_url: { type: String, default: "" },
  logo: { type: String, default: "" },
  roles: { type: Array, default: () => [] },
  item_label: { type: String, default: "positions" },
  period: { type: String, default: undefined },
});

const instanceId = useId();
const expandedRoles = ref(new Set());
const roleKey = (role) => role.id || `${role.title}-${role.start_date}`;
const hasDetails = (role) => Boolean(role.description || role.achievements?.length || role.skills?.length || role.job_type);
function toggleRole(role) {
  const key = roleKey(role);
  const next = new Set(expandedRoles.value);
  if (next.has(key)) next.delete(key); else next.add(key);
  expandedRoles.value = next;
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
  if (props.period !== undefined) return props.period;
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
    class="experience-group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] backdrop-blur-xl"
    :class="{ 'is-single': roles.length === 1, 'has-logo': Boolean(logo) }"
  >
    <header class="organization-header flex items-start justify-between gap-3 border-b border-[var(--line)] p-4 sm:p-5">
      <div class="organization-identity flex min-w-0 items-start gap-3">
        <img
          v-if="logo"
          :src="logo"
          :alt="`${company} logo`"
          loading="lazy"
          class="organization-logo h-11 w-11 shrink-0 rounded-xl border border-[var(--line)] bg-[var(--surface-solid)] object-contain p-1"
        />
        <div class="min-w-0">
          <h3 class="text-base font-bold leading-snug tracking-tight text-[var(--primary)]">{{ company }}</h3>
          <div v-if="roles.length > 1" class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
            <span class="rounded-full bg-purple-500/10 px-2 py-0.5 font-medium text-[var(--primary)]">{{ roles.length }} {{ item_label }}</span>
            <span v-if="companyPeriod">{{ companyPeriod }}</span>
          </div>
        </div>
      </div>
      <a
        v-if="company_url"
        :href="company_url"
        target="_blank"
        rel="noopener noreferrer"
        class="company-link grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[var(--primary)]"
        :aria-label="`Visit ${company} website (opens in a new tab)`"
      ><i class="pi pi-arrow-up-right text-xs" aria-hidden="true"></i></a>
    </header>
    <ol class="role-list" :class="{ 'has-timeline': roles.length > 1 }" role="list" :aria-label="`${item_label} at ${company}, newest first`">
      <li
        v-for="(role, index) in roles"
        :key="roleKey(role)"
        v-reveal="{ timeline: roles.length > 1 }"
        class="role-item"
      >
        <span v-if="roles.length > 1" class="role-marker" aria-hidden="true"></span>
        <h4>
          <component
            :is="hasDetails(role) ? 'button' : 'div'"
            :type="hasDetails(role) ? 'button' : undefined"
            class="role-summary"
            :class="{ 'is-expandable': hasDetails(role) }"
            :aria-expanded="hasDetails(role) ? expandedRoles.has(roleKey(role)) : undefined"
            :aria-controls="hasDetails(role) ? `${instanceId}-role-${index}` : undefined"
            @click="hasDetails(role) && toggleRole(role)"
          >
            <span class="role-title">{{ role.title }}</span>
            <span v-if="role.display_period === undefined || role.display_period" class="role-period">
              <template v-if="role.display_period !== undefined">{{ role.display_period }}</template>
              <template v-else>
              <time :datetime="role.start_date">{{ formatDate(role.start_date, role.date_precision) }}</time>
              <span> — </span>
              <time v-if="role.end_date" :datetime="role.end_date">{{ formatDate(role.end_date, role.date_precision) }}</time>
              <span v-else>Present</span>
              </template>
            </span>
            <i
              v-if="hasDetails(role)"
              class="role-chevron pi pi-chevron-down"
              :class="{ 'is-collapsed': !expandedRoles.has(roleKey(role)) }"
              aria-hidden="true"
            ></i>
          </component>
        </h4>
        <Transition name="role-details">
          <div v-show="expandedRoles.has(roleKey(role))" :id="`${instanceId}-role-${index}`" class="role-details">
            <p v-if="role.job_type" class="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--primary)]">{{ role.job_type }}</p>
            <p v-if="role.description" class="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">{{ role.description }}</p>
            <ul
              v-if="role.achievements?.length"
              class="experience-achievements mt-3 list-disc space-y-1 pl-4 text-sm leading-relaxed text-[var(--muted)]"
              aria-label="Achievements"
            >
              <li v-for="(achievement, achievementIndex) in role.achievements" :key="achievementIndex">{{ achievement }}</li>
            </ul>
            <div v-if="role.skills?.length" class="mt-3 flex flex-wrap gap-1.5">
              <SkillButton v-for="skill in role.skills" :key="skill.name" :text="skill.name" />
            </div>
          </div>
        </Transition>
      </li>
    </ol>
  </article>
</template>

<style scoped>
.experience-group > .organization-header {
  background: color-mix(in srgb, var(--primary) 6%, transparent);
  box-shadow: inset 3px 0 0 color-mix(in srgb, var(--primary) 40%, transparent);
}
.role-list.has-timeline { padding: .25rem 1rem .5rem; }
.has-timeline > .role-item { position: relative; padding-left: 1.25rem; }
.has-timeline > .role-item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: calc(.375rem - .5px);
  top: 1.7rem;
  bottom: -1.7rem;
  width: 1px;
  background: color-mix(in srgb, var(--primary) 25%, var(--line));
}
.role-marker {
  position: absolute;
  left: 0;
  top: 1.35rem;
  width: .75rem;
  height: .75rem;
  border: 3px solid var(--surface-solid);
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 1px var(--line);
  transition: box-shadow .2s;
}
.role-item.is-story-active > .role-marker,
.role-item:focus-within > .role-marker {
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 12%, transparent);
}
.role-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1rem;
  align-items: center;
  column-gap: .75rem;
  row-gap: .3rem;
  width: 100%;
  min-height: 64px;
  padding: 1rem;
  text-align: left;
  color: var(--ink);
  transition: background-color .2s, color .2s;
}
.role-title { grid-column: 1; font-size: .875rem; font-weight: 600; line-height: 1.5; overflow-wrap: anywhere; }
.role-period { grid-column: 1; color: var(--muted); font-size: .75rem; font-weight: 400; line-height: 1.5; }
.role-chevron { grid-column: 2; grid-row: 1 / span 2; color: var(--primary); font-size: .625rem; transition: transform .2s; }
.role-chevron.is-collapsed { transform: rotate(-90deg); }
.role-summary.is-expandable { cursor: pointer; }
.role-summary:focus-visible, .company-link:focus-visible { outline: 2px solid var(--primary); outline-offset: -3px; }
.role-details { padding: 0 1rem 1rem; }
.role-details-enter-active, .role-details-leave-active { transition: opacity .18s, translate .18s; }
.role-details-enter-from, .role-details-leave-to { opacity: 0; translate: 0 4px; }
@media (hover: hover) {
  .role-summary.is-expandable:hover { color: var(--primary); background: color-mix(in srgb, var(--primary) 5%, transparent); }
  .company-link:hover { background: color-mix(in srgb, var(--primary) 8%, transparent); border-color: color-mix(in srgb, var(--primary) 30%, var(--line)); }
}
@media (min-width: 640px) {
  .role-summary { grid-template-columns: minmax(0, 1fr) auto 1rem; padding: 1rem 1.25rem; }
  .role-title { font-size: 1rem; }
  .role-period { grid-column: 2; font-size: .875rem; text-align: right; }
  .role-chevron { grid-column: 3; grid-row: 1; }
  .role-details { padding: 0 1.25rem 1.25rem; }
  .role-list.has-timeline { padding-right: 1.25rem; padding-left: 1.25rem; }
}
.has-timeline .role-summary { padding-right: .25rem; padding-left: .75rem; }
.has-timeline .role-details { padding-right: .25rem; padding-left: .75rem; }
.experience-group.is-single > .organization-header {
  border-bottom: 0;
  padding: 1rem 4.25rem 0 1rem;
  background: transparent;
  box-shadow: none;
}
.is-single.has-logo .organization-identity { padding-left: 3.5rem; }
.is-single .organization-logo { position: absolute; top: 1rem; left: 1rem; }
.is-single .company-link { position: absolute; top: 1rem; right: 1rem; }
.is-single .role-summary { grid-template-columns: minmax(0, 1fr) 1rem; min-height: 0; padding: .35rem 1rem 1rem; }
.is-single.has-logo .role-summary { padding-left: 4.5rem; }
.is-single .role-period { grid-column: 1; text-align: left; }
.is-single .role-chevron { grid-column: 2; grid-row: 1 / span 2; }
@media (prefers-reduced-motion: reduce) {
  .role-summary, .role-chevron, .role-marker, .role-details-enter-active, .role-details-leave-active { transition: none; }
}
</style>
