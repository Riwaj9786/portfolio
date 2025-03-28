<script setup>
import Information from './Information.vue';
import MediaLinks from './MediaLinks.vue';
</script>

<template>
   <div class="flex flex-col justify-between md:m-2 bg-white/5 rounded-xl p-6 md:p-8 h-full">
      <div>
         <div class="text-4xl font-bold text-white pt-8 pb-4">
            Connect
         </div>
         <hr class="text-white">
      </div>
      <div class="flex flex-col flex-grow mt-4">
         <div class="flex text-gray-300 text-xl mb-6 flex-grow">
            <div class="flex flex-col w-full justify-end text-xs md:text-lg md:text-left">
               <div class="hidden xl:block bg-gray-500 w-full h-full rounded-xl"></div>
               <div class="my-2">
                  <i class="pi pi-whatsapp px-2"></i>
                  +977 9869146101
               </div>
               <div class="my-2">
                  <i class="pi pi-map-marker px-2"></i>
                  Pokhara, Gandaki, Nepal
               </div>
               <div class="my-2">
                  <i class="pi pi-envelope px-2"></i>
                  riwajbhurtel9786@gmail.com
               </div>
            </div>
         </div>
         <div class="flex flex-row md:border mt-4 md:p-4 items-center justify-between md:border-cyan-500 rounded-xl">
            <div class="text-white text-sm hidden md:block">Connect with me:</div>
            <MediaLinks/>
         </div>
      </div>
   </div>
</template>
