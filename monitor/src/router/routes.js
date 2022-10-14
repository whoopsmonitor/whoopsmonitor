
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
      { path: '', name: 'dashboard', component: () => import('pages/Dashboard.vue'), meta: { auth: false, docs: 'https://github.com/whoopsmonitor/whoopsmonitor/blob/master/docs/quick-start.md' } }
    ]
  },

  {
    path: '/check',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'check.index', component: () => import('pages/check/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'check.create', component: () => import('pages/check/Form.vue'), meta: { auth: true, docs: 'https://github.com/whoopsmonitor/whoopsmonitor/blob/master/docs/quick-start.md#ready-to-create-a-new-check' } },
      { path: ':id', name: 'check.detail', component: () => import('pages/check/Form.vue'), meta: { auth: true, edit: true } },
      { path: ':id/dashboard', name: 'check.dashboard', component: () => import('pages/check/Dashboard.vue'), meta: { auth: false } }
    ]
  },

  {
    path: '/alert',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'alert.index', component: () => import('pages/alert/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'alert.create', component: () => import('pages/alert/Form.vue'), meta: { auth: true, docs: 'https://github.com/whoopsmonitor/whoopsmonitor/blob/master/docs/quick-start-alerts.md' } },
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
    path: '/sharedenvvars',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'sharedenvvars.index', component: () => import('pages/sharedenvvars/Index.vue'), meta: { auth: true } },
      { path: 'create', name: 'sharedenvvars.create', component: () => import('pages/sharedenvvars/Form.vue'), meta: { auth: true } },
      { path: ':id', name: 'sharedenvvars.detail', component: () => import('pages/sharedenvvars/Form.vue'), meta: { auth: true, edit: true } }
    ]
  },

  {
    path: '/issue',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'issue.index', component: () => import('pages/issue/Index.vue'), meta: { auth: true } }
    ]
  },

  {
    path: '/backuprestore',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'backuprestore.index', component: () => import('pages/backuprestore/Index.vue'), meta: { auth: true } }
    ]
  },
  {
    path: '/tools',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'tools.index', component: () => import('pages/tools/Index.vue'), meta: { auth: true } }
    ]
  },

  {
    path: '/server-error',
    component: () => import('pages/ErrorCode500.vue'),
    name: 'error.500',
    meta: { auth: false }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorCode404.vue')
  }
]

export default routes
