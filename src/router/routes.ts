import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('../components/TaskDashboard.vue'),
      },
      {
        path: '/tasks',
        name: 'tasks',
        component: () => import('../pages/TaskListPage.vue'),
      },
    ],
  },

  // 404 fallback
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
