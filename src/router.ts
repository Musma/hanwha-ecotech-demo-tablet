import {
  createRouter,
  createWebHashHistory,
  type RouteRecordRaw,
} from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/index.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/login.vue'),
    meta: { layout: 'blank' },
  },
  {
    path: '/jibun',
    name: 'jibun',
    component: () => import('@/pages/jibun/index.vue'),
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('@/pages/materials/index.vue'),
  },
  {
    path: '/jibun-master',
    name: 'jibun-master',
    component: () => import('@/pages/jibun-master/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/not-found.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
