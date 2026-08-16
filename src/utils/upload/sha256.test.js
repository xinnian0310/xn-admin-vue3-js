import { describe, expect, it } from 'vitest'
import { Sha256, bytesToHex, sha256Sync } from './sha256'

function bytes(text) {
  return new TextEncoder().encode(text)
}

function hex(text) {
  return bytesToHex(sha256Sync(bytes(text)))
}

describe('sha256', () => {
  it('matches the published FIPS-180-4 vectors', () => {
    expect(hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
    expect(hex('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    )
  })

  /** 长度落在 55/56/63/64 附近时会切换单块/双块补位分支，是自带实现最容易写错的地方 */
  it('pads correctly around the block boundary', () => {
    const expected = {
      55: '9f4390f8d30c2dd92ec9f095b65e2b9ae9b0a925a5258e241c9f1e910f734318',
      56: 'b35439a4ac6f0948b6d6f9e3c6af0f5f590ce20f1bde7090ef7970686ec6738a',
      63: '7d3e74a05d7db15bce4ad9ec0658ea98e3f06eeecf16b4c6fff2da457ddc2f34',
      64: 'ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb',
    }
    for (const [length, digest] of Object.entries(expected)) {
      expect(hex('a'.repeat(Number(length)))).toBe(digest)
    }
  })

  it('produces the same digest whatever the update chunking is', () => {
    const payload = bytes('x'.repeat(1000) + 'tail')
    const oneShot = bytesToHex(sha256Sync(payload))

    for (const step of [1, 7, 64, 65, 333]) {
      const hash = new Sha256()
      for (let offset = 0; offset < payload.length; offset += step) {
        hash.update(payload.subarray(offset, Math.min(offset + step, payload.length)))
      }
      expect(bytesToHex(hash.digest())).toBe(oneShot)
    }
  })

  it('agrees with the native WebCrypto digest', async () => {
    const payload = new Uint8Array(200_000)
    for (let i = 0; i < payload.length; i++) {
      payload[i] = (i * 31 + 7) % 256
    }
    const native = new Uint8Array(await crypto.subtle.digest('SHA-256', payload))
    expect(bytesToHex(sha256Sync(payload))).toBe(bytesToHex(native))
  })

  it('rejects reuse after digest', () => {
    const hash = new Sha256()
    hash.update(bytes('abc'))
    hash.digest()
    expect(() => hash.update(bytes('abc'))).toThrow()
    expect(() => hash.digest()).toThrow()
  })
})
