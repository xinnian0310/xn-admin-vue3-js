const REQUIRED = ['list', 'get', 'create', 'update', 'remove']
const apiModules = import.meta.glob('@/api/*.js', { eager: true })
function resolveModule(name) {
  const normalized = name
    .replace(/^@\/api\//, '')
    .replace(/\.(ts|js)$/, '')
    .replace(/^\//, '')
  const candidates = [
    `/src/api/${normalized}.js`,
    `src/api/${normalized}.js`,
    `@/api/${normalized}.js`,
    `/api/${normalized}.js`,
  ]
  for (const key of candidates) {
    if (apiModules[key]) return apiModules[key]
  }
  const matched = Object.entries(apiModules).find(([key]) =>
    key.replace(/\\/g, '/').endsWith(`/api/${normalized}.js`),
  )
  return matched?.[1]
}
function assertCrudApi(name, mod) {
  if (!mod) {
    const available = Object.keys(apiModules)
      .map((k) => k.replace(/\\/g, '/').split('/api/').pop())
      .join(', ')
    throw new Error(`[api-loader] 未找到 API 模块: @/api/${name}.js（已加载: ${available}）`)
  }
  const missing = REQUIRED.filter((key) => typeof mod[key] !== 'function')
  if (missing.length) {
    throw new Error(
      `[api-loader] @/api/${name}.js 缺少统一 CRUD 导出: ${missing.join(', ')}（须导出 list/get/create/update/remove）`,
    )
  }
}
function loadCrudApi(api) {
  const mod = resolveModule(api)
  assertCrudApi(api, mod)
  return mod
}
function listApiModuleNames() {
  return Object.keys(apiModules).map((k) => {
    const normalized = k.replace(/\\/g, '/')
    return (
      normalized
        .split('/api/')
        .pop()
        ?.replace(/\.(ts|js)$/, '') ?? normalized
    )
  })
}
export { listApiModuleNames, loadCrudApi }
