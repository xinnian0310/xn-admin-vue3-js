const WHITELIST = /* @__PURE__ */ new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/captcha',
  '/api/auth/captcha/slider',
  '/api/auth/api-registry',
  '/api/login-page-configs/active',
  '/api/system-config/public',
  '/api/site-contact/public',
  '/api/site-ui-shots/public',
])
let compiledApis = []
let definedCodes = /* @__PURE__ */ new Set()
let loaded = false
function toRegex(path) {
  const segments = path.split(/\{[^/}]+\}/)
  const escaped = segments.map((seg) => seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]+')
  return new RegExp(`^${escaped}$`)
}
function setApiRegistry(data) {
  compiledApis = (data.apis ?? []).map((api) => ({
    method: (api.method ?? '').toUpperCase(),
    re: toRegex(api.path),
  }))
  definedCodes = new Set(data.codes ?? [])
  loaded = true
}
function clearApiRegistry() {
  compiledApis = []
  definedCodes = /* @__PURE__ */ new Set()
  loaded = false
}
function isRegistryLoaded() {
  return loaded
}
function isWhitelisted(fullPath) {
  return WHITELIST.has(fullPath)
}
function isApiRegistered(method, fullPath) {
  const upper = method.toUpperCase()
  return compiledApis.some((api) => api.method === upper && api.re.test(fullPath))
}
function isCodeDefined(code) {
  return definedCodes.has(code)
}
export {
  clearApiRegistry,
  isApiRegistered,
  isCodeDefined,
  isRegistryLoaded,
  isWhitelisted,
  setApiRegistry,
}
