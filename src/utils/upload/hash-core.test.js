import { describe, expect, it } from 'vitest'
import { HASH_ABORTED, computeFileHash } from './hash-core'
import { bytesToHex, sha256Sync } from './sha256'

function blobOf(size) {
  const data = new Uint8Array(size)
  for (let i = 0; i < size; i++) {
    data[i] = (i * 17 + 3) % 256
  }
  return new Blob([data])
}

describe('computeFileHash', () => {
  it('full 模式产出与 sha256sum 一致的整文件摘要', async () => {
    const size = 5000
    const blob = blobOf(size)
    const expected = bytesToHex(sha256Sync(new Uint8Array(await blob.arrayBuffer())))

    // 分片大小不影响 full 模式的整文件摘要，这正是它能跨 chunkSize 秒传的前提
    for (const chunkSize of [512, 1024, size, size * 2]) {
      const result = await computeFileHash({ file: blob, chunkSize, mode: 'full' })
      expect(result.fileHash).toBe(expected)
    }
  })

  it('tree 模式对每片单独摘要，整体指纹随分片大小变化', async () => {
    const blob = blobOf(3000)
    const small = await computeFileHash({ file: blob, chunkSize: 1000, mode: 'tree' })
    const large = await computeFileHash({ file: blob, chunkSize: 3000, mode: 'tree' })

    expect(small.chunkHashes).toHaveLength(3)
    expect(large.chunkHashes).toHaveLength(1)
    expect(small.fileHash).not.toBe(large.fileHash)

    const firstChunk = new Uint8Array(await blob.slice(0, 1000).arrayBuffer())
    expect(small.chunkHashes[0]).toBe(bytesToHex(sha256Sync(firstChunk)))
  })

  it('两种模式都逐片上报进度', async () => {
    for (const mode of ['tree', 'full']) {
      const loaded = []
      await computeFileHash({
        file: blobOf(2500),
        chunkSize: 1000,
        mode,
        onProgress: (done) => loaded.push(done),
      })
      expect(loaded).toEqual([1000, 2000, 2500])
    }
  })

  it('isAborted 返回 true 时立即中止', async () => {
    let calls = 0
    await expect(
      computeFileHash({
        file: blobOf(10_000),
        chunkSize: 1000,
        mode: 'tree',
        isAborted: () => ++calls > 3,
      }),
    ).rejects.toThrow(HASH_ABORTED)
  })
})
