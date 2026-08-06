import { storeToRefs } from 'pinia'
import { usePermissionStore } from '@/stores/permission'
import { isCodeDefined, isRegistryLoaded } from '@/utils/api-guard'
const warnedCodes = /* @__PURE__ */ new Set()
function checkPermission(el, binding) {
  const store = usePermissionStore()
  const value = binding.value
  if (!value) return
  const codes = Array.isArray(value) ? value : [value]
  if (import.meta.env.DEV && isRegistryLoaded()) {
    for (const code of codes) {
      if (!isCodeDefined(code) && !warnedCodes.has(code)) {
        warnedCodes.add(code)
        console.warn(
          `[api-guard] \u6309\u94AE\u6743\u9650\u300C${code}\u300D\u672A\u5728\u300C\u6743\u9650\u5185\u5BB9\u300D\u4E2D\u767B\u8BB0\uFF08\u5F00\u53D1\u63D0\u793A\uFF09`,
        )
      }
    }
  }
  const allowed = codes.some((code) => store.hasPermission(code))
  if (!allowed) {
    el.parentNode?.removeChild(el)
  }
}
const permissionDirective = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  },
}
function setupPermissionDirective(app) {
  app.directive('permission', permissionDirective)
}
function usePermission() {
  const store = usePermissionStore()
  const { roles, permissions, isSuperAdmin } = storeToRefs(store)
  return {
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    isSuperAdmin,
    roles,
    permissions,
  }
}
export { permissionDirective, setupPermissionDirective, usePermission }
