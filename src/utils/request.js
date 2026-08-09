import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { isApiRegistered, isRegistryLoaded, isWhitelisted } from '@/utils/api-guard'
import { normalizeDateTimes } from '@/utils/datetime'
const request = axios.create({
  baseURL: '/api',
  timeout: 15e3,
})
const warnedApis = /* @__PURE__ */ new Set()
/** 相同错误文案在窗口内只提示一次，避免并发失败刷屏 */
const ERROR_TOAST_DEDUP_MS = 3000
const recentErrorToasts = /* @__PURE__ */ new Map()
function showRequestError(content) {
  const now = Date.now()
  const lastAt = recentErrorToasts.get(content)
  if (lastAt != null && now - lastAt < ERROR_TOAST_DEDUP_MS) {
    return
  }
  recentErrorToasts.set(content, now)
  if (recentErrorToasts.size > 40) {
    for (const [key, at] of recentErrorToasts) {
      if (now - at >= ERROR_TOAST_DEDUP_MS) recentErrorToasts.delete(key)
    }
  }
  ElMessage.error(content)
}
const HTTP_STATUS_MESSAGES = {
  400: '\u8BF7\u6C42\u53C2\u6570\u9519\u8BEF',
  401: '\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55',
  403: '\u65E0\u6743\u9650\u8BBF\u95EE',
  404: '\u8BF7\u6C42\u7684\u8D44\u6E90\u4E0D\u5B58\u5728',
  405: '\u8BF7\u6C42\u65B9\u6CD5\u4E0D\u5141\u8BB8',
  408: '\u8BF7\u6C42\u8D85\u65F6',
  409: '\u6570\u636E\u51B2\u7A81',
  413: '\u4E0A\u4F20\u5185\u5BB9\u8FC7\u5927',
  422: '\u6570\u636E\u6821\u9A8C\u5931\u8D25',
  423: '\u8D26\u53F7\u5DF2\u9501\u5B9A',
  429: '\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5',
  500: '\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF',
  501: '\u670D\u52A1\u672A\u5B9E\u73B0',
  502: '\u7F51\u5173\u9519\u8BEF',
  503: '\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5',
  504: '\u7F51\u5173\u8D85\u65F6',
}
function formatRequestError(error, fallback = '\u8BF7\u6C42\u5931\u8D25') {
  if (error == null) return fallback
  if (typeof error === 'string') {
    return localizeAxiosMessage(error) || fallback
  }
  if (!(error instanceof Error) && typeof error !== 'object') {
    return fallback
  }
  const anyErr = error
  const bizMsg = anyErr.response?.data?.message
  if (typeof bizMsg === 'string' && bizMsg.trim()) {
    return bizMsg.trim()
  }
  const status = anyErr.response?.status
  if (typeof status === 'number' && HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status]
  }
  if (typeof status === 'number') {
    return `\u8BF7\u6C42\u5931\u8D25\uFF08${status}\uFF09`
  }
  if (anyErr.code === 'ECONNABORTED' || /timeout/i.test(anyErr.message || '')) {
    return '\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5'
  }
  if (anyErr.code === 'ERR_NETWORK' || /network error/i.test(anyErr.message || '')) {
    return '\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u540E\u7AEF\u670D\u52A1'
  }
  if (anyErr.message) {
    return localizeAxiosMessage(anyErr.message) || fallback
  }
  return fallback
}
function localizeAxiosMessage(message) {
  const trimmed = message.trim()
  if (!trimmed) return null
  const statusMatch = trimmed.match(/status code\s+(\d+)/i)
  if (statusMatch) {
    const code = Number(statusMatch[1])
    return HTTP_STATUS_MESSAGES[code] || `\u8BF7\u6C42\u5931\u8D25\uFF08${code}\uFF09`
  }
  if (/network error/i.test(trimmed)) {
    return '\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u6216\u540E\u7AEF\u670D\u52A1'
  }
  if (/timeout/i.test(trimmed)) {
    return '\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5'
  }
  if (!/^[A-Za-z0-9\s.,:;'"!?()/_-]+$/.test(trimmed)) {
    return trimmed
  }
  if (/request failed/i.test(trimmed) || /failed/i.test(trimmed)) {
    return '\u8BF7\u6C42\u5931\u8D25'
  }
  return trimmed
}
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const method = (config.method ?? 'get').toUpperCase()
  const rawUrl = config.url ?? ''
  const path = (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`).split('?')[0]
  const fullPath = `/api${path}`
  if (isRegistryLoaded() && !isWhitelisted(fullPath) && !isApiRegistered(method, fullPath)) {
    const key = `${method} ${fullPath}`
    if (!warnedApis.has(key)) {
      warnedApis.add(key)
      showRequestError(
        `\u63A5\u53E3\u672A\u5728\u6743\u9650\u5185\u5BB9\u4E2D\u767B\u8BB0\uFF0C\u65E0\u6CD5\u8BBF\u95EE\uFF1A${key}`,
      )
    }
    return Promise.reject(
      new Error(`\u63A5\u53E3\u672A\u767B\u8BB0\uFF0C\u5DF2\u62E6\u622A\uFF1A${key}`),
    )
  }
  return config
})
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      showRequestError(res.message || '\u8BF7\u6C42\u5931\u8D25')
      return Promise.reject(new Error(res.message || '\u8BF7\u6C42\u5931\u8D25'))
    }
    if (res.data !== void 0) {
      res.data = normalizeDateTimes(res.data)
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    const message = formatRequestError(error)
    if (error && typeof error === 'object') {
      error.message = message
    }
    if (status === 401) {
      void import('@/stores/user').then(({ useUserStore }) => {
        useUserStore().logout(false)
      })
      router.push('/login')
    }
    showRequestError(message)
    return Promise.reject(error)
  },
)
var request_default = request
export { request_default as default, formatRequestError }
