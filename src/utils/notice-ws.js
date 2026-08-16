import { useUserStore } from '@/stores/user'
import {
  FORCE_LOGOUT_CLOSE_CODE,
  FORCE_LOGOUT_MESSAGE_TYPE,
  handleForceLogout,
} from '@/utils/force-logout'
let socket = null
let heartbeatTimer
let reconnectTimer
let manualClose = false
const handlers = /* @__PURE__ */ new Set()
function buildWsUrl(token) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.host
  return `${protocol}//${host}/ws/notices?token=${encodeURIComponent(token)}`
}
function clearTimers() {
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = void 0
  }
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = void 0
  }
}
function startHeartbeat() {
  heartbeatTimer = window.setInterval(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }))
    }
  }, 25e3)
}
function scheduleReconnect() {
  if (manualClose) return
  reconnectTimer = window.setTimeout(() => {
    connectNoticeWs()
  }, 3e3)
}
function onNoticeWsMessage(handler) {
  handlers.add(handler)
  return () => handlers.delete(handler)
}
function connectNoticeWs() {
  const token = useUserStore().token || localStorage.getItem('token') || ''
  if (!token) return
  manualClose = false
  clearTimers()
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    return
  }
  socket = new WebSocket(buildWsUrl(token))
  socket.onopen = () => {
    startHeartbeat()
  }
  socket.onmessage = (event) => {
    let data
    try {
      data = JSON.parse(String(event.data))
    } catch {
      // ignore malformed WS payloads
      return
    }
    if (data.type === FORCE_LOGOUT_MESSAGE_TYPE) {
      // 必须同步置位，否则紧随其后的 onclose 会把连接重连回来
      manualClose = true
      handleForceLogout(data.message)
      return
    }
    handlers.forEach((handler) => handler(data))
  }
  socket.onclose = (event) => {
    clearTimers()
    socket = null
    if (event.code === FORCE_LOGOUT_CLOSE_CODE) {
      manualClose = true
      handleForceLogout()
      return
    }
    scheduleReconnect()
  }
  socket.onerror = () => {
    socket?.close()
  }
}
function disconnectNoticeWs() {
  manualClose = true
  clearTimers()
  if (socket) {
    socket.close()
    socket = null
  }
}
export { connectNoticeWs, disconnectNoticeWs, onNoticeWsMessage }
