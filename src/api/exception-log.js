import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function list(params) {
  return request.get('/logs/exception', { params })
}
function get(id) {
  return request.get(`/logs/exception/${id}`)
}
function remove(id) {
  return request.delete(`/logs/exception/${id}`)
}
function batchRemove(ids) {
  return request.post('/logs/exception/batch-delete', { ids })
}
function clean() {
  return request.delete('/logs/exception/clean')
}
function exportExceptionLogs(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/logs/exception/export${qs}`, 'exception-logs.xlsx')
}
export { batchRemove, clean, exportExceptionLogs, get, list, remove }
