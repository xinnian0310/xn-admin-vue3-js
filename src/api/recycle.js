import request from '@/utils/request'
function listRecycle(params) {
  return request.get('/recycle', { params })
}
function restoreRecycle(id) {
  return request.post(`/recycle/${id}/restore`)
}
function purgeRecycle(id) {
  return request.delete(`/recycle/${id}`)
}
function batchPurgeRecycle(ids) {
  return request.post('/recycle/batch-delete', { ids })
}
function cleanRecycle() {
  return request.delete('/recycle/clean')
}
export { batchPurgeRecycle, cleanRecycle, listRecycle, purgeRecycle, restoreRecycle }
