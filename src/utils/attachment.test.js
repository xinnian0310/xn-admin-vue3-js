import { describe, expect, it } from 'vitest'
import {
  insertAttachmentByOrder,
  resolveAttachments,
  seedAttachmentOrders,
  toAttachmentPayload,
} from './attachment'

function item(name, path) {
  return { name, path, size: 1, uploadedAt: '2026-08-16 00:00:00' }
}

describe('insertAttachmentByOrder', () => {
  it('按入队序号排列，而不是完成先后', () => {
    const pathOrder = new Map()
    seedAttachmentOrders([], pathOrder)
    let list = []
    list = insertAttachmentByOrder(list, item('4.pdf', 'p4'), 4, pathOrder)
    list = insertAttachmentByOrder(list, item('1.pdf', 'p1'), 1, pathOrder)
    list = insertAttachmentByOrder(list, item('2.pdf', 'p2'), 2, pathOrder)
    expect(list.map((row) => row.name)).toEqual(['1.pdf', '2.pdf', '4.pdf'])
  })

  it('提交时只带 attachments', () => {
    const payload = toAttachmentPayload([item('a.pdf', 'p/a.pdf'), item('b.txt', 'p/b.txt')])
    expect(payload).toEqual({
      attachments: [item('a.pdf', 'p/a.pdf'), item('b.txt', 'p/b.txt')],
    })
  })

  it('提交时不带上空的 size / uploadedAt', () => {
    const payload = toAttachmentPayload([{ name: 'old.rar', path: 'p/old.rar' }])
    expect(payload.attachments[0]).toEqual({ name: 'old.rar', path: 'p/old.rar' })
    expect(payload.attachments[0]).not.toHaveProperty('size')
    expect(payload.attachments[0]).not.toHaveProperty('uploadedAt')
  })

  it('回显只认 attachments', () => {
    expect(resolveAttachments({ attachments: [item('a.pdf', 'p/a.pdf')] })).toHaveLength(1)
    expect(resolveAttachments({})).toEqual([])
  })

  it('已有附件排在新上传前面', () => {
    const existing = [item('old.pdf', 'old')]
    const pathOrder = new Map()
    seedAttachmentOrders(existing, pathOrder)
    const list = insertAttachmentByOrder(existing, item('new.pdf', 'new'), 10, pathOrder)
    expect(list.map((row) => row.path)).toEqual(['old', 'new'])
  })
})
