import request from '@/utils/request'
function list(params) {
  return request.get('/messages', { params })
}
function get(id) {
  return request.get(`/messages/${id}`)
}
function create(data) {
  return request.post('/messages', data)
}
function update(id, data) {
  return request.put(`/messages/${id}`, data)
}
function remove(id) {
  return request.delete(`/messages/${id}`)
}
function batchRemove(ids) {
  return request.post('/messages/batch-delete', { ids })
}
function send(id, data) {
  return request.post(`/messages/${id}/send`, data)
}
function readers(id) {
  return request.get(`/messages/${id}/readers`)
}
function listMine() {
  return request.get('/messages/mine')
}
function markRead(id) {
  return request.post(`/messages/${id}/read`)
}
function unreadCount() {
  return request.get('/messages/unread-count')
}
function removeMine(id) {
  return request.delete(`/messages/mine/${id}`)
}
function batchRemoveMine(ids) {
  return request.post('/messages/mine/batch-delete', { ids })
}
export {
  batchRemove,
  batchRemoveMine,
  create,
  get,
  list,
  listMine,
  markRead,
  readers,
  remove,
  removeMine,
  send,
  unreadCount,
  update,
}
