import axios from 'axios'
import request, { formatRequestError } from '@/utils/request'
function getPublicSiteContact() {
  return axios
    .get('/api/site-contact/public', { timeout: 1e4 })
    .then((res) => {
      const data = res.data
      if (data.code !== 200) {
        return Promise.reject(
          new Error(data.message || '\u83B7\u53D6\u8054\u7CFB\u4FE1\u606F\u5931\u8D25'),
        )
      }
      return data
    })
    .catch((error) => {
      return Promise.reject(
        new Error(formatRequestError(error, '\u83B7\u53D6\u8054\u7CFB\u4FE1\u606F\u5931\u8D25')),
      )
    })
}
function getSiteContact() {
  return request.get('/site-contact')
}
function updateSiteContact(data) {
  return request.put('/site-contact', data)
}
function uploadDonationQrcode(file) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/site-contact/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export { getPublicSiteContact, getSiteContact, updateSiteContact, uploadDonationQrcode }
