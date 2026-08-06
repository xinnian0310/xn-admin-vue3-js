import request from '@/utils/request'
function list(params) {
  return request.get('/dict-data', { params })
}
function get(id) {
  return request.get(`/dict-data/${id}`)
}
function create(data) {
  return request.post('/dict-data', data)
}
function update(id, data) {
  return request.put(`/dict-data/${id}`, data)
}
function remove(id) {
  return request.delete(`/dict-data/${id}`)
}
function batchRemove(ids) {
  return request.post('/dict-data/batch-delete', { ids })
}
function getByType(dictType) {
  return request.get(`/dict-data/type/${dictType}`)
}
export { batchRemove, create, get, getByType, list, remove, update }
