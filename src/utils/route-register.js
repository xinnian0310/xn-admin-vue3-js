import { useMenuStore, collectMenuPaths } from '@/stores/menu'
import { buildRouteRecord } from '@/utils/view-loader'
const LAYOUT_NAME = 'AdminLayout'
const iframePage = () => import('@/views/common/iframe/index.vue')
let registerPromise = null
function addDynamicRoutes(router) {
  const menuStore = useMenuStore()
  const paths = collectMenuPaths(menuStore.sysRoutes)
  for (const route of paths) {
    if (!route.path) continue
    const routeName = route.path.replace(/^\//, '').replace(/\//g, '-')
    if (routeName === 'dashboard') continue
    if (!router.hasRoute(routeName)) {
      const meta = {
        title: route.title,
        icon: route.icon,
        // 未开启权限控制时不写入 meta.permission，路由守卫将跳过权限校验
        permission: route.permissionControl ? route.permission : void 0,
        affix: route.affix,
        linkUrl: route.type === 'LINK' ? route.linkUrl : void 0,
      }
      if (route.type === 'LINK') {
        const path = route.path.replace(/^\//, '')
        router.addRoute(LAYOUT_NAME, {
          path,
          name: routeName,
          component: iframePage,
          meta: { ...meta, routePath: route.path },
        })
      } else {
        router.addRoute(LAYOUT_NAME, {
          ...buildRouteRecord(route.path, meta),
          name: routeName,
        })
      }
    }
  }
}
async function registerDynamicRoutes(router) {
  const menuStore = useMenuStore()
  if (menuStore.routesRegistered) {
    return
  }
  if (registerPromise) {
    return registerPromise
  }
  registerPromise = (async () => {
    try {
      await menuStore.fetchMenus()
      addDynamicRoutes(router)
    } catch (error) {
      console.error(
        '[route-register] \u83DC\u5355\u52A0\u8F7D\u5931\u8D25\uFF0C\u5C06\u4EC5\u4F7F\u7528\u9759\u6001\u8DEF\u7531',
        error,
      )
      menuStore.markMenuLoadFailed()
    } finally {
      if (!router.hasRoute('CatchAll')) {
        router.addRoute({
          path: '/:pathMatch(.*)*',
          name: 'CatchAll',
          redirect: () => {
            const store = useMenuStore()
            return store.menuLoadFailed ? '/503' : '/404'
          },
        })
      }
      menuStore.markRoutesRegistered()
      registerPromise = null
    }
  })()
  return registerPromise
}
function resetDynamicRoutes() {
  registerPromise = null
  useMenuStore().reset()
}
export { registerDynamicRoutes, resetDynamicRoutes }
