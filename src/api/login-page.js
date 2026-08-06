import axios from 'axios'
import request, { formatRequestError } from '@/utils/request'
function getActive() {
  return axios
    .get('/api/login-page-configs/active', {
      timeout: 1e4,
    })
    .then((res) => {
      const data = res.data
      if (data.code !== 200) {
        return Promise.reject(
          new Error(data.message || '\u83B7\u53D6\u767B\u5F55\u9875\u914D\u7F6E\u5931\u8D25'),
        )
      }
      return data
    })
    .catch((error) => {
      return Promise.reject(
        new Error(
          formatRequestError(error, '\u83B7\u53D6\u767B\u5F55\u9875\u914D\u7F6E\u5931\u8D25'),
        ),
      )
    })
}
function list(params) {
  return request.get('/login-page-configs', {
    params,
  })
}
function get(id) {
  return request.get(`/login-page-configs/${id}`)
}
function create(data) {
  return request.post('/login-page-configs', data)
}
function update(id, data) {
  return request.put(`/login-page-configs/${id}`, data)
}
function updateStatus(id, status) {
  return request.put(`/login-page-configs/${id}/status`, { status })
}
function remove(id) {
  return request.delete(`/login-page-configs/${id}`)
}
function batchRemove(ids) {
  return request.post('/login-page-configs/batch-delete', {
    ids,
  })
}
export { batchRemove, create, get, getActive, list, remove, update, updateStatus }
