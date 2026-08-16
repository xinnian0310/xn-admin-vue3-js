import { describe, expect, it } from 'vitest'
import { formatBytes, formatDuration, formatSpeed, matchAccept, validateFile } from './format'

function fileOf(name, size, type = '') {
  const file = new File([''], name, { type })
  // File 的 size 由内容决定，测试里只关心校验分支，直接改写更省事
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('formatBytes', () => {
  it('逐级进位到 TB', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1024)).toBe('1.0 KB')
    expect(formatBytes(10 * 1024 * 1024)).toBe('10.0 MB')
    expect(formatBytes(1024 ** 4)).toBe('1.0 TB')
  })

  it('非法输入按 0 处理', () => {
    expect(formatBytes(-1)).toBe('0 B')
    expect(formatBytes(Number.NaN)).toBe('0 B')
  })
})

describe('formatSpeed / formatDuration', () => {
  it('速度加上 /s 后缀，无效值显示占位符', () => {
    expect(formatSpeed(1024 * 1024)).toBe('1.0 MB/s')
    expect(formatSpeed(0)).toBe('-')
  })

  it('剩余时间在超过一小时时补上小时段，负数表示无法估算', () => {
    expect(formatDuration(0)).toBe('00:00')
    expect(formatDuration(75)).toBe('01:15')
    expect(formatDuration(3671)).toBe('1:01:11')
    expect(formatDuration(-1)).toBe('-')
  })
})

describe('matchAccept', () => {
  it('支持扩展名、精确 MIME 与 MIME 通配三种写法', () => {
    const mp4 = fileOf('movie.MP4', 100, 'video/mp4')
    expect(matchAccept(mp4, ['.mp4'])).toBe(true)
    expect(matchAccept(mp4, ['video/mp4'])).toBe(true)
    expect(matchAccept(mp4, ['video/*'])).toBe(true)
    expect(matchAccept(mp4, ['image/*', '.zip'])).toBe(false)
  })

  it('空规则表示不限制', () => {
    expect(matchAccept(fileOf('a.bin', 1), [])).toBe(true)
  })

  it('浏览器识别不出 MIME 时仍可用扩展名兜底', () => {
    const unknown = fileOf('archive.7z', 100)
    expect(matchAccept(unknown, ['.7z'])).toBe(true)
    expect(matchAccept(unknown, ['application/x-7z-compressed'])).toBe(false)
  })
})

describe('validateFile', () => {
  it('通过校验时返回 null', () => {
    expect(validateFile(fileOf('a.mp4', 1024, 'video/mp4'), { maxSize: 2048 })).toBeNull()
  })

  it('允许空文件，分别拦截超限、过小与类型不符', () => {
    expect(validateFile(fileOf('empty.txt', 0), {})).toBeNull()
    expect(validateFile(fileOf('big.mp4', 4096), { maxSize: 2048 })).toContain('超过大小上限')
    expect(validateFile(fileOf('tiny.mp4', 10), { minSize: 100 })).toContain('小于最小体积')
    expect(validateFile(fileOf('a.txt', 100, 'text/plain'), { accept: ['video/*'] })).toContain(
      '不支持的文件类型',
    )
  })
})
