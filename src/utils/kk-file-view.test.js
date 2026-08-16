import { describe, expect, it } from 'vitest'
import { buildKkFileViewPreviewUrl, encodeKkFileViewUrl } from './kk-file-view'

function decodeOrigin(previewUrl) {
  const encoded = decodeURIComponent(previewUrl.split('url=')[1].split('&')[0])
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

describe('buildKkFileViewPreviewUrl', () => {
  it('按 kkFileView 5.0 拼 onlinePreview', () => {
    const fileUrl = 'http://127.0.0.1:9000/xn-admin/a.pdf'
    const url = buildKkFileViewPreviewUrl('http://127.0.0.1:8012/', fileUrl, 'a.pdf')
    expect(url).toBe(
      `http://127.0.0.1:8012/onlinePreview?url=${encodeURIComponent(encodeKkFileViewUrl(fileUrl))}`,
    )
  })

  it('无后缀时把文件名写进源地址再编码', () => {
    const fileUrl = 'http://127.0.0.1:9000/xn-admin/uuid'
    const url = buildKkFileViewPreviewUrl('http://127.0.0.1:8012', fileUrl, '说明.docx')
    const origin = decodeOrigin(url)
    expect(origin).toBe(`${fileUrl}?fullfilename=${encodeURIComponent('说明.docx')}`)
    expect(url).not.toContain('&fullfilename=')
  })
})
