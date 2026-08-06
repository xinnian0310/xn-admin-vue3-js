import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function list(params) {
  return request.get('/logs/oper', { params })
}
function get(id) {
  return request.get(`/logs/oper/${id}`)
}
function remove(id) {
  return request.delete(`/logs/oper/${id}`)
}
function batchRemove(ids) {
  return request.post('/logs/oper/batch-delete', { ids })
}
function clean() {
  return request.delete('/logs/oper/clean')
}
function exportOperLogs(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/logs/oper/export${qs}`, 'oper-logs.xlsx')
}
export { batchRemove, clean, exportOperLogs, get, list, remove }
