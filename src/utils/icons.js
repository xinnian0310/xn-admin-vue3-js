import { markRaw } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
const elementIconMap = ElementPlusIcons
const svgModules = import.meta.glob('../assets/icons/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const svgRawMap = /* @__PURE__ */ new Map()
for (const [path, raw] of Object.entries(svgModules)) {
  const file = path.split('/').pop() || ''
  const name = file.replace(/\.svg$/i, '')
  if (name) svgRawMap.set(name, raw)
}
function parseIcon(value) {
  if (!value?.trim()) return null
  const raw = value.trim()
  if (raw.startsWith('svg:')) {
    return { type: 'svg', value: raw, name: raw.slice(4) }
  }
  if (raw.startsWith('element:') || raw.startsWith('ep:')) {
    const name = raw.includes(':') ? raw.slice(raw.indexOf(':') + 1) : raw
    return { type: 'element', value: name, name }
  }
  if (raw.includes(':')) {
    return { type: 'iconify', value: raw, name: raw }
  }
  return { type: 'element', value: raw, name: raw }
}
function resolveElementIcon(name) {
  if (!name) return void 0
  const comp = elementIconMap[name]
  return comp ? markRaw(comp) : void 0
}
function resolveIcon(name) {
  const parsed = parseIcon(name)
  if (!parsed || parsed.type !== 'element') return void 0
  return resolveElementIcon(parsed.name)
}
function listElementIconNames() {
  return Object.keys(elementIconMap).sort((a, b) => a.localeCompare(b))
}
function listSvgIconNames() {
  return Array.from(svgRawMap.keys()).sort((a, b) => a.localeCompare(b))
}
function getSvgRaw(name) {
  return svgRawMap.get(name)
}
function buildIconValue(type, name) {
  const n = name.trim()
  if (!n) return ''
  if (type === 'svg') return `svg:${n.replace(/^svg:/, '')}`
  if (type === 'iconify') return n
  return n.replace(/^(element|ep):/, '')
}
const ICONIFY_PRESETS = [
  'mdi:home',
  'mdi:view-dashboard',
  'mdi:account',
  'mdi:account-group',
  'mdi:shield-account',
  'mdi:lock',
  'mdi:key',
  'mdi:cog',
  'mdi:menu',
  'mdi:file-tree',
  'mdi:routes',
  'mdi:database',
  'mdi:cloud',
  'mdi:server',
  'mdi:bell',
  'mdi:chart-box',
  'mdi:clipboard-list',
  'mdi:folder',
  'carbon:settings',
  'carbon:user-multiple',
  'carbon:security',
  'carbon:api',
  'ri:dashboard-line',
  'ri:settings-3-line',
  'ri:shield-keyhole-line',
  'ri:route-line',
]
export {
  ICONIFY_PRESETS,
  buildIconValue,
  getSvgRaw,
  elementIconMap as iconMap,
  listElementIconNames,
  listSvgIconNames,
  parseIcon,
  resolveElementIcon,
  resolveIcon,
}
