<script setup>
import { nextTick, ref } from "vue";
import content from "virtual:portfolio-content";
import { createPortfolioSearch } from "@/portfolioSearch.mjs";
import AskRioLogo from "./AskRioLogo.vue";
const dialog = ref(null);
const launcher = ref(null);
const input = ref(null);
const transcript = ref(null);
const question = ref("");
const opened = ref(false);
const messages = ref([]);
const suggestions = [
  "Django projects",
  "Logo design",
  "Leadership roles",
  "Skills",
  "Contact",
];
let search;
async function openChat() {
  opened.value = true;
  dialog.value.showModal();
  await nextTick();
  input.value?.focus();
}
function closeChat() {
  dialog.value.close();
}
function onClose() {
  opened.value = false;
  launcher.value?.focus();
}
function backdrop(event) {
  if (event.target === dialog.value) closeChat();
}
async function send(value = question.value) {
  const text = value.trim().slice(0, 240);
  if (!text) return;
  search ||= createPortfolioSearch(content);
  messages.value.push(
    { role: "user", text },
    { role: "assistant", ...search(text) },
  );
  // Keep the conversation bounded and in memory only.
  if (messages.value.length > 40)
    messages.value.splice(0, messages.value.length - 40);
  question.value = "";
  await nextTick();
  transcript.value.scrollTop = transcript.value.scrollHeight;
  input.value?.focus();
}
async function clearChat() {
  messages.value = [];
  question.value = "";
  await nextTick();
  input.value?.focus();
}
</script>

<template>
  <button
    ref="launcher"
    type="button"
    class="search-launcher"
    aria-label="Open AskRio portfolio search"
    aria-haspopup="dialog"
    aria-controls="portfolio-search-chat"
    :aria-expanded="opened"
    @click="openChat"
  >
    <span class="launcher-logo" aria-hidden="true"><AskRioLogo /></span
    ><span class="launcher-label">AskRio</span
    ><span class="launcher-status" aria-hidden="true"></span>
  </button>
  <dialog
    id="portfolio-search-chat"
    ref="dialog"
    class="search-chat"
    aria-labelledby="search-chat-title"
    @close="onClose"
    @click="backdrop"
  >
    <div class="chat-layout">
      <header class="chat-header">
        <span class="chat-symbol" aria-hidden="true"><AskRioLogo /></span>
        <div>
          <h2 id="search-chat-title">AskRio</h2>
        </div>
        <button
          v-if="messages.length"
          type="button"
          class="chat-icon"
          aria-label="Clear conversation"
          @click="clearChat"
        >
          <i class="pi pi-refresh" aria-hidden="true"></i></button
        ><button
          type="button"
          class="chat-icon"
          aria-label="Close portfolio search"
          @click="closeChat"
        >
          <i class="pi pi-times" aria-hidden="true"></i>
        </button>
      </header>
      <div
        ref="transcript"
        class="chat-transcript"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Portfolio search conversation"
      >
        <div class="welcome-message">
          <span class="welcome-icon" aria-hidden="true"><AskRioLogo /></span>
          <h3>What would you like to explore?</h3>
          <p>
            I can find projects, skills, leadership roles, articles, and contact
            details from this portfolio.
          </p>
          <small
            >Local content search, powered by Fuse.js. Answers are excerpts from
            the site.</small
          >
        </div>
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="chat-message"
          :class="message.role"
        >
          <span class="sr-only"
            >{{ message.role === "user" ? "You" : "Portfolio search" }}:</span
          >
          <p>{{ message.text }}</p>
          <ul v-if="message.results?.length" class="chat-results">
            <li v-for="result in message.results" :key="result.id">
              <RouterLink :to="result.url" @click="closeChat"
                ><span class="result-kind"
                  >{{ result.kind }}
                  <i class="pi pi-arrow-up-right" aria-hidden="true"></i></span
                ><strong>{{ result.title }}</strong
                ><span class="result-snippet">{{
                  result.snippet
                }}</span></RouterLink
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="chat-suggestions"
        role="group"
        aria-label="Suggested searches"
      >
        <button
          v-for="suggestion in suggestions"
          :key="suggestion"
          type="button"
          @click="send(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
      <form class="chat-form" @submit.prevent="send()">
        <label for="portfolio-question" class="sr-only"
          >Search the portfolio</label
        ><input
          id="portfolio-question"
          ref="input"
          v-model="question"
          type="text"
          maxlength="240"
          autocomplete="off"
          placeholder="Try “show me Django projects”…"
        /><button
          type="submit"
          :disabled="!question.trim()"
          aria-label="Send search"
        >
          <i class="pi pi-arrow-up" aria-hidden="true"></i>
        </button>
      </form>
      <p class="chat-privacy">
        No AI API. Searches and chat stay in this browser session.
      </p>
    </div>
  </dialog>
</template>

<style scoped>
.search-launcher {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 45;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 48px;
  border: 1px solid color-mix(in srgb, var(--primary-bright) 60%, transparent);
  border-radius: 999px;
  background: var(--surface-solid);
  color: var(--ink);
  padding: 0.5rem 1rem 0.5rem 0.6rem;
  box-shadow: 0 8px 30px color-mix(in srgb, var(--primary) 30%, transparent);
  font-size: 0.75rem;
  font-weight: 700;
}
.search-chat {
  position: fixed;
  inset: auto 1rem 1rem auto;
  margin: 0;
  width: min(420px, calc(100vw - 2rem));
  height: min(650px, calc(100dvh - 2rem));
  max-width: none;
  max-height: none;
  border: 1px solid var(--line);
  border-radius: 1.4rem;
  background: var(--surface);
  color: var(--ink);
  box-shadow: var(--shadow);
  padding: 0;
}
.search-chat::backdrop {
  background: rgba(10, 5, 20, 0.25);
}
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.chat-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
}
.chat-symbol {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  padding: 3px;
  border-radius: 13px;
  background: var(--bg-2);
  color: var(--primary);
}
.chat-header > div {
  flex: 1;
  min-width: 0;
}
.chat-header h2 {
  font-size: 0.9rem;
  font-weight: 750;
  letter-spacing: -0.025em;
}
.chat-header p {
  font-size: 0.6rem;
  color: var(--muted);
  margin-top: 0.2rem;
}
.chat-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  color: var(--muted);
  font-size: 0.7rem;
}
.chat-icon:hover {
  background: var(--bg-2);
  color: var(--primary);
}
.chat-transcript {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem;
}
.welcome-message {
  padding: 0.6rem 0 1rem;
}
.welcome-icon {
  display: block;
  width: 64px;
  height: 64px;
  padding: 5px;
  margin-bottom: 1rem;
  color: var(--primary);
  animation: rio-float 5s ease-in-out infinite;
}
.welcome-message h3 {
  margin-top: 0.7rem;
  font-size: 1.15rem;
  font-weight: 750;
  letter-spacing: -0.035em;
}
.welcome-message p {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.7;
  color: var(--muted);
}
.welcome-message small {
  display: block;
  margin-top: 0.7rem;
  font-size: 0.6rem;
  line-height: 1.6;
  color: var(--muted);
}
.chat-message {
  margin-top: 0.9rem;
  font-size: 0.75rem;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.chat-message.user {
  margin-left: 2rem;
  background: var(--primary-action);
  color: white;
  border-radius: 1rem 1rem 0.2rem 1rem;
  padding: 0.7rem 0.9rem;
}
.chat-message.assistant > p {
  padding: 0.3rem 0;
  color: var(--muted);
}
.chat-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.6rem;
}
.chat-results a {
  display: block;
  padding: 0.8rem;
  border: 1px solid var(--line);
  border-radius: 0.8rem;
  background: var(--surface);
}
.chat-results a:hover {
  border-color: var(--primary);
}
.result-kind {
  display: flex;
  justify-content: space-between;
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--primary);
}
.chat-results strong {
  display: block;
  margin: 0.3rem 0;
  font-size: 0.75rem;
  line-height: 1.5;
  font-weight: 700;
  color: var(--ink);
}
.result-snippet {
  display: block;
  font-size: 0.65rem;
  line-height: 1.7;
  color: var(--muted);
}
.chat-suggestions {
  display: flex;
  gap: 0.4rem;
  overflow-x: auto;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
}
.chat-suggestions button {
  white-space: nowrap;
  min-height: 34px;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.6rem;
  color: var(--primary);
}
.chat-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0 1rem;
  border: 1px solid var(--line);
  border-radius: 0.8rem;
  background: var(--bg);
  padding: 0.4rem;
}
.chat-form:focus-within {
  outline: 2px solid var(--primary);
  outline-offset: 1px;
}
.chat-form input {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  box-shadow: none;
  outline: none;
  padding: 0.5rem;
  font-size: 0.8rem;
  color: var(--ink);
}
.chat-form button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 0.6rem;
  background: var(--primary-action);
  color: white;
  font-size: 0.8rem;
}
.chat-form button:disabled {
  opacity: 0.4;
}
.chat-privacy {
  padding: 0.5rem 1rem 0.8rem;
  text-align: center;
  font-size: 0.55rem;
  color: var(--muted);
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 3px;
}
@media (max-width: 639px) {
  .search-launcher {
    padding: 0.8rem;
  }
  .search-launcher .launcher-label {
    display: none;
  }
  .search-launcher {
    width: 54px;
    height: 54px;
    padding: 8px;
    justify-content: center;
  }
  .search-launcher .launcher-status {
    display: none;
  }
  .search-chat {
    right: 0.5rem;
    bottom: max(0.5rem, env(safe-area-inset-bottom));
    width: calc(100vw - 1rem);
    height: min(620px, calc(100dvh - 1rem));
    border-radius: 1.1rem;
  }
  .chat-form input {
    font-size: 16px;
  }
}

.launcher-logo {
  display: block;
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  transition: transform 0.25s ease;
}
.launcher-label {
  letter-spacing: -0.02em;
}
.launcher-status {
  width: 6px;
  height: 6px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--primary-action);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent);
}
.search-launcher {
  transition:
    transform 0.25s,
    box-shadow 0.25s;
  animation: rio-launch 0.45s ease-out;
}
.search-launcher:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px color-mix(in srgb, var(--primary) 30%, transparent);
}
.search-launcher:hover .launcher-logo {
  transform: rotate(-9deg);
}
.search-chat[open] {
  animation: rio-open 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  transform-origin: bottom right;
}
.search-chat[open]::backdrop {
  animation: rio-backdrop 0.2s ease-out both;
}
.chat-message {
  animation: rio-message 0.2s ease-out both;
}
@keyframes rio-launch {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes rio-open {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes rio-backdrop {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes rio-message {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes rio-float {
  0%,
  100% {
    transform: translateY(0) rotate(-3deg);
  }
  50% {
    transform: translateY(-4px) rotate(3deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .search-launcher,
  .search-chat[open],
  .search-chat[open]::backdrop,
  .chat-message,
  .welcome-icon {
    animation: none;
  }
  .search-launcher,
  .launcher-logo {
    transition: none;
  }
  .search-launcher:hover,
  .search-launcher:hover .launcher-logo {
    transform: none;
  }
}
</style>
