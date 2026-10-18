<template>
  <svg class="askrio-mark" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <g class="bot-antenna"><path d="M32 15V9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle class="antenna-light" cx="32" cy="7" r="4" fill="currentColor"/></g>
    <rect x="4" y="28" width="7" height="15" rx="3.5" fill="currentColor" opacity=".55"/>
    <rect x="53" y="28" width="7" height="15" rx="3.5" fill="currentColor" opacity=".55"/>
    <path d="M10 28C10 20.82 15.82 15 23 15H41C48.18 15 54 20.82 54 28V41C54 48.18 48.18 54 41 54H26L17 60V52.55C12.84 50.38 10 46.02 10 41V28Z" fill="currentColor"/>
    <rect class="bot-visor" x="16" y="23" width="32" height="22" rx="9"/>
    <g class="bot-eyes"><rect x="23" y="29" width="5" height="7" rx="2.5" fill="#fff"/><rect x="36" y="29" width="5" height="7" rx="2.5" fill="#fff"/></g>
    <path d="M28 40C30 41.6 34 41.6 36 40" stroke="#fff" stroke-width="1.7" stroke-linecap="round" opacity=".85"/>
    <path d="M46 17L48 12L50 17L55 19L50 21L48 26L46 21L41 19L46 17Z" class="bot-spark"/>
  </svg>
</template>

<style scoped>
.askrio-mark { display:block;width:100%;height:100%;overflow:visible;color:var(--primary); }
.bot-visor { fill:color-mix(in srgb,var(--primary) 25%,#171026); }
.bot-spark { fill:var(--primary-bright);stroke:var(--surface-solid);stroke-width:1.5; }
.bot-eyes { transform-box:fill-box;transform-origin:center;animation:rio-blink 6.5s ease-in-out infinite; }
.antenna-light { animation:rio-signal 3.5s ease-in-out infinite; }
@keyframes rio-blink { 0%,43%,47%,100% { transform:scaleY(1); }45% { transform:scaleY(.12); } }
@keyframes rio-signal { 0%,100% { opacity:1; }50% { opacity:.45; } }
@media(prefers-reduced-motion:reduce) { .bot-eyes,.antenna-light { animation:none; } }
</style>
