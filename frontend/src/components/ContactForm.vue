<script setup>

</script>

<template>
   <div class="flex flex-col border border-white md:m-2 p-2 md:p-8 rounded-xl">
      <div class="w-full text-4xl text-white font-bold pt-8 pb-4">
         Get in Touch:
      </div>
      <hr class="text-white">
      <div class="w-full">
         <input type="text" class="mt-10 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Name">
      </div>
      <div class="w-full">
         <input type="text" class="mt-10 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Email Address">
      </div>
      <div class="w-full">
         <textarea type="text" class="my-10 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Message" rows="8"></textarea>
      </div>
      <div>
         <button class="text-white font-bold px-8 py-2 border border-gray-500 hover:bg-cyan-500 rounded-xl">Submit</button>
      </div>
   </div>
</template>