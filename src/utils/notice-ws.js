import { useUserStore } from '@/stores/user'
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
    try {
      const data = JSON.parse(String(event.data))
      handlers.forEach((handler) => handler(data))
    } catch {
      // ignore malformed WS payloads
    }
  }
  socket.onclose = () => {
    clearTimers()
    socket = null
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
