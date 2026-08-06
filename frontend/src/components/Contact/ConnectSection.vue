<script setup>
import { computed, onMounted, ref } from "vue";
import MediaLinks from "@/components/Home/Information/MediaLinks.vue";
import axiosInstance from "@/axios";

const data = ref({}),
  isLoading = ref(true),
  error = ref(null);
const email = "riwajbhurtel9786@gmail.com";
const whatsappUrl = computed(() =>
  data.value.whatsapp
    ? `https://wa.me/${data.value.whatsapp.replace(/\D/g, "")}`
    : "#",
);
const mapUrl = computed(() =>
  data.value.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.value.address)}`
    : "#",
);
onMounted(async () => {
  try {
    data.value =
      (await axiosInstance.get("contact/information/")).data[0] || {};
  } catch (_) {
    error.value = "Contact details are unavailable.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <aside
    class="surface relative flex flex-col overflow-hidden p-3 sm:min-h-[620px] sm:p-5"
  >
    <div
      v-if="isLoading"
      class="h-[480px] animate-pulse rounded-[1.3rem] bg-purple-500/10 sm:min-h-[580px]"
    ></div>
    <div
      v-else-if="error"
      class="grid flex-1 place-items-center p-8 text-center text-sm text-red-400"
    >
      {{ error }}
    </div>
    <template v-else>
      <div
        class="relative h-52 overflow-hidden rounded-[1.3rem] bg-gradient-to-br from-violet-500 to-fuchsia-500 sm:h-64"
      >
        <img
          v-if="data.contact_banner"
          :src="data.contact_banner"
          alt="Contact Riwaj Bhurtel"
          class="h-full w-full object-cover mix-blend-luminosity transition duration-700 hover:scale-105"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-purple-900/20 to-transparent"
        ></div>
        <div class="absolute bottom-5 left-5 right-5 text-white">
          <p
            class="text-[10px] font-bold uppercase tracking-[.18em] text-purple-200"
          >
            Currently in
          </p>
          <p class="mt-1 text-xl font-bold">
            {{ data.address || "Kathmandu, Nepal" }}
          </p>
        </div>
      </div>

      <div class="flex flex-1 flex-col px-2 pb-2 pt-7">
        <p
          class="text-xs font-bold uppercase tracking-[.18em] text-[var(--primary)]"
        >
          Direct channels
        </p>
        <div class="mt-4 divide-y divide-[var(--line)]">
          <a :href="`mailto:${email}`" class="contact-channel group"
            ><span class="contact-channel-icon"
              ><i class="pi pi-envelope"></i></span
            ><span
              ><small>Email</small><strong>{{ email }}</strong></span
            ><i
              class="pi pi-arrow-up-right ml-auto text-xs text-[var(--muted)] group-hover:text-[var(--primary)]"
            ></i
          ></a>
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener"
            class="contact-channel group"
            ><span class="contact-channel-icon"
              ><i class="pi pi-whatsapp"></i></span
            ><span
              ><small>WhatsApp</small
              ><strong>{{ data.whatsapp || "Message me" }}</strong></span
            ><i
              class="pi pi-arrow-up-right ml-auto text-xs text-[var(--muted)] group-hover:text-[var(--primary)]"
            ></i
          ></a>
          <a
            :href="mapUrl"
            target="_blank"
            rel="noopener"
            class="contact-channel group"
            ><span class="contact-channel-icon"
              ><i class="pi pi-map-marker"></i></span
            ><span
              ><small>Location</small
              ><strong>{{ data.address || "Kathmandu, Nepal" }}</strong></span
            ><i
              class="pi pi-arrow-up-right ml-auto text-xs text-[var(--muted)] group-hover:text-[var(--primary)]"
            ></i
          ></a>
        </div>
      </div>
    </template>
  </aside>
</template>
