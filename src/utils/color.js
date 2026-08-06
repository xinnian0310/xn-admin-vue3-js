function clamp(n) {
  return Math.min(255, Math.max(0, Math.round(n)))
}
function parseHex(hex) {
  const raw = hex.replace('#', '').trim()
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16)
    const g = parseInt(raw[1] + raw[1], 16)
    const b = parseInt(raw[2] + raw[2], 16)
    return [r, g, b]
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16)
    const g = parseInt(raw.slice(2, 4), 16)
    const b = parseInt(raw.slice(4, 6), 16)
    if ([r, g, b].some((v) => Number.isNaN(v))) return null
    return [r, g, b]
  }
  return null
}
function toHex(r, g, b) {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`
}
function mixHex(hex, target, weight) {
  const rgb = parseHex(hex)
  const t = parseHex(target)
  if (!rgb || !t) return hex
  const w = Math.min(1, Math.max(0, weight))
  return toHex(
    rgb[0] + (t[0] - rgb[0]) * w,
    rgb[1] + (t[1] - rgb[1]) * w,
    rgb[2] + (t[2] - rgb[2]) * w,
  )
}
function hexToRgbCss(hex) {
  const rgb = parseHex(hex)
  if (!rgb) return '64, 158, 255'
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
}
function relativeLuminance(hex) {
  const rgb = parseHex(hex)
  if (!rgb) return 0
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function isLightColor(hex) {
  return relativeLuminance(hex) > 0.55
}
function buildPrimaryScale(primary) {
  return {
    primary,
    'light-3': mixHex(primary, '#ffffff', 0.3),
    'light-5': mixHex(primary, '#ffffff', 0.5),
    'light-7': mixHex(primary, '#ffffff', 0.7),
    'light-8': mixHex(primary, '#ffffff', 0.8),
    'light-9': mixHex(primary, '#ffffff', 0.9),
    'dark-2': mixHex(primary, '#000000', 0.2),
    rgb: hexToRgbCss(primary),
  }
}
export { buildPrimaryScale, hexToRgbCss, isLightColor, mixHex, parseHex, relativeLuminance, toHex }
