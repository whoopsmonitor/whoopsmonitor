
const routes = [
  {
    path: '/',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      { path: '', name: 'auth.login', component: () => import('pages/Login.vue'), meta: { guest: true } }
    ]
  },

  {
    path: '/dashboard',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      // dashboard does not need a login to view the page
      { path: '', name: 'dashboard', component: () => import('pages/Dashboard.vue'), meta: { auth: false } }
    ]
  },

  {
    path: '/check',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'check.index', component: () => import('pages/check/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'check.create', component: () => import('pages/check/Form.vue'), meta: { auth: true } },
      { path: ':id', name: 'check.detail', component: () => import('pages/check/Form.vue'), meta: { auth: true, edit: true } },
      { path: ':id/dashboard', name: 'check.dashboard', component: () => import('pages/check/Dashboard.vue'), meta: { auth: false } }
    ]
  },

  {
    path: '/alert',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'alert.index', component: () => import('pages/alert/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'alert.create', component: () => import('pages/alert/Form.vue'), meta: { auth: true } },
      { path: ':id', name: 'alert.detail', component: () => import('pages/alert/Form.vue'), meta: { auth: true, edit: true } }
    ]
  },

  {
    path: '/image',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'image.index', component: () => import('pages/image/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'image.create', component: () => import('pages/image/Form.vue'), meta: { auth: true } },
      { path: ':id', name: 'image.detail', component: () => import('pages/image/Form.vue'), meta: { auth: true, edit: true } }
    ]
  },

  {
    path: '/server-error',
    component: () => import('pages/Error500.vue'),
    name: 'error.500',
    meta: { auth: false }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue'),
    meta: { auth: false }
  }
]

export default routes
