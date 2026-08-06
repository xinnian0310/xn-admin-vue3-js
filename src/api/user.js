import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function list(params) {
  return request.get('/users', { params })
}
function get(id) {
  return request.get(`/users/${id}`)
}
function create(data) {
  return request.post('/users', data)
}
function update(id, data) {
  return request.put(`/users/${id}`, data)
}
function remove(id) {
  return request.delete(`/users/${id}`)
}
function batchRemove(ids) {
  return request.post('/users/batch-delete', { ids })
}
function updateStatus(id, status) {
  return request.patch(`/users/${id}/status`, { status })
}
function importUsers(rows) {
  return request.post('/users/import', rows)
}
function exportUsers(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/users/export${qs}`, 'users.xlsx')
}
export { batchRemove, create, exportUsers, get, importUsers, list, remove, update, updateStatus }
