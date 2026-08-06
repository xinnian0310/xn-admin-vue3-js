import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
const SUPER_ADMIN = 'SUPER_ADMIN'
const usePermissionStore = defineStore('permission', () => {
  const roles = ref([])
  const permissions = ref([])
  const isSuperAdmin = computed(() => roles.value.includes(SUPER_ADMIN))
  function setAuthData(roleList, permissionList) {
    roles.value = roleList
    permissions.value = permissionList
  }
  function clear() {
    roles.value = []
    permissions.value = []
  }
  function hasPermission(code) {
    if (isSuperAdmin.value) return true
    return permissions.value.includes(code)
  }
  function hasAnyPermission(codes) {
    return codes.some((code) => hasPermission(code))
  }
  return {
    roles,
    permissions,
    isSuperAdmin,
    setAuthData,
    clear,
    hasPermission,
    hasAnyPermission,
  }
})
export { usePermissionStore }
