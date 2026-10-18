import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Projects from '@/views/Projects.vue'
import Blogs from '@/views/Blogs.vue'
import Contact from '@/views/Contact.vue'
import ProjectDetail from '@/views/ProjectDetail.vue'
import TestimonialForm from '@/views/TestimonialForm.vue'
import BlogDetail from '@/views/BlogDetail.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (!to.hash) return { top: 0 };
    return new Promise((resolve) => {
      let attempts = 0;
      function locate() {
        const element = document.getElementById(to.hash.slice(1));
        if (element) resolve({ el: element, top: 110, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        else if (++attempts < 90) requestAnimationFrame(locate);
        else resolve({ top: 0 });
      }
      requestAnimationFrame(locate);
    });
  },
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
      path: '/projects/:slug',
      name: 'projectDetail',
      component: ProjectDetail,
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: Blogs,
    },
    {
      path: '/blogs/:slug',
      name: 'blogDetail',
      component: BlogDetail
    },
    {
      path: '/connect',
      name: 'connect',
      component: Contact,
    },
    {
      path: '/testimonial/form',
      name: 'testimonial',
      component: TestimonialForm,
    },
  ],
})

export default router
