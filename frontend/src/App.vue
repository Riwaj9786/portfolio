<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar/NavBar.vue'
import FooterComponent from './components/Footer/FooterComponent.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- <FooterComponent /> -->
  </div>
</template>
