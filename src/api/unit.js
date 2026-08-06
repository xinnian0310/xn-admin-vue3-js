import request from '@/utils/request'
function list(params) {
  return request.get('/units/tree', { params })
}
function get(id) {
  return request.get(`/units/${id}`)
}
function create(data) {
  return request.post('/units', data)
}
function update(id, data) {
  return request.put(`/units/${id}`, data)
}
function remove(id) {
  return request.delete(`/units/${id}`)
}
function batchRemove(ids) {
  return request.post('/units/batch-delete', { ids })
}
function getOptions() {
  return request.get('/units/options')
}
function getTree(params) {
  return list(params)
}
function updateStatus(id, status) {
  return request.put(`/units/${id}/status`, { status })
}
function assignRoles(id, roleIds) {
  return request.put(`/units/${id}/roles`, { roleIds })
}
export {
  assignRoles,
  batchRemove,
  create,
  get,
  getOptions,
  getTree,
  list,
  remove,
  update,
  updateStatus,
}
