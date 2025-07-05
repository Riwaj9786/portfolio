<script setup>
const props = defineProps({
   title: {
      type: String,
      default: 'Title of Blog',
   },
   content: {
      type: String,
      default: 'Content of the blog goes here.',
   },
   banner_image: {
      type: [String, File],
      required: false,
   },
   published_at: {
      type: [String, Date],
      required: true,
   },
   slug: {
      type: String,
      required: true,
   },
});

const formatDate = (dateString) => {
   if (!dateString) return '';
   try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString(undefined, options);
   } catch (e) {
      return '';
   }
};

const contentTruncated = (content, length = 70) => {
   if (!content) return '';
   return content.length > length ? content.substring(0, length) + '...' : content;
};
</script>

<template>
   <RouterLink :to="`/blogs/${slug}`" class="w-full max-w-sm">
      <div
         class="relative h-[400px] w-full flex flex-col p-4 bg-white/5 group rounded-xl border border-white/5 
               hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
      >
         <!-- Banner -->
         <div class="w-full h-36 rounded-lg mb-3 bg-gradient-to-br from-gray-700 to-gray-900 relative overflow-hidden">
            <img
               :src="banner_image"
               class="w-full h-full group-hover:scale-125 duration-300 object-cover object-center"
               alt="Blog banner"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
         </div>

         <!-- Date -->
         <div class="text-xs text-gray-400 mb-2 text-right">
            {{ formatDate(published_at) }}
         </div>

         <!-- Title -->
         <h3
            class="text-xl font-semibold text-white group-hover:text-cyan-400 mb-2 
                  transition-colors duration-300 line-clamp-2 min-h-[3rem]"
         >
            {{ title }}
         </h3>

         <!-- Content -->
         <div
            class="text-sm text-gray-300 mb-4 min-h-[3.5rem] line-clamp-3"
            v-html="contentTruncated(content, 100)"
         ></div>

         <!-- Read Icon -->
         <div
            class="absolute bottom-3 right-3 text-gray-400
                  group-hover:text-cyan-400 transition-colors duration-300 
                  flex items-center justify-center w-30 h-7 rounded-full bg-white/5"
         >
            <div class="flex items-center gap-x-3 text-sm">
               <p>Read More</p>
               <i class="pi pi-arrow-up-right bg-white/10 group-hover:bg-cyan-500/40 p-1 rounded-full"></i>
            </div>
         </div>
      </div>
   </RouterLink>
</template>
