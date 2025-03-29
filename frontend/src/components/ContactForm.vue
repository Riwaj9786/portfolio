<script setup>
import axios from 'axios';
import axiosInstance from '@/axios';

import { ref } from 'vue';

const loading = ref(false);
const msg = ref("");
const msgClass = ref("");

const formData = ref({
   name: "",
   email: "",
   message: ""
});

const submitForm = async () => {
   loading.value = true;
   msg.value = "";
   msgClass.value = "";

   try{
      const response = await axiosInstance.post("/contact/message/create/", formData.value);

      if (response.status === 200 || response.status === 201) {
         msg.value = "Form Submitted successfully!";
         msgClass.value = "bg-green-300"

         formData.value = {
            name: "",
            email: "",
            message: ""
         };
      } else {
         msg.value = "Failed to Submit Form."
         msgClass.value = "bg-red-300"
      }

   } catch (error) {
      console.error("Error submitting Form:", error);
      msg.value = "Failed to Submit Form.";
      msgClass.value = "bg-red-500/50"
   } finally {
      loading.value = false
   }
}
</script>

<template>
   <div class="flex flex-col border border-white md:m-2 p-2 md:p-8 rounded-xl">
      <div class="w-full text-4xl text-white font-bold pt-8 pb-4">
         Get in Touch:
      </div>
      <hr class="text-white">
      <p v-if="msg" class="mt-3 text-gray-500 rounded-xl px-4 py-2" :class="msgClass">{{ msg }}</p>
      <form @submit.prevent="submitForm">
         <div class="w-full">
            <input type="text" v-model="formData.name" class="form-control mt-4 md:mt-8 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Name">
         </div>
         <div class="w-full">
            <input type="text" v-model="formData.email" class="form-control mt-4 md:mt-8 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Email Address">
         </div>
         <div class="w-full">
            <textarea type="text" v-model="formData.message" class="form-control my-4 md:my-8 w-full p-4 border border-gray-500 text-white rounded-xl" placeholder="Your Message" rows="8"></textarea>
         </div>
         <div>
            <button type="submit" class="text-white font-bold px-8 py-2 border border-gray-500 hover:bg-cyan-500 rounded-xl" :disabled="loading">
               {{ loading ? "Submitting..." : "Submit" }}
            </button>
         </div>
      </form>
   </div>
</template>