function estimateTableActionsWidth(items) {
  const names = (items ?? [])
    .map((item) => (typeof item === 'string' ? item : item?.name))
    .filter((name) => !!name && !!String(name).trim())
  if (!names.length) return 100
  const gap = 4
  const cellPadding = 24
  const safety = 12
  let content = 0
  names.forEach((name, index) => {
    let textWidth = 0
    for (const ch of name) {
      textWidth += /[\u4e00-\u9fff]/.test(ch) ? 14 : 8
    }
    content += textWidth + 4
    if (index > 0) content += gap
  })
  return Math.ceil(content + cellPadding + safety) + 50
}
export { estimateTableActionsWidth }
