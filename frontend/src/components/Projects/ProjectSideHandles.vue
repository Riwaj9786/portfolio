<script setup>
import { ref } from "vue";

defineProps({
   client: {
      type: String,
      default: "Project"
   },
   start_date: {
      type: String,
   },
   end_date: {
      type: String,
   },
   category: {
      type: String,
      required: true
   }
})

const formatDate = (dateString) => {
   if (!dateString) return '';
      try {
         const options = { year: 'numeric', month: 'short' };
         const date = new Date(dateString);
         if (isNaN(date.getTime())) return '';
         return date.toLocaleDateString(undefined, options);
      } catch (e) {
         return ''; 
      }
}
</script>

<template>
   <div class="gap gap-y-4">
      <div class="my-2">
         <p class="text-[var(--muted)]">Client: <span class="text-[var(--ink)]">{{ client ? client : "Project" }}</span> </p>
      </div>
      <div class="my-2">
         <p class="text-[var(--muted)]">Date:
            <span class="text-[var(--ink)]">
               {{ formatDate(start_date) }}
               <span v-if="start_date && end_date"> - </span>
               {{ formatDate(end_date) }}
            </span>
         </p>
      </div>
      <div class="my-2">
         <p class="text-[var(--muted)]">Category: <span class="text-[var(--ink)]">{{ category }}</span> </p>
      </div>
   </div>
</template>
