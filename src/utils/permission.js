function filterMenusByPermission(items, permissions) {
  const permSet = new Set(permissions)
  return items
    .map((item) => {
      if (item.hidden) return null
      const children = item.children ? filterMenusByPermission(item.children, permissions) : void 0
      const hasPermission = !item.permission || permSet.has(item.permission)
      const hasVisibleChild = children && children.length > 0
      if (!hasPermission && !hasVisibleChild) return null
      if (item.path && !hasPermission) return null
      return {
        ...item,
        children: hasVisibleChild ? children : void 0,
      }
    })
    .filter((item) => item !== null)
}
export { filterMenusByPermission }
