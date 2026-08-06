import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function list(params) {
  return request.get('/logs/login', { params })
}
function remove(id) {
  return request.delete(`/logs/login/${id}`)
}
function batchRemove(ids) {
  return request.post('/logs/login/batch-delete', { ids })
}
function clean() {
  return request.delete('/logs/login/clean')
}
function exportLoginLogs(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/logs/login/export${qs}`, 'login-logs.xlsx')
}
export { batchRemove, clean, exportLoginLogs, list, remove }
