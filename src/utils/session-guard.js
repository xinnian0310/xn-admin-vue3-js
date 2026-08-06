import { ElMessage } from 'element-plus'
import { appConfig } from '@/config/app'
import router from '@/router'
const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'wheel',
]
let started = false
let lastActivityAt = 0
let lastRefreshAt = 0
let idleCheckTimer = null
let activityThrottleTimer = null
let refreshing = false
let loggingOut = false
function sessionCfg() {
  return appConfig.session
}
function markActivity() {
  lastActivityAt = Date.now()
}
async function doRefresh() {
  const cfg = sessionCfg()
  if (!cfg.slidingRefreshEnabled || !localStorage.getItem('token')) return
  const now = Date.now()
  if (now - lastRefreshAt < cfg.refreshIntervalMs) return
  if (refreshing) return
  refreshing = true
  try {
    const { useUserStore } = await import('@/stores/user')
    await useUserStore().refreshToken()
    lastRefreshAt = Date.now()
  } catch (error) {
    console.warn('[session-guard] token \u7EED\u671F\u5931\u8D25', error)
  } finally {
    refreshing = false
  }
}
async function doIdleLogout() {
  if (loggingOut || !localStorage.getItem('token')) return
  loggingOut = true
  try {
    const { useUserStore } = await import('@/stores/user')
    await useUserStore().logout()
    ElMessage.warning(
      '\u957F\u65F6\u95F4\u672A\u64CD\u4F5C\uFF0C\u5DF2\u81EA\u52A8\u9000\u51FA\u767B\u5F55',
    )
    if (router.currentRoute.value.path !== '/login') {
      await router.push('/login')
    }
  } finally {
    loggingOut = false
  }
}
function checkIdle() {
  const cfg = sessionCfg()
  if (!cfg.idleLogoutEnabled || !localStorage.getItem('token')) return
  if (Date.now() - lastActivityAt >= cfg.idleTimeoutMs) {
    void doIdleLogout()
  }
}
function onActivity() {
  if (!localStorage.getItem('token')) return
  if (activityThrottleTimer) return
  activityThrottleTimer = setTimeout(() => {
    activityThrottleTimer = null
  }, 1e3)
  markActivity()
  void doRefresh()
}
function onVisibilityChange() {
  if (document.visibilityState !== 'visible') return
  if (!localStorage.getItem('token')) return
  checkIdle()
  if (!loggingOut && localStorage.getItem('token')) {
    markActivity()
    void doRefresh()
  }
}
function startSessionGuard() {
  if (!localStorage.getItem('token')) return
  markActivity()
  lastRefreshAt = Date.now()
  if (!started) {
    started = true
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
  const cfg = sessionCfg()
  if (idleCheckTimer) {
    clearInterval(idleCheckTimer)
    idleCheckTimer = null
  }
  if (cfg.idleLogoutEnabled) {
    idleCheckTimer = setInterval(checkIdle, cfg.idleCheckIntervalMs)
  }
}
function stopSessionGuard() {
  if (idleCheckTimer) {
    clearInterval(idleCheckTimer)
    idleCheckTimer = null
  }
  if (activityThrottleTimer) {
    clearTimeout(activityThrottleTimer)
    activityThrottleTimer = null
  }
  if (started) {
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, onActivity)
    }
    document.removeEventListener('visibilitychange', onVisibilityChange)
    started = false
  }
  refreshing = false
  loggingOut = false
  lastActivityAt = 0
  lastRefreshAt = 0
}
export { startSessionGuard, stopSessionGuard }
