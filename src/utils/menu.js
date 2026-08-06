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
export {
  collectOpenMenuIds,
  filterHiddenMenus,
  findFirstNavigablePath,
  findMenuByPath,
  findTopLevelMenu,
  getAffixTags,
}
