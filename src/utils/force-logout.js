/**
 * 登录态失效的统一收口。
 *
 * 三个入口共用：WebSocket 收到 auth:force-logout、WebSocket 被服务端以 4401 关闭、HTTP 401。
 * 通过单飞标记保证并发场景下只清一次会话、只弹一次窗。
 */
import { ElMessageBox } from 'element-plus'
import router from '@/router'

/** 与后端 NoticeSessionHub.KICKED_STATUS 约定的关闭码 */
const FORCE_LOGOUT_CLOSE_CODE = 4401
/** 与后端约定的强制下线消息类型 */
const FORCE_LOGOUT_MESSAGE_TYPE = 'auth:force-logout'

const DEFAULT_MESSAGE = '您的登录状态已失效，请重新登录'

let handling = false

function handleForceLogout(message) {
  if (handling) return
  // 登录页本身不需要再弹窗打断
  if (router.currentRoute.value.path === '/login') return
  handling = true

  const content = (typeof message === 'string' && message.trim()) || DEFAULT_MESSAGE

  void (async () => {
    try {
      const { useUserStore } = await import('@/stores/user')
      await useUserStore().logout(false)
    } catch {
      // 本地态清理失败也必须继续跳转登录页
    }

    try {
      await ElMessageBox.alert(content, '下线通知', {
        type: 'warning',
        confirmButtonText: '重新登录',
        showClose: true,
        closeOnClickModal: false,
      })
    } catch {
      // 点右上角关闭或 ESC 与点确认同样处理
    }

    if (router.currentRoute.value.path !== '/login') {
      await router.push('/login')
    }
    handling = false
  })()
}

export { FORCE_LOGOUT_CLOSE_CODE, FORCE_LOGOUT_MESSAGE_TYPE, handleForceLogout }
