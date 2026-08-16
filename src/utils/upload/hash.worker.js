import { computeFileHash } from './hash-core'

/** 指纹计算 Worker：把整文件读取与摘要计算搬离主线程，避免大文件卡住界面。 */

/** 大文件分片数可达上万，进度消息需要节流，否则光发消息就占掉不少时间 */
const PROGRESS_INTERVAL = 120

self.addEventListener('message', (event) => {
  const { file, chunkSize, mode } = event.data
  let lastPostAt = 0

  computeFileHash({
    file,
    chunkSize,
    mode,
    onProgress: (loaded, total) => {
      const now = Date.now()
      if (loaded < total && now - lastPostAt < PROGRESS_INTERVAL) return
      lastPostAt = now
      self.postMessage({ type: 'progress', loaded, total })
    },
  })
    .then((result) => {
      self.postMessage({
        type: 'done',
        fileHash: result.fileHash,
        chunkHashes: result.chunkHashes,
      })
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : '指纹计算失败'
      self.postMessage({ type: 'error', message })
    })
})
