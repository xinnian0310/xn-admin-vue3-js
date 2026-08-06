import { createRouter, createWebHistory } from 'vue-router'
import '@/types/menu'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { useMenuStore } from '@/stores/menu'
import { useTagsViewStore } from '@/stores/tagsView'
import { registerDynamicRoutes } from '@/utils/route-register'
const ERROR_PATHS = /* @__PURE__ */ new Set(['/403', '/404', '/503'])
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      name: 'AdminLayout',
      component: () => import('@/layouts/AdminLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/index.vue'),
          meta: { title: '\u9996\u9875', affix: true, permission: 'menu:dashboard' },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/index.vue'),
          meta: { title: '\u4E2A\u4EBA\u4FE1\u606F', hidden: true },
        },
        {
          path: '403',
          name: 'Forbidden',
          component: () => import('@/views/error/ForbiddenView.vue'),
          meta: { title: '\u65E0\u6743\u9650', hidden: true },
        },
        {
          path: '404',
          name: 'NotFoundPage',
          component: () => import('@/views/error/NotFoundView.vue'),
          meta: { title: '\u9875\u9762\u4E0D\u5B58\u5728', hidden: true },
        },
        {
          path: '503',
          name: 'ServiceUnavailable',
          component: () => import('@/views/error/ServiceUnavailableView.vue'),
          meta: { title: '\u670D\u52A1\u4E0D\u53EF\u7528', hidden: true },
        },
        {
          path: 'redirect/:path(.*)',
          name: 'Redirect',
          component: () => import('@/views/redirect/index.vue'),
          meta: { hidden: true, noCache: true },
        },
      ],
    },
    // 注意：通配 404 不在此静态声明。
    // 若在动态路由注册前就 redirect，硬刷新深层页面会丢失原始路径。
    // 通配路由在 registerDynamicRoutes 完成后再挂载。
  ],
})
function unmatchedFallback(menuStore) {
  return menuStore.menuLoadFailed ? '/503' : '/404'
}
router.beforeEach(async (to) => {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const menuStore = useMenuStore()
  if (!to.meta.public && !userStore.token) {
    return '/login'
  }
  if (to.path === '/login' && userStore.token) {
    if (userStore.user?.mustChangePassword) {
      return { path: '/profile', query: { forcePwd: '1' } }
    }
    return '/dashboard'
  }
  if (
    userStore.token &&
    userStore.user?.mustChangePassword &&
    to.path !== '/profile' &&
    to.path !== '/login' &&
    !ERROR_PATHS.has(to.path)
  ) {
    return { path: '/profile', query: { forcePwd: '1' } }
  }
  if (!to.meta.public && userStore.token && !menuStore.routesRegistered) {
    await registerDynamicRoutes(router)
    return {
      path: to.path,
      query: to.query,
      hash: to.hash,
      replace: true,
    }
  }
  if (ERROR_PATHS.has(to.path)) {
    return true
  }
  if (to.name === 'CatchAll' || to.matched.length === 0) {
    return unmatchedFallback(menuStore)
  }
  if (to.meta.public || !to.meta.permission) {
    return true
  }
  if (userStore.token) {
    try {
      const needsRefresh =
        !permissionStore.permissions.length ||
        !userStore.user?.roles?.length ||
        !userStore.user?.permissions?.length
      if (needsRefresh) {
        await userStore.fetchProfile()
      }
    } catch {
      userStore.logout(false)
      return '/login'
    }
  }
  if (permissionStore.isSuperAdmin || permissionStore.hasPermission(to.meta.permission)) {
    return true
  }
  return '/403'
})
router.afterEach((to) => {
  const tagsViewStore = useTagsViewStore()
  tagsViewStore.initTags()
  tagsViewStore.addView(to)
})
var index_default = router
export { index_default as default }
