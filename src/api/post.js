import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function list(params) {
  return request.get('/posts', { params })
}
function get(id) {
  return request.get(`/posts/${id}`)
}
function create(data) {
  return request.post('/posts', data)
}
function update(id, data) {
  return request.put(`/posts/${id}`, data)
}
function remove(id) {
  return request.delete(`/posts/${id}`)
}
function batchRemove(ids) {
  return request.post('/posts/batch-delete', { ids })
}
function updateStatus(id, status) {
  return request.put(`/posts/${id}/status`, null, { params: { status } })
}
function getOptions() {
  return request.get('/posts/options')
}
function importPosts(rows) {
  return request.post('/posts/import', rows)
}
function exportPosts(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/posts/export${qs}`, 'posts.xlsx')
}
export {
  batchRemove,
  create,
  exportPosts,
  get,
  getOptions,
  importPosts,
  list,
  remove,
  update,
  updateStatus,
}
