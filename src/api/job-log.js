import request from '@/utils/request'
import { buildQueryString, downloadWithAuth } from '@/utils/download'
function listJobLogs(params) {
  return request.get('/logs/job', { params })
}
function getJobLog(id) {
  return request.get(`/logs/job/${id}`)
}
function removeJobLog(id) {
  return request.delete(`/logs/job/${id}`)
}
function batchRemoveJobLogs(ids) {
  return request.post('/logs/job/batch-delete', { ids })
}
function cleanJobLogs() {
  return request.delete('/logs/job/clean')
}
function exportJobLogs(params) {
  const qs = buildQueryString({ ...(params || {}) })
  return downloadWithAuth(`/api/logs/job/export${qs}`, 'job-logs.xlsx')
}
export { batchRemoveJobLogs, cleanJobLogs, exportJobLogs, getJobLog, listJobLogs, removeJobLog }
