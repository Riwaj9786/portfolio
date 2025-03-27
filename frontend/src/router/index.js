import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Projects from '@/views/Projects.vue'
import Blogs from '@/views/Blogs.vue'
import Contact from '@/views/Contact.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/projects',
      name: 'projects',
      component: Projects,
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: Blogs,
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact,
    }
  ],
})

export default router
