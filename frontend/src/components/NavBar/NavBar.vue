<script setup>
import axiosInstance from "@/axios";
import { ref, nextTick, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useAmbience } from "@/composables/useAmbience";

const data = ref({ resume: "#" });
const menuOpen = ref(false);
const menuTrigger = ref(null);
const menuDialog = ref(null);
const closeButton = ref(null);
let previouslyFocused = null;
const route = useRoute();
const { theme, resolvedTheme, weather, weatherKind, cycleTheme } =
  useAmbience();
const weatherIcon = {
  clear: "pi-sun",
  clouds: "pi-cloud",
  fog: "pi-align-justify",
  rain: "pi-cloud",
  snow: "pi-sparkles",
  storm: "pi-bolt",
};
onMounted(async () => {
  try {
    data.value =
      (await axiosInstance.get("information/resume/")).data[0] || data.value;
  } catch (_) {}
});
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  },
);
watch(menuOpen, async (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    previouslyFocused = document.activeElement;
    await nextTick();
    closeButton.value?.focus();
  } else if (previouslyFocused) {
    previouslyFocused.focus?.();
    previouslyFocused = null;
  }
});
const handleMenuKeydown = (event) => {
  if (!menuOpen.value) return;
  if (event.key === "Escape") {
    event.preventDefault();
    menuOpen.value = false;
    return;
  }
  if (event.key !== "Tab" || !menuDialog.value) return;

  const focusable = [
    ...menuDialog.value.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
  if (!focusable.length) {
    event.preventDefault();
    menuDialog.value.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
const closeOnDesktop = () => {
  if (window.innerWidth >= 1024) menuOpen.value = false;
};
onMounted(() => {
  document.addEventListener("keydown", handleMenuKeydown);
  window.addEventListener("resize", closeOnDesktop);
});
onUnmounted(() => {
  document.removeEventListener("keydown", handleMenuKeydown);
  window.removeEventListener("resize", closeOnDesktop);
  document.body.style.overflow = "";
});
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-white/10 bg-[var(--surface)] backdrop-blur-xl"
  >
    <nav
      class="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10 lg:px-14"
      aria-label="Main navigation"
    >
      <RouterLink
        to="/"
        class="group flex min-w-0 items-center gap-2.5 sm:gap-3"
        @click="menuOpen = false"
      >
        <img
          src="@/assets/Rioz.jpg"
          alt="Riwaj Bhurtel logo"
          class="h-10 w-10 shrink-0 rounded-full object-cover shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/20"
        />
        <span class="min-w-0 leading-tight">
          <strong
            class="block truncate text-xs font-bold tracking-tight text-[var(--ink)] sm:text-sm"
            >Er. Riwaj Bhurtel</strong
          >
          <small
            class="block text-[9px] font-bold uppercase tracking-[.13em] text-[var(--primary)] sm:hidden"
            >Portfolio</small
          >
        </span>
      </RouterLink>
      <div class="hidden items-center gap-1 lg:flex">
        <RouterLink
          v-for="item in [
            { to: '/projects', label: 'Work' },
            { to: '/blogs', label: 'Journal' },
            { to: '/connect', label: 'Contact' },
          ]"
          :key="item.to"
          :to="item.to"
          class="rounded-full px-4 py-2 text-sm text-[var(--muted)] hover:bg-purple-500/10 hover:text-[var(--ink)]"
          :class="
            route.path.startsWith(item.to) ? '!text-[var(--primary)]' : ''
          "
          >{{ item.label }}</RouterLink
        >
        <div
          class="ml-2 flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-2"
          :title="`${weather.label} · ${weather.location}`"
        >
          <i
            class="pi text-[var(--primary)]"
            :class="weatherIcon[weatherKind]"
          ></i
          ><span class="text-xs text-[var(--muted)]">{{
            weather.temperature === null ? "—" : `${weather.temperature}°`
          }}</span>
        </div>
        <button
          class="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] hover:border-[var(--primary)]"
          :title="`Theme: ${theme}`"
          @click="cycleTheme"
        >
          <i
            class="pi"
            :class="resolvedTheme === 'dark' ? 'pi-moon' : 'pi-sun'"
          ></i>
        </button>
        <a
          :href="data.resume"
          target="_blank"
          rel="noopener"
          class="ml-1 rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white hover:-translate-y-0.5"
          >Résumé <span aria-hidden="true">↗</span></a
        >
      </div>
      <div class="flex shrink-0 items-center gap-2 lg:hidden">
        <div
          v-if="!menuOpen"
          class="hidden items-center gap-1.5 rounded-full border border-[var(--line)] bg-purple-500/5 px-2.5 py-2 min-[390px]:flex"
          :title="weather.label"
        >
          <i
            class="pi text-xs text-[var(--primary)]"
            :class="weatherIcon[weatherKind]"
          ></i
          ><span class="text-[10px] font-bold text-[var(--muted)]">{{
            weather.temperature === null ? "—" : `${weather.temperature}°`
          }}</span>
        </div>
        <button
          v-if="!menuOpen"
          class="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
          :title="`Theme: ${theme}`"
          aria-label="Change color theme"
          @click="cycleTheme"
        >
          <i
            class="pi text-sm"
            :class="resolvedTheme === 'dark' ? 'pi-moon' : 'pi-sun'"
          ></i>
        </button>
        <button
          ref="menuTrigger"
          class="flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-bold transition"
          :class="
            menuOpen
              ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
              : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--primary)]'
          "
          :aria-expanded="menuOpen"
          aria-controls="mobile-navigation-dialog"
          aria-haspopup="dialog"
          :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
          @click="menuOpen = !menuOpen"
        >
          <span>{{ menuOpen ? "Close" : "Menu" }}</span
          ><i class="pi text-xs" :class="menuOpen ? 'pi-times' : 'pi-bars'"></i>
        </button>
      </div>
    </nav>
  </header>
  <Teleport to="body">
    <Transition name="mobile-menu">
      <div
        v-if="menuOpen"
        id="mobile-navigation-dialog"
        ref="menuDialog"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        tabindex="-1"
        class="fixed inset-0 z-[100] h-[100dvh] overflow-hidden bg-[color-mix(in_srgb,var(--bg)_96%,transparent)] backdrop-blur-2xl lg:hidden"
      >
        <div class="mobile-menu-panel mx-auto flex h-full max-w-lg flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-9">
          <div class="flex h-20 shrink-0 items-center justify-between border-b border-[var(--line)]">
            <RouterLink to="/" class="flex items-center gap-3" @click="menuOpen=false">
              <img src="@/assets/Rioz.jpg" alt="Riwaj Bhurtel logo" class="h-10 w-10 rounded-full object-cover ring-2 ring-purple-400/20" />
              <span><strong class="block text-sm font-bold text-[var(--ink)]">Er. Riwaj Bhurtel</strong><small class="block text-[9px] font-bold uppercase tracking-[.13em] text-[var(--primary)]">Portfolio</small></span>
            </RouterLink>
            <button ref="closeButton" class="flex h-10 items-center gap-2 rounded-full bg-[var(--primary)] px-4 text-xs font-bold text-white shadow-lg shadow-purple-500/20" aria-label="Close menu" @click="menuOpen=false"><span>Close</span><i class="pi pi-times text-xs"></i></button>
          </div>
          <div class="mb-2 mt-4 flex items-center justify-between">
            <p
              class="text-[10px] font-bold uppercase tracking-[.2em] text-[var(--muted)]"
            >
              Navigate
            </p>
            <span
              class="rounded-full bg-purple-500/10 px-3 py-1 text-[10px] font-bold text-[var(--primary)]"
              >Portfolio · 2026</span
            >
          </div>

          <nav
            class="divide-y divide-[var(--line)]"
            aria-label="Mobile navigation"
          >
            <RouterLink
              v-for="(item, index) in [
                { to: '/projects', label: 'Work', description: 'Projects and case studies' },
                { to: '/blogs', label: 'Journal', description: 'Ideas, notes and stories' },
                { to: '/connect', label: 'Contact', description: 'Start a conversation' },
              ]"
              :key="item.to"
              :to="item.to"
              :aria-current="route.path.startsWith(item.to) ? 'page' : undefined"
              class="group flex items-center gap-3 py-3"
              @click="menuOpen = false"
            >
              <span class="font-mono text-[10px] text-[var(--muted)]"
                >0{{ index + 1 }}</span
              >
              <span class="min-w-0 flex-1"
                ><strong
                  class="block text-xl font-bold tracking-[-.04em] transition group-hover:text-[var(--primary)] sm:text-2xl"
                  :class="
                    route.path === item.to ||
                    (item.to !== '/' && route.path.startsWith(item.to))
                      ? 'text-[var(--primary)]'
                      : 'text-[var(--ink)]'
                  "
                  >{{ item.label }}</strong
                ></span
              >
              <span
                class="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"
                ><i class="pi pi-arrow-up-right text-xs"></i
              ></span>
            </RouterLink>
            <a
              :href="data.resume"
              target="_blank"
              rel="noopener"
              class="group flex items-center gap-3 py-3"
              @click="menuOpen = false"
            >
              <span class="font-mono text-[10px] text-[var(--muted)]">04</span>
              <span class="min-w-0 flex-1"><strong class="block text-xl font-bold tracking-[-.04em] text-[var(--ink)] transition group-hover:text-[var(--primary)] sm:text-2xl">Resume</strong></span>
              <span class="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] transition group-hover:border-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white"><i class="pi pi-download text-xs"></i></span>
            </a>
          </nav>

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3"
            >
              <div class="flex items-center gap-2">
                <i
                  class="pi text-[var(--primary)]"
                  :class="weatherIcon[weatherKind]"
                ></i
                ><strong class="text-lg text-[var(--ink)]">{{
                  weather.temperature === null ? "—" : `${weather.temperature}°`
                }}</strong>
              </div>
              <p class="mt-1 truncate text-[10px] text-[var(--muted)]">
                {{ weather.label }} · {{ weather.location }}
              </p>
            </div>
            <button
              class="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 text-left hover:border-[var(--primary)]"
              @click="cycleTheme"
            >
              <div class="flex items-center gap-2">
                <i
                  class="pi text-[var(--primary)]"
                  :class="resolvedTheme === 'dark' ? 'pi-moon' : 'pi-sun'"
                ></i
                ><strong class="capitalize text-sm text-[var(--ink)]"
                  >{{ theme }} theme</strong
                >
              </div>
              <p class="mt-1 text-[10px] text-[var(--muted)]">
                Tap to change appearance
              </p>
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: opacity 220ms ease;
}

.mobile-menu-enter-active .mobile-menu-panel,
.mobile-menu-leave-active .mobile-menu-panel {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
}

.mobile-menu-enter-from .mobile-menu-panel,
.mobile-menu-leave-to .mobile-menu-panel {
  transform: translateY(-1rem);
}

@media (prefers-reduced-motion: reduce) {
  .mobile-menu-enter-active,
  .mobile-menu-leave-active,
  .mobile-menu-enter-active .mobile-menu-panel,
  .mobile-menu-leave-active .mobile-menu-panel {
    transition-duration: 1ms;
  }
}
</style>
