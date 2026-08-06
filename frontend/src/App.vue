<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar/NavBar.vue'
import FooterComponent from './components/Footer/FooterComponent.vue'
import WeatherAmbience from './components/Ambience/WeatherAmbience.vue'
</script>

<template>
  <div class="site-shell flex flex-col">
    <WeatherAmbience />
    <NavBar />
    <main class="site-main flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <footer class="site-footer w-full"><FooterComponent /></footer>
  </div>
</template>
