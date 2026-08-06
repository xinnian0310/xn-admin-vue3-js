import request from '@/utils/request'
function list(params) {
  return request.get('/notices', { params })
}
function get(id) {
  return request.get(`/notices/${id}`)
}
function create(data) {
  return request.post('/notices', data)
}
function update(id, data) {
  return request.put(`/notices/${id}`, data)
}
function remove(id) {
  return request.delete(`/notices/${id}`)
}
function batchRemove(ids) {
  return request.post('/notices/batch-delete', { ids })
}
function publish(id) {
  return request.post(`/notices/${id}/publish`)
}
function batchPublish(ids) {
  return request.post('/notices/batch-publish', { ids })
}
function revoke(id) {
  return request.post(`/notices/${id}/revoke`)
}
function batchRevoke(ids) {
  return request.post('/notices/batch-revoke', { ids })
}
function readers(id) {
  return request.get(`/notices/${id}/readers`)
}
function listMine() {
  return request.get('/notices/mine')
}
function markRead(id) {
  return request.post(`/notices/${id}/read`)
}
export {
  batchPublish,
  batchRemove,
  batchRevoke,
  create,
  get,
  list,
  listMine,
  markRead,
  publish,
  readers,
  remove,
  revoke,
  update,
}
