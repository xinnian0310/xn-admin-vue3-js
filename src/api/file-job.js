import request from '@/utils/request'
function listFiles(keyword) {
  return request.get('/files', { params: { keyword } })
}
function browseFiles(prefix, keyword) {
  return request.get('/files/browse', {
    params: { prefix: prefix || '', keyword },
  })
}
function fetchFileTree() {
  return request.get('/files/tree')
}
/**
 * 单请求直传。
 *
 * @param {File} file 待上传文件
 * @param {string} [prefix] 目标目录前缀
 * @param {{ signal?: AbortSignal, onProgress?: (loaded: number) => void, timeout?: number, silentError?: boolean }} [options]
 */
function uploadFile(file, prefix, options) {
  const form = new FormData()
  form.append('file', file)
  if (prefix) form.append('prefix', prefix)
  return request.post('/files/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: options?.signal,
    timeout: options?.timeout,
    silentError: options?.silentError,
    onUploadProgress: options?.onProgress ? (event) => options.onProgress?.(event.loaded) : void 0,
  })
}
function createFileDir(path) {
  return request.post('/files/mkdir', { path })
}
function removeFile(path) {
  return request.delete('/files', { data: { path } })
}
function listJobs(params) {
  return request.get('/jobs', { params })
}
function getJob(id) {
  return request.get(`/jobs/${id}`)
}
function createJob(data) {
  return request.post('/jobs', data)
}
function updateJob(id, data) {
  return request.put(`/jobs/${id}`, data)
}
function removeJob(id) {
  return request.delete(`/jobs/${id}`)
}
function batchRemoveJobs(ids) {
  return request.post('/jobs/batch-delete', { ids })
}
function changeJobStatus(id, status) {
  return request.put(`/jobs/${id}/status`, null, { params: { status } })
}
function runJob(id) {
  return request.post(`/jobs/${id}/run`)
}
export {
  batchRemoveJobs,
  browseFiles,
  changeJobStatus,
  createFileDir,
  createJob,
  fetchFileTree,
  getJob,
  listFiles,
  listJobs,
  removeFile,
  removeJob,
  runJob,
  updateJob,
  uploadFile,
}
