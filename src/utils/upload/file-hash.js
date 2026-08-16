import HashWorker from './hash.worker?worker'
import { HASH_ABORTED, computeFileHash } from './hash-core'
import { bytesToHex, sha256Sync } from './sha256'

function isHashAborted(error) {
  return error instanceof Error && error.message === HASH_ABORTED
}

/**
 * 计算文件指纹。优先在 Worker 中执行；Worker 不可用（旧环境 / CSP 限制）时退回主线程，
 * 主线程模式同样是分块读取，只是会阻塞渲染。
 *
 * @param {{ file: File, chunkSize: number, mode: 'tree' | 'full',
 *   onProgress?: (percent: number) => void, signal?: AbortSignal }} options
 * @returns {Promise<{ fileHash: string, chunkHashes: string[] }>}
 */
async function hashFile(options) {
  const worker = createWorker()
  if (!worker) {
    return hashOnMainThread(options)
  }
  try {
    return await hashInWorker(worker, options)
  } finally {
    worker.terminate()
  }
}

/**
 * 不读文件内容的轻量指纹：文件名 + 大小 + 修改时间 + 分片大小。
 *
 * 只能用于断点续传的会话匹配，**不能**用于秒传——元信息相同不代表内容相同，
 * 服务端对 `meta` 算法一律不做秒传命中。
 */
function metaFingerprint(file, chunkSize) {
  const seed = `${file.name}|${file.size}|${file.lastModified}|${chunkSize}`
  return bytesToHex(sha256Sync(new TextEncoder().encode(seed)))
}

function createWorker() {
  if (typeof Worker === 'undefined') return null
  try {
    return new HashWorker()
  } catch {
    return null
  }
}

function hashInWorker(worker, options) {
  const { file, chunkSize, mode, onProgress, signal } = options
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new Error(HASH_ABORTED))
    if (signal?.aborted) {
      onAbort()
      return
    }
    signal?.addEventListener('abort', onAbort, { once: true })

    worker.onmessage = (event) => {
      const data = event.data
      if (data.type === 'progress') {
        onProgress?.(data.total > 0 ? (data.loaded / data.total) * 100 : 100)
        return
      }
      signal?.removeEventListener('abort', onAbort)
      if (data.type === 'done') {
        resolve({ fileHash: data.fileHash, chunkHashes: data.chunkHashes })
      } else {
        reject(new Error(data.message))
      }
    }
    worker.onerror = (event) => {
      signal?.removeEventListener('abort', onAbort)
      reject(new Error(event.message || '指纹计算 Worker 异常'))
    }

    worker.postMessage({ file, chunkSize, mode })
  })
}

function hashOnMainThread(options) {
  const { file, chunkSize, mode, onProgress, signal } = options
  return computeFileHash({
    file,
    chunkSize,
    mode,
    isAborted: () => signal?.aborted === true,
    onProgress: (loaded, total) => onProgress?.(total > 0 ? (loaded / total) * 100 : 100),
  })
}

export { hashFile, isHashAborted, metaFingerprint }
