const viewModules = import.meta.glob('@/views/**/{index,save}.vue')
function loadIndexView(routePath) {
  const viewDir = routePath.replace(/^\//, '')
  const key = `/src/views/${viewDir}/index.vue`
  const loader = viewModules[key]
  if (!loader) {
    console.warn(`[view-loader] \u672A\u627E\u5230\u9875\u9762: views/${viewDir}/index.vue`)
    return () => import('@/views/error/NotFoundView.vue')
  }
  return loader
}
function loadSaveView(routePath) {
  const basePath = routePath.replace(/\/save(\/.*)?$/, '').replace(/^\//, '')
  const key = `/src/views/${basePath}/save.vue`
  const loader = viewModules[key]
  if (!loader) {
    console.warn(`[view-loader] \u672A\u627E\u5230\u9875\u9762: views/${basePath}/save.vue`)
    return () => import('@/views/error/NotFoundView.vue')
  }
  return loader
}
function hasIndexView(routePath) {
  const viewDir = routePath.replace(/^\//, '')
  return `/src/views/${viewDir}/index.vue` in viewModules
}
function listAvailableViews() {
  return Object.keys(viewModules).map((k) => k.replace('/src/views/', 'views/'))
}
function buildRouteRecord(routePath, meta = {}) {
  const path = routePath.replace(/^\//, '')
  return {
    path,
    name: path.replace(/\//g, '-'),
    component: loadIndexView(routePath),
    meta: { ...meta, routePath },
  }
}
function buildSaveRouteRecord(basePath, meta = {}) {
  const base = basePath.replace(/^\//, '')
  return [
    {
      path: `${base}/save/:id?`,
      name: `${base.replace(/\//g, '-')}-save`,
      component: loadSaveView(basePath),
      meta: {
        ...meta,
        hidden: true,
        title: meta.title ? `${meta.title} - \u7F16\u8F91` : '\u7F16\u8F91',
        routePath: basePath,
      },
    },
  ]
}
export {
  buildRouteRecord,
  buildSaveRouteRecord,
  hasIndexView,
  listAvailableViews,
  loadIndexView,
  loadSaveView,
  viewModules,
}
