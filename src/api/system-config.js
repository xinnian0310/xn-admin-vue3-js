import axios from 'axios'
import request, { formatRequestError } from '@/utils/request'
import { APP_CLIENT_ID } from '@/config/client'
function getPublicConfig() {
  return axios
    .get('/api/system-config/public', {
      timeout: 1e4,
      params: { client: APP_CLIENT_ID },
    })
    .then((res) => {
      const data = res.data
      if (data.code !== 200) {
        return Promise.reject(
          new Error(data.message || '\u83B7\u53D6\u7CFB\u7EDF\u914D\u7F6E\u5931\u8D25'),
        )
      }
      return data
    })
    .catch((error) => {
      return Promise.reject(
        new Error(formatRequestError(error, '\u83B7\u53D6\u7CFB\u7EDF\u914D\u7F6E\u5931\u8D25')),
      )
    })
}
function getSystemConfig() {
  return request.get('/system-config')
}
function updateSystemConfig(data) {
  return request.put('/system-config', data)
}
function uploadBrandAsset(file) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/system-config/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export { getPublicConfig, getSystemConfig, updateSystemConfig, uploadBrandAsset }
