import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getApiRegistry,
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshToken as refreshTokenApi,
  updateCurrentUser,
} from '@/api/auth'
import { usePermissionStore } from '@/stores/permission'
import { useTagsViewStore } from '@/stores/tagsView'
import { resetDynamicRoutes } from '@/utils/route-register'
import { clearApiRegistry, setApiRegistry } from '@/utils/api-guard'
import { normalizeDateTimes } from '@/utils/datetime'
import { useNoticeStore } from '@/stores/notice'
import { startSessionGuard, stopSessionGuard } from '@/utils/session-guard'
import { useUiPreferenceStore } from '@/stores/uiPreference'
const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(getStoredUser())
  const permissionStore = usePermissionStore()
  function getStoredUser() {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    try {
      const parsed = normalizeDateTimes(JSON.parse(raw))
      if (parsed.roles && parsed.permissions) {
        permissionStore.setAuthData(parsed.roles, parsed.permissions)
      }
      return parsed
    } catch {
      return null
    }
  }
  function clearSessionViews() {
    useTagsViewStore().resetViews()
  }
  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    permissionStore.setAuthData(newUser.roles || [], newUser.permissions || [])
  }
  function clearAuth() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    permissionStore.clear()
    clearApiRegistry()
  }
  async function loadRegistry() {
    try {
      const res = await getApiRegistry()
      setApiRegistry(res.data)
    } catch (error) {
      console.warn(
        '[api-guard] \u52A0\u8F7D\u6743\u9650\u5185\u5BB9\u6CE8\u518C\u8868\u5931\u8D25',
        error,
      )
    }
  }
  async function login(username, password, captcha) {
    clearSessionViews()
    resetDynamicRoutes()
    const res = await loginApi({
      username,
      password,
      captchaId: captcha?.captchaId,
      captchaCode: captcha?.captchaCode,
    })
    setAuth(res.data.token, res.data.user)
    await loadRegistry()
    startSessionGuard()
    await useUiPreferenceStore().load()
    return res.data
  }
  async function refreshToken() {
    const res = await refreshTokenApi()
    token.value = res.data.token
    localStorage.setItem('token', res.data.token)
    if (res.data.user) {
      user.value = res.data.user
      localStorage.setItem('user', JSON.stringify(res.data.user))
      permissionStore.setAuthData(res.data.user.roles || [], res.data.user.permissions || [])
    }
    return res.data
  }
  async function fetchProfile() {
    const res = await getCurrentUser()
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    permissionStore.setAuthData(res.data.roles || [], res.data.permissions || [])
    return res.data
  }
  async function updateProfile(payload) {
    const res = await updateCurrentUser(payload)
    user.value = res.data
    localStorage.setItem('user', JSON.stringify(res.data))
    permissionStore.setAuthData(res.data.roles || [], res.data.permissions || [])
    return res.data
  }
  async function logout(remote = true) {
    const currentToken = token.value
    stopSessionGuard()
    useNoticeStore().stopRealtime()
    clearSessionViews()
    useUiPreferenceStore().clearLocal()
    clearAuth()
    resetDynamicRoutes()
    if (remote && currentToken) {
      try {
        await logoutApi(currentToken)
      } catch {
        // remote logout best-effort
      }
    }
  }
  return {
    token,
    user,
    login,
    refreshToken,
    fetchProfile,
    updateProfile,
    loadRegistry,
    logout,
    clearAuth,
  }
})
export { useUserStore }
