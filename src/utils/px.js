function parsePxInt(value, fallback = 14) {
  if (!value) return fallback
  const n = Number.parseInt(String(value).replace(/px/gi, '').trim(), 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}
function toPx(value, fallback = 14) {
  const n = Math.floor(Number(value))
  return `${Number.isFinite(n) && n > 0 ? n : fallback}px`
}
export { parsePxInt, toPx }
