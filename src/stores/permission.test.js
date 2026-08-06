import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { usePermissionStore } from '@/stores/permission'
describe('permission store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  it('super admin bypasses all permission codes', () => {
    const store = usePermissionStore()
    store.setAuthData(['SUPER_ADMIN'], [])
    expect(store.isSuperAdmin).toBe(true)
    expect(store.hasPermission('api:DELETE:/api/users/{id}')).toBe(true)
  })
  it('normal user only passes granted codes', () => {
    const store = usePermissionStore()
    store.setAuthData(['USER'], ['menu:dashboard', 'api:GET:/api/auth/me'])
    expect(store.isSuperAdmin).toBe(false)
    expect(store.hasPermission('menu:dashboard')).toBe(true)
    expect(store.hasPermission('api:DELETE:/api/users/{id}')).toBe(false)
    expect(store.hasAnyPermission(['role:update', 'menu:dashboard'])).toBe(true)
  })
  it('clear resets auth data', () => {
    const store = usePermissionStore()
    store.setAuthData(['ADMIN'], ['user:create'])
    store.clear()
    expect(store.roles).toEqual([])
    expect(store.permissions).toEqual([])
    expect(store.hasPermission('user:create')).toBe(false)
  })
})
