<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import content from 'virtual:portfolio-content';
import { createCvSelection, getCvSelectionGroups, updateCvSelection } from '@/cvSelection.mjs';
import { plainText } from '@/portfolioSearch.mjs';
import CvContentGroup from './CvContentGroup.vue';

const dialog = ref(null);
const panel = ref(null);
const tabButtons = ref([]);
const groups = getCvSelectionGroups(content);
const groupById = Object.fromEntries(groups.map((group) => [group.id, group]));
const selection = ref(createCvSelection(content));
const activeTab = ref('profile');
const experienceCategory = ref(groupById.work ? 'work' : 'leadership');
const useCustomSummary = ref(false);
const profile = content['account.user']?.[0] || {};
const customTitle = ref(profile.title || '');
const contact = content['contact.contactinformation']?.[0] || {};
const websiteSummary = String(profile.description || profile.short_bio || '')
   .split(/<\/p\s*>|<br\s*\/?\s*>/gi).map((value) => plainText(value)).filter(Boolean).join('\n\n');
const customSummary = ref(websiteSummary);
const includeSkillCategories = ref(true);
const generating = ref(false);
const error = ref('');
const previewUrls = [];
const selectedCount = (groupId) => selection.value[groupId]?.length || 0;
const hasSelection = computed(() => groups.some((group) => selectedCount(group.id)));
const summaryIncluded = computed(() => Boolean(selectedCount('summary')));
const summaryInvalid = computed(() => summaryIncluded.value && useCustomSummary.value && !customSummary.value.trim());
const summaryText = computed(() => useCustomSummary.value ? customSummary.value : websiteSummary);
const selectedGroups = computed(() => groups.filter((group) => selectedCount(group.id)));
const experienceGroup = computed(() => groupById[experienceCategory.value]);
const experienceGroups = groups.filter((group) => ['work', 'leadership'].includes(group.id));
const contactLines = [contact.email, contact.whatsapp, contact.address].filter(Boolean);
const socialLabels = (content['account.medialinks'] || []).filter((link) => ['lkin', 'gh'].includes(link.platform_name))
   .map((link) => link.platform_name === 'lkin' ? 'LinkedIn' : 'GitHub');
const sections = [
   { id: 'profile', label: 'Profile', icon: 'pi-user', description: 'Personal details and professional summary', groups: ['contact', 'summary'] },
   { id: 'skills', label: 'Skills', icon: 'pi-th-large', description: 'Choose the skills that fit the opportunity.', groups: ['skills'] },
   { id: 'experience', label: 'Experience', icon: 'pi-briefcase', description: 'Choose your professional and leadership positions.', groups: ['work', 'leadership'] },
   { id: 'education', label: 'Academic', title: 'Academic Qualifications', icon: 'pi-graduation-cap', description: 'Choose the academic qualifications to include in your CV.', groups: ['education'] },
   { id: 'projects', label: 'Projects', icon: 'pi-folder', description: 'Choose projects that demonstrate your work.', groups: ['projects'] },
   { id: 'certifications', label: 'Certifications', icon: 'pi-verified', description: 'Include relevant courses and credentials.', groups: ['certifications'] },
   { id: 'review', label: 'Review', icon: 'pi-check-square', description: 'Check the content before opening your PDF.', groups: [] },
].filter((section) => ['profile', 'review'].includes(section.id) || section.groups.some((id) => groupById[id]));
const currentSection = computed(() => sections.find((section) => section.id === activeTab.value));
const sectionCount = (section) => section.groups.reduce((sum, id) => sum + selectedCount(id), 0);
const sectionTotal = (section) => section.groups.reduce((sum, id) => sum + (groupById[id]?.items.length || 0), 0);
const selectedItems = (group) => group.items.filter((item) => selection.value[group.id]?.includes(item.id));
const selectedOrganizations = (group) => (group.organizations || []).filter((organization) => organization.itemIds.some((id) => selection.value[group.id]?.includes(id)));

function setItems(groupId, itemIds, checked) {
   selection.value = updateCvSelection(selection.value, groupId, itemIds, checked);
}
function setGroup(groupId, checked) {
   selection.value[groupId] = checked ? groupById[groupId].items.map((item) => item.id) : [];
}
function setAll(checked) {
   groups.forEach((group) => setGroup(group.id, checked));
}
function show() {
   error.value = '';
   activeTab.value = 'profile';
   dialog.value.showModal();
}
function close() {
   if (!generating.value) dialog.value.close();
}
function handleCancel(event) {
   if (generating.value) event.preventDefault();
}
function handleTabKey(event, index) {
   const direction = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
   let next;
   if (direction) next = (index + direction + sections.length) % sections.length;
   else if (event.key === 'Home') next = 0;
   else if (event.key === 'End') next = sections.length - 1;
   else return;
   event.preventDefault();
   activeTab.value = sections[next].id;
   tabButtons.value[next]?.focus();
}
function handleExperienceKey(event, index) {
   if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
   event.preventDefault();
   const next = event.key === 'Home' ? 0 : event.key === 'End' ? experienceGroups.length - 1 : (index + 1) % experienceGroups.length;
   experienceCategory.value = experienceGroups[next].id;
   event.currentTarget.parentElement.querySelectorAll('button')[next]?.focus();
}
async function editGroup(groupId) {
   const section = sections.find((section) => section.groups.includes(groupId));
   if (!section) return;
   if (['work', 'leadership'].includes(groupId)) experienceCategory.value = groupId;
   activeTab.value = section.id;
   await nextTick();
   panel.value?.focus();
}
watch(activeTab, async () => {
   await nextTick();
   if (panel.value) panel.value.scrollTop = 0;
   tabButtons.value[sections.findIndex((section) => section.id === activeTab.value)]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
});

async function openPdf() {
   if (generating.value || !hasSelection.value || summaryInvalid.value) return;
   error.value = '';
   const preview = window.open('about:blank', '_blank');
   if (!preview) {
      error.value = 'Please allow pop-ups for this site, then try opening the PDF again.';
      return;
   }
   preview.opener = null;
   generating.value = true;
   let url;
   try {
      const { createCvUrl } = await import('@/generateCv.mjs');
      url = createCvUrl(content, selection.value, {
         title: customTitle.value,
         ...(useCustomSummary.value ? { summary: customSummary.value } : {}),
         includeSkillCategories: includeSkillCategories.value,
      });
      if (preview.closed) throw new Error('The PDF tab was closed before generation completed.');
      preview.location.replace(url);
      previewUrls.push(url);
      dialog.value.close();
   } catch (cause) {
      if (url) URL.revokeObjectURL(url);
      if (!preview.closed) preview.close();
      console.error('CV generation failed:', cause);
      error.value = 'Could not open the CV. Please try again.';
   } finally {
      generating.value = false;
   }
}

onBeforeUnmount(() => previewUrls.forEach((url) => URL.revokeObjectURL(url)));
defineExpose({ show });
</script>

<template>
   <dialog ref="dialog" class="cv-dialog" aria-labelledby="cv-dialog-title" aria-describedby="cv-dialog-description" @cancel="handleCancel" @click="($event.target === dialog) && close()">
      <form class="cv-form" :aria-busy="generating" @submit.prevent="openPdf">
         <header class="cv-dialog-header">
            <span class="cv-header-icon" aria-hidden="true"><i class="pi pi-file-edit"></i></span>
            <div>
               <h2 id="cv-dialog-title">Build your CV</h2>
               <p id="cv-dialog-description">Choose the details that fit your next opportunity.</p>
            </div>
            <button type="button" class="cv-close" aria-label="Close CV options" :disabled="generating" @click="close"><i class="pi pi-times" aria-hidden="true"></i></button>
         </header>

         <div class="cv-workspace">
            <aside class="cv-sidebar">
               <div class="cv-sidebar-heading">Your content</div>
               <div class="cv-section-tabs" role="tablist" aria-label="CV sections">
                  <button
                     v-for="(section, index) in sections" :id="`cv-tab-${section.id}`" :key="section.id" ref="tabButtons"
                     type="button" role="tab" :aria-selected="activeTab === section.id" :aria-controls="`cv-panel-${section.id}`"
                     :tabindex="activeTab === section.id ? 0 : -1" :disabled="generating" :class="{ 'is-active': activeTab === section.id }"
                     @click="activeTab = section.id" @keydown="handleTabKey($event, index)"
                  >
                     <i class="pi" :class="section.icon" aria-hidden="true"></i>
                     <span><strong>{{ section.label }}</strong><small>{{ section.id === 'review' ? `${selectedGroups.length} sections included` : `${sectionCount(section)} of ${sectionTotal(section)} selected` }}</small></span>
                  </button>
               </div>
               <div class="cv-sidebar-note"><i class="pi pi-file-pdf" aria-hidden="true"></i><span>Opens as a PDF in a new tab</span></div>
            </aside>

            <div :id="`cv-panel-${activeTab}`" ref="panel" class="cv-panel" role="tabpanel" :aria-labelledby="`cv-tab-${activeTab}`" tabindex="0">
               <header class="cv-panel-header">
                  <h3>{{ currentSection.label === 'Profile' ? 'Make it personal' : currentSection.label === 'Review' ? 'Review your CV' : currentSection.title || currentSection.label }}</h3>
                  <p>{{ currentSection.description }}</p>
               </header>

               <fieldset v-if="activeTab === 'profile'" class="cv-profile" :disabled="generating">
                  <legend class="sr-only">Profile options</legend>
                  <div class="cv-identity">
                     <span class="cv-avatar" aria-hidden="true"><i class="pi pi-user"></i></span>
                     <div>
                        <strong>{{ profile.name }}</strong>
                        <label for="cv-custom-title" class="cv-title-label">Professional title</label>
                        <input id="cv-custom-title" v-model="customTitle" class="cv-title-input" type="text" aria-describedby="cv-title-help" />
                        <p id="cv-title-help" class="cv-field-help">Edit for this CV only. Your website title stays the same.</p>
                     </div>
                     <span class="cv-included-badge">Always included</span>
                  </div>
                  <section class="cv-setting-card">
                     <label class="cv-setting-title"><input type="checkbox" :checked="Boolean(selectedCount('contact'))" @change="setGroup('contact', $event.target.checked)" /><span><strong>Contact details & social links</strong><small>Let readers know how to reach you.</small></span></label>
                     <div v-if="selectedCount('contact')" class="cv-contact-preview"><span v-for="line in contactLines" :key="line">{{ line }}</span></div>
                  </section>
                  <section class="cv-setting-card">
                     <label class="cv-setting-title"><input type="checkbox" :checked="summaryIncluded" @change="setGroup('summary', $event.target.checked)" /><span><strong>Professional summary</strong><small>A brief introduction to your experience and strengths.</small></span></label>
                     <div v-if="summaryIncluded" class="cv-summary-options">
                        <fieldset class="cv-summary-source"><legend>Summary source</legend><label><input v-model="useCustomSummary" type="radio" name="cv-summary-source" :value="false" />Website summary</label><label><input v-model="useCustomSummary" type="radio" name="cv-summary-source" :value="true" />Write my own</label></fieldset>
                        <template v-if="useCustomSummary">
                           <label for="cv-custom-summary" class="cv-field-label">Your professional summary</label>
                           <textarea id="cv-custom-summary" v-model="customSummary" rows="6" required :aria-invalid="summaryInvalid" aria-describedby="cv-summary-help"></textarea>
                           <p id="cv-summary-help" class="cv-field-help">Used only in this CV. Your website summary stays the same.</p>
                           <p v-if="summaryInvalid" class="cv-error">Enter a summary, or choose the website summary.</p>
                           <button type="button" class="cv-text-button" @click="customSummary = websiteSummary">Reset to website summary</button>
                        </template>
                        <p v-else class="cv-summary-preview">{{ websiteSummary || 'Choose “Write my own” to add a summary.' }}</p>
                     </div>
                  </section>
               </fieldset>

               <template v-else-if="activeTab === 'skills'">
                  <label class="cv-table-option"><input v-model="includeSkillCategories" type="checkbox" :disabled="generating" /><span><strong>Show category names in the skills table</strong><small>Uncheck to show skill names only.</small></span></label>
                  <CvContentGroup :group="groupById.skills" :selected="selection.skills" :disabled="generating" @change="(ids, checked) => setItems('skills', ids, checked)" />
               </template>

               <template v-else-if="activeTab === 'experience'">
                  <div class="cv-experience-tabs" role="tablist" aria-label="Experience type">
                     <button v-for="(group, index) in experienceGroups" :id="`cv-experience-${group.id}`" :key="group.id" type="button" role="tab" :aria-selected="experienceCategory === group.id" :aria-controls="`cv-experience-panel-${group.id}`" :tabindex="experienceCategory === group.id ? 0 : -1" :disabled="generating" @click="experienceCategory = group.id" @keydown="handleExperienceKey($event, index)">{{ group.id === 'work' ? 'Professional' : 'Leadership' }}<span>{{ selectedCount(group.id) }}</span></button>
                  </div>
                  <div :id="`cv-experience-panel-${experienceGroup.id}`" role="tabpanel" :aria-labelledby="`cv-experience-${experienceGroup.id}`">
                     <CvContentGroup :key="experienceGroup.id" :group="experienceGroup" :selected="selection[experienceGroup.id]" :disabled="generating" @change="(ids, checked) => setItems(experienceGroup.id, ids, checked)" />
                  </div>
               </template>

               <CvContentGroup v-else-if="['education', 'projects', 'certifications'].includes(activeTab)" :key="activeTab" :group="groupById[activeTab]" :selected="selection[activeTab]" :disabled="generating" @change="(ids, checked) => setItems(activeTab, ids, checked)" />

               <div v-else-if="activeTab === 'review'" class="cv-review">
                  <div class="cv-review-identity"><strong>{{ profile.name }}</strong><p>{{ customTitle.trim() }}</p><button type="button" class="cv-text-button" :disabled="generating" @click="editGroup('contact')">Edit profile</button></div>
                  <div class="cv-review-toolbar"><span>{{ selectedGroups.length }} sections included</span><div><button type="button" :disabled="generating" @click="setAll(true)">Select all content</button><button type="button" :disabled="generating" @click="setAll(false)">Clear all</button></div></div>
                  <p v-if="!hasSelection" class="cv-empty-review">Choose at least one section to include in your CV.</p>
                  <section v-for="group in selectedGroups" :key="group.id" class="cv-review-section">
                     <header><h4>{{ group.label }}</h4><button type="button" :disabled="generating" :aria-label="`Edit ${group.label}`" @click="editGroup(group.id)">Edit</button></header>
                     <div v-if="group.id === 'contact'" class="cv-contact-preview"><span v-for="line in contactLines" :key="line">{{ line }}</span><span v-if="socialLabels.length">{{ socialLabels.join(' & ') }}</span></div>
                     <p v-else-if="group.id === 'summary'" :class="summaryInvalid ? 'cv-error' : 'cv-summary-preview'">{{ summaryInvalid ? 'Enter your custom summary before opening the PDF.' : summaryText }}</p>
                     <template v-else-if="group.organizations"><div v-for="organization in selectedOrganizations(group)" :key="organization.id" class="cv-review-organization"><h5>{{ organization.label }}</h5><ul><li v-for="item in organization.items.filter((item) => selection[group.id].includes(item.id))" :key="item.id">{{ item.label }}</li></ul></div></template>
                     <ul v-else><li v-for="item in selectedItems(group)" :key="item.id">{{ item.label }}<small v-if="item.detail">{{ item.detail }}</small></li></ul>
                  </section>
               </div>
            </div>
         </div>

         <footer class="cv-dialog-footer">
            <p v-if="error" class="cv-error" role="alert">{{ error }}</p>
            <div class="cv-footer-row">
               <span class="cv-footer-count">{{ selectedGroups.length }} sections included</span>
               <div class="cv-dialog-actions">
                  <button v-if="activeTab !== 'review'" type="button" class="cv-secondary" :disabled="generating" @click="activeTab = 'review'">Review selection</button>
                  <button v-else type="button" class="cv-secondary" :disabled="generating" @click="close">Cancel</button>
                  <button type="submit" class="cv-open" :disabled="generating || !hasSelection || summaryInvalid" :title="summaryInvalid ? 'Add your custom summary in Profile to open the PDF.' : undefined"><i :class="generating ? 'pi pi-spin pi-spinner' : 'pi pi-file-pdf'" aria-hidden="true"></i>{{ generating ? 'Generating…' : 'Open PDF' }}</button>
               </div>
            </div>
         </footer>
      </form>
   </dialog>
</template>

<style scoped>
.cv-dialog { width: min(1060px, calc(100% - 2rem)); max-width: none; max-height: calc(100dvh - 2rem); margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 24px; background: var(--surface-solid); color: var(--ink); box-shadow: 0 24px 90px #0005; }
.cv-dialog::backdrop { background: #09041999; backdrop-filter: blur(6px); }
.cv-form { display: flex; flex-direction: column; height: min(820px, calc(100dvh - 2rem)); }
.cv-dialog-header { display: flex; flex-shrink: 0; align-items: center; gap: 1rem; padding: 1.35rem 1.75rem; border-bottom: 1px solid var(--line); }
.cv-header-icon { display: grid; flex-shrink: 0; place-items: center; width: 46px; height: 46px; border: 1px solid var(--line); border-radius: 14px; background: color-mix(in srgb, var(--primary) 9%, transparent); color: var(--primary); font-size: 1.25rem; }
.cv-dialog-header h2 { margin: 0; font-size: 1.4rem; font-weight: 700; line-height: 1.4; }
.cv-dialog-header p { margin-top: .2rem; font-size: .875rem; line-height: 1.6; color: var(--muted); }
.cv-close { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; margin-left: auto; border: 1px solid var(--line); border-radius: 50%; color: var(--muted); }
.cv-workspace { display: flex; flex: 1; min-height: 0; }
.cv-sidebar { display: flex; flex: 0 0 218px; flex-direction: column; gap: .85rem; overflow-y: auto; padding: 1.5rem .85rem; border-right: 1px solid var(--line); background: color-mix(in srgb, var(--primary) 3%, var(--surface-solid)); }
.cv-sidebar-heading { padding: 0 .85rem; font-size: .75rem; font-weight: 700; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.cv-section-tabs { display: flex; flex-direction: column; gap: .35rem; }
.cv-section-tabs button { display: flex; align-items: center; gap: .85rem; min-height: 64px; padding: .75rem .85rem; border: 1px solid transparent; border-radius: 12px; text-align: left; color: var(--muted); }
.cv-section-tabs button > i { font-size: 1rem; }
.cv-section-tabs strong { display: block; font-size: .875rem; font-weight: 600; }
.cv-section-tabs small { display: block; margin-top: .25rem; font-size: .75rem; font-weight: 400; }
.cv-section-tabs button.is-active { border-color: color-mix(in srgb, var(--primary) 25%, var(--line)); background: var(--surface-solid); color: var(--primary); box-shadow: 0 3px 12px #00000005; }
.cv-section-tabs button:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 6%, var(--surface-solid)); }
.cv-sidebar-note { display: flex; align-items: center; gap: .65rem; margin: auto .5rem 0; padding-top: 1.5rem; color: var(--muted); font-size: .75rem; line-height: 1.6; }
.cv-panel { flex: 1; min-width: 0; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 1.75rem 2rem; }
.cv-panel:focus-visible { outline: 2px solid var(--primary); outline-offset: -4px; }
.cv-panel-header { margin-bottom: 1.5rem; }
.cv-panel-header h3 { font-size: 1.5rem; font-weight: 700; letter-spacing: -.025em; }
.cv-panel-header p { margin-top: .4rem; color: var(--muted); font-size: .875rem; line-height: 1.7; }
.cv-profile, .cv-summary-source { min-width: 0; margin: 0; padding: 0; border: 0; }
.cv-identity { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .85rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--line); }
.cv-avatar { display: grid; flex-shrink: 0; place-items: center; width: 42px; height: 42px; background: color-mix(in srgb, var(--primary) 9%, transparent); border-radius: 12px; color: var(--primary); }
.cv-identity > div { flex: 1; min-width: 160px; }
.cv-identity strong, .cv-review-identity strong { font-size: 1rem; font-weight: 700; }
.cv-title-label { display: block; margin: .9rem 0 .5rem; font-size: .875rem; font-weight: 600; }
.cv-title-input { display: block; width: 100%; min-height: 44px; padding: .65rem .75rem; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-solid); color: var(--ink); font: inherit; font-size: 1rem; }
.cv-identity p, .cv-review-identity p { margin-top: .3rem; color: var(--muted); font-size: .8125rem; line-height: 1.6; }
.cv-included-badge { padding: .3rem .6rem; border: 1px solid var(--line); border-radius: 999px; font-size: .75rem; color: var(--muted); white-space: nowrap; }
.cv-setting-card { margin-top: 1rem; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.cv-setting-title { display: flex; gap: .8rem; padding: 1rem; cursor: pointer; }
.cv-setting-title strong, .cv-table-option strong { display: block; font-size: .875rem; font-weight: 600; line-height: 1.5; }
.cv-setting-title small, .cv-table-option small { display: block; margin-top: .25rem; color: var(--muted); font-size: .8125rem; line-height: 1.6; }
.cv-contact-preview { display: grid; gap: .35rem; padding: 0 1rem 1rem 2.95rem; color: var(--muted); font-size: .8125rem; line-height: 1.6; overflow-wrap: anywhere; }
.cv-summary-options { padding: 1rem; border-top: 1px solid var(--line); }
.cv-summary-source { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
.cv-summary-source legend { margin-bottom: .75rem; font-size: .8125rem; font-weight: 600; }
.cv-summary-source label { display: flex; align-items: center; gap: .5rem; min-height: 44px; font-size: .875rem; cursor: pointer; }
.cv-summary-preview { white-space: pre-line; font-size: .875rem; line-height: 1.8; color: var(--muted); }
.cv-field-label { display: block; margin-bottom: .5rem; font-size: .875rem; font-weight: 600; }
textarea { display: block; width: 100%; min-height: 140px; padding: .85rem; border: 1px solid var(--line); border-radius: 10px; background: var(--surface-solid); color: var(--ink); font: inherit; font-size: 1rem; line-height: 1.7; resize: vertical; }
.cv-field-help { margin-top: .5rem; color: var(--muted); font-size: .8125rem; line-height: 1.6; }
.cv-text-button { margin-top: .5rem; min-height: 44px; color: var(--primary); font-size: .8125rem; font-weight: 600; }
.cv-table-option { display: flex; gap: .75rem; padding: 1rem; margin-bottom: 1.5rem; border: 1px solid var(--line); border-radius: 12px; cursor: pointer; }
input[type='checkbox'], input[type='radio'] { flex: 0 0 18px; width: 18px; height: 18px; margin: .15rem 0 0; accent-color: var(--primary); cursor: pointer; }
.cv-experience-tabs { display: flex; gap: .3rem; margin-bottom: 1.5rem; padding: .3rem; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); }
.cv-experience-tabs button { display: flex; align-items: center; justify-content: center; gap: .6rem; flex: 1; min-height: 44px; padding: .5rem; border-radius: 8px; color: var(--muted); font-size: .875rem; font-weight: 600; }
.cv-experience-tabs button[aria-selected='true'] { background: var(--primary-action); color: white; }
.cv-experience-tabs span { font-size: .75rem; font-weight: 400; }
.cv-review-identity { padding-bottom: 1rem; border-bottom: 1px solid var(--line); }
.cv-review-toolbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .75rem; margin: 1rem 0; font-size: .8125rem; color: var(--muted); }
.cv-review-toolbar > div { display: flex; gap: 1rem; }
.cv-review-toolbar button, .cv-review-section header button { min-height: 44px; color: var(--primary); font-size: .8125rem; font-weight: 600; }
.cv-review-section { padding: 1rem 0; border-top: 1px solid var(--line); }
.cv-review-section header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.cv-review-section h4 { font-size: .9375rem; font-weight: 600; }
.cv-review-section ul { margin: .5rem 0 0; padding-left: 1.2rem; list-style: disc; font-size: .875rem; line-height: 1.8; color: var(--muted); }
.cv-review-section li small { display: block; margin-bottom: .5rem; font-size: .8125rem; line-height: 1.7; }
.cv-review-section .cv-contact-preview { padding: .5rem 0; }
.cv-review-organization { margin: .75rem 0; }
.cv-review-organization h5 { font-size: .875rem; font-weight: 600; }
.cv-empty-review { padding: 2rem 0; color: var(--muted); font-size: .875rem; line-height: 1.8; }
.cv-dialog-footer { flex-shrink: 0; padding: 1rem 1.75rem; border-top: 1px solid var(--line); }
.cv-footer-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.cv-footer-count { color: var(--muted); font-size: .8125rem; }
.cv-dialog-actions { display: flex; gap: .6rem; }
.cv-secondary, .cv-open { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; min-height: 44px; padding: .7rem 1.1rem; border: 1px solid var(--line); border-radius: 999px; font-size: .875rem; font-weight: 600; }
.cv-open { border-color: transparent; background: var(--primary-action); color: white; }
.cv-error { margin: .5rem 0; color: #dc2626; font-size: .875rem; line-height: 1.6; }
button { cursor: pointer; }
button:disabled { opacity: .55; cursor: default; }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
@media (max-width: 760px) {
   .cv-form { height: calc(100dvh - 1rem); }
   .cv-dialog { width: calc(100% - 1rem); max-height: calc(100dvh - 1rem); border-radius: 20px; }
   .cv-dialog-header { gap: .75rem; padding: 1rem; }
   .cv-header-icon { display: none; }
   .cv-dialog-header h2 { font-size: 1.25rem; }
   .cv-dialog-header p { font-size: .8125rem; }
   .cv-workspace { flex-direction: column; }
   .cv-sidebar { display: block; flex: 0 0 auto; overflow: hidden; padding: .5rem; border-right: 0; border-bottom: 1px solid var(--line); }
   .cv-sidebar-heading, .cv-sidebar-note { display: none; }
   .cv-section-tabs { flex-direction: row; overflow-x: auto; padding: .2rem; gap: .25rem; }
   .cv-section-tabs button { flex-shrink: 0; min-height: 44px; padding: .6rem .8rem; gap: .5rem; }
   .cv-section-tabs button > i { font-size: .875rem; }
   .cv-section-tabs small { display: none; }
   .cv-panel { padding: 1.25rem 1rem; }
   .cv-panel-header h3 { font-size: 1.25rem; }
   .cv-panel-header { margin-bottom: 1.25rem; }
   .cv-dialog-footer { padding: .85rem 1rem; }
   .cv-footer-row { flex-wrap: wrap; gap: .6rem; }
   .cv-footer-count { display: none; }
   .cv-dialog-actions { width: 100%; }
   .cv-dialog-actions > button { flex: 1; padding: .7rem .6rem; font-size: .8125rem; }
   .cv-included-badge { margin-left: 3.5rem; }
}
@media (prefers-reduced-motion: reduce) { .pi-spin { animation: none; } }
</style>
