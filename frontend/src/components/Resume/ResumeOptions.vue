<script setup>
import { computed, ref } from 'vue';
import CvDialog from './CvDialog.vue';

const props = defineProps({ resume: { type: String, default: '' } });
const dialog = ref(null);
const cvDialog = ref(null);
const hasResume = computed(() => Boolean(props.resume && props.resume !== '#'));

function show() {
   dialog.value.showModal();
}
function generate() {
   dialog.value.close();
   cvDialog.value.show();
}
defineExpose({ show });
</script>

<template>
   <dialog ref="dialog" class="resume-options" aria-labelledby="resume-options-title" @click="($event.target === dialog) && dialog.close()">
      <header>
         <h2 id="resume-options-title">Resume</h2>
         <button type="button" class="resume-close" aria-label="Close resume options" @click="dialog.close()">
            <i class="pi pi-times" aria-hidden="true"></i>
         </button>
      </header>
      <div class="resume-choices">
         <a v-if="hasResume" :href="resume" target="_blank" rel="noopener noreferrer" class="resume-choice" @click="dialog.close()">
            <i class="pi pi-file-pdf" aria-hidden="true"></i>
            <span>View Resume</span>
         </a>
         <button v-else type="button" class="resume-choice" disabled>
            <i class="pi pi-file-pdf" aria-hidden="true"></i>
            <span>View Resume</span>
         </button>
         <button type="button" class="resume-choice" @click="generate">
            <i class="pi pi-file-edit" aria-hidden="true"></i>
            <span>Generate CV</span>
         </button>
      </div>
   </dialog>
   <CvDialog ref="cvDialog" />
</template>

<style scoped>
.resume-options { width: min(440px, calc(100% - 2rem)); max-width: none; margin: auto; padding: 1.25rem; border: 1px solid var(--line); border-radius: 24px; background: var(--surface-solid); color: var(--ink); box-shadow: 0 24px 80px #0005; }
.resume-options::backdrop { background: #09041999; backdrop-filter: blur(6px); }
header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
h2 { font-size: 1.5rem; font-weight: 700; }
.resume-close { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 50%; color: var(--muted); }
.resume-choices { display: grid; gap: .75rem; }
.resume-choice { display: flex; align-items: center; gap: .85rem; min-height: 64px; padding: 1rem; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); text-align: left; font-size: 1rem; font-weight: 600; }
.resume-choice > i { color: var(--primary); font-size: 1.25rem; }
.resume-choice:hover:not(:disabled) { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 7%, var(--surface)); }
button, a { cursor: pointer; }
button:disabled { opacity: .5; cursor: default; }
button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
</style>
