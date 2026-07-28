import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'scan',
    component: () => import('../views/ScanView.vue'),
  },
  {
    path: '/phone',
    name: 'phone',
    component: () => import('../views/PhoneNumberView.vue'),
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
  },
  {
    path: '/early-bird',
    name: 'early-bird',
    component: () => import('../views/EarlyBirdView.vue'),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
  },
  {
    path: '/check',
    name: 'check',
    component: () => import('../views/CheckView.vue'),
  },
  {
    path: '/routes',
    name: 'routes',
    component: () => import('../views/RouteCalculatorView.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
  },
  {
    path: '/choose-pm',
    alias: ['/pm'],
    name: 'pm',
    component: () => import('../views/PMView.vue'),
  },
  {
    path: '/inventory',
    name: 'inventory',
    component: () => import('../views/InventoryView.vue'),
  },
  {
    path: '/lsp-stats',
    name: 'lsp-stats',
    component: () => import('../views/LSPStatsView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (typeof document === 'undefined') {
    next();
    return;
  }

  let storedPhone = '';
  try {
    storedPhone = localStorage.getItem('phone_number') || '';
  } catch {
    storedPhone = '';
  }

  if (to.name === 'phone') {
    if (storedPhone) {
      next({ name: 'scan' });
      return;
    }
    next();
    return;
  }

  if (to.name === 'scan' && !storedPhone) {
    const query = to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : {};
    next({ name: 'phone', query });
    return;
  }

  if (to.name === 'pm') {
    const forceChoose = to?.query?.force === 'choose' || to?.query?.force === '1';
    try {
      const selectedPm = localStorage.getItem('selected_pm_name');
      if (selectedPm && !forceChoose) {
        next({ name: 'inventory' });
        return;
      }
    } catch (e) {
      // ignore localStorage access errors and continue to pm
    }
  }

  next();
});

export default router;
