function filterHiddenMenus(items) {
  return items
    .filter((item) => !item.hidden)
    .map((item) => ({
      ...item,
      children: item.children ? filterHiddenMenus(item.children) : void 0,
    }))
}
function findMenuByPath(items, path) {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children) {
      const found = findMenuByPath(item.children, path)
      if (found) return found
    }
  }
  return void 0
}
function collectOpenMenuIds(items, path, openIds = []) {
  for (const item of items) {
    if (item.path === path) {
      return item.children?.length ? [...openIds, item.id] : openIds
    }
    if (item.children) {
      const found = collectOpenMenuIds(item.children, path, [...openIds, item.id])
      if (found) return found
    }
  }
  return null
}
function getAffixTags(items) {
  const tags = []
  function walk(list) {
    for (const item of list) {
      if (item.affix && item.path) tags.push(item)
      if (item.children) walk(item.children)
    }
  }
  walk(items)
  return tags
}
function findTopLevelMenu(items, path) {
  for (const item of items) {
    if (item.path === path) return item
    if (item.children?.length && collectOpenMenuIds(item.children, path)) {
      return item
    }
  }
  return void 0
}
function findFirstNavigablePath(item) {
  if (item.path) return item.path
  if (!item.children?.length) return void 0
  for (const child of item.children) {
    const path = findFirstNavigablePath(child)
    if (path) return path
  }
  return void 0
}
/** 模糊匹配菜单标题：包含关键词，或字符顺序匹配（忽略大小写） */
function fuzzyMatchMenuTitle(title, keyword) {
  const t = title.toLowerCase()
  const k = keyword.toLowerCase().trim()
  if (!k) return false
  if (t.includes(k)) return true
  let i = 0
  for (const ch of t) {
    if (ch === k[i]) i += 1
    if (i >= k.length) return true
  }
  return false
}
/** 在菜单树中模糊检索标题，深度优先，不跳转 */
function searchMenus(items, keyword) {
  const hits = []
  const k = keyword.trim()
  if (!k) return hits
  function walk(list, ancestors) {
    for (const item of list) {
      if (fuzzyMatchMenuTitle(item.title, k)) {
        hits.push({ id: item.id, title: item.title, ancestorIds: ancestors })
      }
      if (item.children?.length) {
        walk(item.children, [...ancestors, item.id])
      }
    }
  }
  walk(items, [])
  return hits
}
/** 搜索命中项需展开的祖先 id（去重，保序） */
function collectSearchOpenIds(hits) {
  const seen = new Set()
  const ids = []
  for (const hit of hits) {
    for (const id of hit.ancestorIds) {
      if (seen.has(id)) continue
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}
export {
  collectOpenMenuIds,
  collectSearchOpenIds,
  filterHiddenMenus,
  findFirstNavigablePath,
  findMenuByPath,
  findTopLevelMenu,
  fuzzyMatchMenuTitle,
  getAffixTags,
  searchMenus,
}
