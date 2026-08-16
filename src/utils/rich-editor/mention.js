import request from '@/utils/request'

/** @ 提及：独立浮层输入，避免编辑器 change 立刻关掉弹层 */
export function createMentionConfig() {
  let panel = null
  let input = null
  let listEl = null
  let editor = null
  let items = []
  let active = 0
  let searchSeq = 0

  function ensurePanel() {
    if (panel) return
    panel = document.createElement('div')
    panel.className = 'xn-mention-panel'
    panel.innerHTML =
      '<input class="xn-mention-panel__input" type="text" placeholder="搜索用户，回车插入" />' +
      '<ul class="xn-mention-panel__list"></ul>'
    input = panel.querySelector('input')
    listEl = panel.querySelector('ul')
    document.body.appendChild(panel)

    panel.addEventListener('mousedown', (event) => event.stopPropagation())
    input?.addEventListener('input', () => {
      void loadUsers(input?.value || '')
    })
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        move(1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        move(-1)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        confirmActive()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        hideModal()
        editor?.restoreSelection()
      }
    })
  }

  function renderList() {
    if (!listEl) return
    if (!items.length) {
      listEl.innerHTML = '<li class="xn-mention-panel__empty">无匹配用户，回车按当前文字插入</li>'
      return
    }
    listEl.innerHTML = items
      .map((item, index) => {
        const extra = item.extra ? `<span>${escapeHtml(item.extra)}</span>` : ''
        const cls = index === active ? ' is-active' : ''
        return `<li class="xn-mention-panel__item${cls}" data-index="${index}">${escapeHtml(item.name)}${extra}</li>`
      })
      .join('')
    listEl.querySelectorAll('[data-index]').forEach((li) => {
      li.addEventListener('mouseenter', () => {
        active = Number(li.dataset.index)
        renderList()
      })
      li.addEventListener('mousedown', (event) => {
        event.preventDefault()
        insertItem(items[Number(li.dataset.index)])
      })
    })
  }

  function move(step) {
    if (!items.length) return
    active = (active + step + items.length) % items.length
    renderList()
  }

  function confirmActive() {
    const typed = (input?.value || '').trim()
    insertItem(items[active] || (typed ? { name: typed } : undefined))
  }

  function insertItem(item) {
    if (!editor || !item?.name) return
    const mentionNode = {
      type: 'mention',
      value: item.name,
      info: { id: item.id, username: item.extra || item.name },
      children: [{ text: '' }],
    }
    editor.restoreSelection()
    editor.deleteBackward('character')
    editor.insertNode(mentionNode)
    editor.move(1)
    hideModal()
  }

  async function loadUsers(keyword) {
    const seq = ++searchSeq
    try {
      const res = await request.get('/users', {
        params: { page: 1, size: 15, keyword: keyword || undefined },
        silentError: true,
      })
      if (seq !== searchSeq) return
      const records = res.data?.records || []
      items = records.map((user) => ({
        id: user.id,
        name: user.nickname || user.username || String(user.id),
        extra: user.nickname && user.username ? user.username : '',
      }))
    } catch {
      if (seq !== searchSeq) return
      items = []
    }
    const typed = (input?.value || '').trim()
    if (typed && !items.some((item) => item.name === typed)) {
      items = [...items, { name: typed }]
    }
    active = 0
    renderList()
  }

  function showModal(ed) {
    editor = ed
    ensurePanel()
    const range = document.getSelection()?.rangeCount
      ? document.getSelection()?.getRangeAt(0)
      : null
    const rect = range?.getBoundingClientRect()
    if (panel && rect) {
      panel.style.display = 'block'
      panel.style.top = `${Math.min(rect.bottom + 6, window.innerHeight - 220)}px`
      panel.style.left = `${Math.min(rect.left, window.innerWidth - 280)}px`
    }
    if (input) {
      input.value = ''
      window.setTimeout(() => input?.focus(), 0)
    }
    void loadUsers('')
  }

  function hideModal() {
    if (panel) panel.style.display = 'none'
  }

  function dispose() {
    hideModal()
    panel?.remove()
    panel = null
    input = null
    listEl = null
    editor = null
  }

  return { showModal, hideModal, dispose }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
