import request from '@/utils/request'

/** 业务附件上传：只返回文件名 + 对象路径 */
function uploadAttachment(file) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/attachments/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export { uploadAttachment }
