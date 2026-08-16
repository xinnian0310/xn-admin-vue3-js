import { resolveAttachmentUrl } from '@/config/app'
import { DEFAULT_UPLOADER_OPTIONS, UploadManager } from '@/utils/upload'

/** 走与 XnUpload 同一套 UploadManager（秒传 / 分片 / 续传） */
export function filePublicUrl(file) {
  if (file.url && /^https?:\/\//i.test(file.url)) return file.url
  return resolveAttachmentUrl(file.path, file.storage)
}

export function uploadEditorFile(file, onProgress) {
  const manager = new UploadManager({ ...DEFAULT_UPLOADER_OPTIONS, fileConcurrency: 1 })
  return new Promise((resolve, reject) => {
    const unsub = manager.subscribe((tasks) => {
      const snap = tasks[0]
      if (!snap) return
      onProgress?.(snap.percent)
      if (snap.status === 'success' && snap.result) {
        unsub()
        manager.dispose()
        resolve(snap.result)
        return
      }
      if (snap.status === 'error' || snap.status === 'cancelled') {
        unsub()
        manager.dispose()
        reject(new Error(snap.error || '上传失败'))
      }
    })
    manager.add([file])
  })
}
