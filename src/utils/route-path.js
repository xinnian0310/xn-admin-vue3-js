function normalizeRoutePath(routePath) {
  const raw = routePath.trim().replace(/\\/g, '/')
  if (!raw) return ''
  const cleaned = raw.replace(/\/+/g, '/').replace(/\/$/, '')
  return cleaned.startsWith('/') ? cleaned : `/${cleaned}`
}
function pathToViewDir(routePath) {
  return normalizeRoutePath(routePath).replace(/^\//, '')
}
function pathToIndexView(routePath) {
  return `${pathToViewDir(routePath)}/index`
}
function pathToSaveView(routePath) {
  return `${pathToViewDir(routePath)}/save`
}
function viewDirToPath(viewPath) {
  return normalizeRoutePath(viewPath.replace(/\/index$|\/save$/, ''))
}
function autoViewPath(routePath) {
  return pathToViewDir(routePath)
}
function saveRoutePath(basePath, id) {
  const base = normalizeRoutePath(basePath).replace(/\/$/, '')
  if (id === void 0 || id === null || id === '') {
    return `${base}/save`
  }
  return `${base}/save/${id}`
}
export {
  autoViewPath,
  normalizeRoutePath,
  pathToIndexView,
  pathToSaveView,
  pathToViewDir,
  saveRoutePath,
  viewDirToPath,
}
