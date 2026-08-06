import request from '@/utils/request'
function list(params) {
  return request.get('/dict-types', { params })
}
function get(id) {
  return request.get(`/dict-types/${id}`)
}
function create(data) {
  return request.post('/dict-types', data)
}
function update(id, data) {
  return request.put(`/dict-types/${id}`, data)
}
function remove(id) {
  return request.delete(`/dict-types/${id}`)
}
function batchRemove(ids) {
  return request.post('/dict-types/batch-delete', { ids })
}
function getOptions() {
  return request.get('/dict-types/options')
}
export { batchRemove, create, get, getOptions, list, remove, update }
