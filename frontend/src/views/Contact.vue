<script setup>
import NavBar from '@/components/NavBar/NavBar.vue';
import FooterComponent from '@/components/Footer/FooterComponent.vue';
import ContactForm from '@/components/Contact/ContactForm.vue';
import ConnectSection from '@/components/Contact/ConnectSection.vue';
</script>

<template>
   <div class="flex flex-col">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 m-6 lg:px-6">
         <div class="flex">
            <div class="w-full h-full flex items-stretch">
               <ConnectSection class="w-full h-full p-6 border rounded-xl shadow-lg"/>
            </div>
         </div>
         <div class="flex">
            <div class="w-full h-full flex items-stretch">
               <ContactForm class="w-full h-full p-6 border rounded-xl shadow-lg"/>
            </div>
         </div>
      </div>
   </div>
</template>

