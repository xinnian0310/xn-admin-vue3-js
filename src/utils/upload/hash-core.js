import { Sha256, bytesToHex, sha256Sync } from './sha256'

const HASH_ABORTED = 'HASH_ABORTED'

/** 原生摘要仅在安全上下文可用，缺失时退回纯 JS 实现 */
const subtle = typeof crypto !== 'undefined' ? crypto.subtle : void 0

async function digestBytes(bytes) {
  if (subtle) {
    return new Uint8Array(await subtle.digest('SHA-256', bytes))
  }
  return sha256Sync(bytes)
}

/**
 * 分块读取文件并计算指纹，读完一块即释放，10GB 文件也不会把内存打满。
 *
 * - `tree`：对每片算原生 SHA-256，再对「所有分片摘要拼接」算一次 SHA-256。
 *   全程走原生实现，速度快；代价是指纹取值依赖 chunkSize（服务端比对时会带上）。
 * - `full`：整文件真实 SHA-256，与 `sha256sum` 结果一致，用纯 JS 增量实现，明显慢于 `tree`。
 *
 * @param {{ file: Blob, chunkSize: number, mode: 'tree' | 'full',
 *   onProgress?: (loaded: number, total: number) => void, isAborted?: () => boolean }} options
 * @returns {Promise<{ fileHash: string, chunkHashes: string[] }>}
 */
async function computeFileHash(options) {
  const { file, chunkSize, mode, onProgress, isAborted } = options
  const total = file.size
  const chunkHashes = []
  const digests = []
  const fullHash = mode === 'full' ? new Sha256() : null

  for (let start = 0; start < total; start += chunkSize) {
    if (isAborted?.()) throw new Error(HASH_ABORTED)
    const end = Math.min(start + chunkSize, total)
    const bytes = new Uint8Array(await file.slice(start, end).arrayBuffer())

    if (fullHash) fullHash.update(bytes)
    const digest = await digestBytes(bytes)
    chunkHashes.push(bytesToHex(digest))
    if (!fullHash) digests.push(digest)

    onProgress?.(end, total)
  }

  if (fullHash) {
    return { fileHash: bytesToHex(fullHash.digest()), chunkHashes }
  }

  const merged = new Uint8Array(digests.length * 32)
  digests.forEach((digest, index) => merged.set(digest, index * 32))
  return { fileHash: bytesToHex(await digestBytes(merged)), chunkHashes }
}

export { HASH_ABORTED, computeFileHash }
