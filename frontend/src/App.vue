<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import FooterComponent from './components/FooterComponent.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <NavBar />
    
    <main class="flex-1">
      <RouterView />
    </main>

    <FooterComponent />
  </div>
</template>
