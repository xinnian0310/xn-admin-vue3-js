import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAuthMenus } from '@/api/auth'
function routeToMenu(route) {
  return {
    id: String(route.id),
    title: route.title,
    icon: route.icon,
    path: route.type === 'MENU' ? route.path : void 0,
    permission: route.permission,
    affix: route.affix,
    hidden: route.hidden,
    children: route.children?.length ? route.children.map(routeToMenu) : void 0,
  }
}
function collectMenuPaths(routes) {
  const result = []
  for (const route of routes) {
    if (route.type === 'MENU' && route.path) {
      result.push(route)
    }
    if (route.children?.length) {
      result.push(...collectMenuPaths(route.children))
    }
  }
  return result
}
const useMenuStore = defineStore('menu', () => {
  const menus = ref([])
  const sysRoutes = ref([])
  const routesRegistered = ref(false)
  const menuLoadFailed = ref(false)
  let fetchPromise = null
  async function fetchMenus() {
    if (fetchPromise) {
      return fetchPromise
    }
    fetchPromise = (async () => {
      const res = await getAuthMenus()
      sysRoutes.value = res.data
      menus.value = res.data.map(routeToMenu)
      menuLoadFailed.value = false
    })().finally(() => {
      fetchPromise = null
    })
    return fetchPromise
  }
  function markMenuLoadFailed() {
    menuLoadFailed.value = true
  }
  function reset() {
    menus.value = []
    sysRoutes.value = []
    routesRegistered.value = false
    menuLoadFailed.value = false
    fetchPromise = null
  }
  function markRoutesRegistered() {
    routesRegistered.value = true
  }
  return {
    menus,
    sysRoutes,
    routesRegistered,
    menuLoadFailed,
    fetchMenus,
    markMenuLoadFailed,
    reset,
    markRoutesRegistered,
  }
})
export { collectMenuPaths, useMenuStore }
