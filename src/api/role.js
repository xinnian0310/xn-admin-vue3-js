import request from '@/utils/request'
function list(params) {
  return request.get('/roles', { params })
}
function get(id) {
  return request.get(`/roles/${id}`)
}
function create(data) {
  return request.post('/roles', data)
}
function update(id, data) {
  return request.put(`/roles/${id}`, data)
}
function remove(id) {
  return request.delete(`/roles/${id}`)
}
function batchRemove(ids) {
  return request.post('/roles/batch-delete', { ids })
}
function getOptions() {
  return request.get('/roles/options')
}
function updateStatus(id, status) {
  return request.put(`/roles/${id}/status`, { status })
}
function assignPermissions(id, permissionIds) {
  return request.put(`/roles/${id}/permissions`, { permissionIds })
}
export {
  assignPermissions,
  batchRemove,
  create,
  get,
  getOptions,
  list,
  remove,
  update,
  updateStatus,
}
