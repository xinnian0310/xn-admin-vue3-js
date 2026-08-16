import request from '@/utils/request'
import { APP_CLIENT_ID } from '@/config/client'

function list(params) {
  return request.get('/routes/tree', { params })
}
function get(id) {
  return request.get(`/routes/${id}`)
}
function create(data) {
  return request.post('/routes', data)
}
function update(id, data) {
  return request.put(`/routes/${id}`, data)
}
function remove(id) {
  return request.delete(`/routes/${id}`)
}
function batchRemove(ids) {
  return request.post('/routes/batch-delete', { ids })
}
function generate(id, data) {
  return request.post(`/routes/${id}/generate`, {
    ...data,
    clientId: data?.clientId || APP_CLIENT_ID,
  })
}
export { batchRemove, create, generate, get, list, remove, update }
