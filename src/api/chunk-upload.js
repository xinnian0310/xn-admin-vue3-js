import request from '@/utils/request'

/**
 * 大文件分片上传接口。
 *
 * 指纹算法（`hashAlgo`）取值：
 * - `sha256-tree`：各分片摘要拼接后再摘要，全程走原生实现，速度快；取值依赖分片大小。
 * - `sha256`：整文件全量摘要，与 `sha256sum` 一致，但需纯 JS 增量计算，较慢。
 * - `meta`：由文件名/大小/修改时间派生，不读文件内容；服务端不会用它做秒传。
 */

/** 秒传探测；同时返回可续传的会话（若有） */
function checkChunkUpload(payload) {
  return request.post('/files/chunk/check', payload)
}

/** 初始化上传；同一用户重复初始化同一文件会复用未完成会话 */
function initChunkUpload(payload) {
  return request.post('/files/chunk/init', payload)
}

/** 查询会话状态与已上传分片清单 */
function getChunkUploadStatus(uploadId) {
  return request.get(`/files/chunk/${uploadId}/status`)
}

/**
 * 上传单个分片。
 *
 * `silentError` 让失败不弹提示——分片失败会自动重试，逐次弹窗会刷屏，
 * 最终是否提示由上传任务在重试全部失败后决定。
 *
 * @param {{ uploadId: string, chunkIndex: number, blob: Blob, chunkHash?: string,
 *   signal?: AbortSignal, timeout?: number, onProgress?: (loaded: number) => void }} options
 */
function uploadChunkPart(options) {
  const form = new FormData()
  form.append('chunkIndex', String(options.chunkIndex))
  if (options.chunkHash) {
    form.append('chunkHash', options.chunkHash)
  }
  // 用固定 ASCII 名，避免中文原名在 multipart 里的编码差异；服务端只认会话里的文件名
  form.append('file', options.blob, `chunk-${options.chunkIndex}.bin`)
  return request.post(`/files/chunk/${options.uploadId}/part`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: options.signal,
    timeout: options.timeout ?? 0,
    silentError: true,
    onUploadProgress: (event) => options.onProgress?.(event.loaded),
  })
}

/** 合并分片；幂等，可安全重试。失败不弹提示，由上传任务落到 error 状态后统一展示 */
function completeChunkUpload(uploadId) {
  return request.post(`/files/chunk/${uploadId}/complete`, null, {
    timeout: 0,
    silentError: true,
  })
}

/** 取消上传并清理已上传分片 */
function cancelChunkUpload(uploadId) {
  return request.delete(`/files/chunk/${uploadId}`, { silentError: true })
}

export {
  cancelChunkUpload,
  checkChunkUpload,
  completeChunkUpload,
  getChunkUploadStatus,
  initChunkUpload,
  uploadChunkPart,
}
