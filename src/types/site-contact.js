const SITE_CONTACT_TYPE_OPTIONS = [
  { value: 'text', label: '\u6587\u672C' },
  { value: 'link', label: '\u94FE\u63A5' },
  { value: 'email', label: '\u90AE\u7BB1' },
  { value: 'qq', label: 'QQ\u7FA4' },
]
function resolveContactType(item) {
  if (item.type === 'text' || item.type === 'link' || item.type === 'email' || item.type === 'qq') {
    return item.type
  }
  if (item.label === '\u4EA4\u6D41\u7FA4' || (item.groups && item.groups.length > 0)) return 'qq'
  if (item.label === '\u90AE\u7BB1' || item.link?.startsWith('mailto:')) return 'email'
  if (item.link) return 'link'
  return 'text'
}
function isQqContact(item) {
  return resolveContactType(item) === 'qq'
}
function contactTypeLabel(type) {
  return SITE_CONTACT_TYPE_OPTIONS.find((o) => o.value === type)?.label || '\u6587\u672C'
}
export { SITE_CONTACT_TYPE_OPTIONS, contactTypeLabel, isQqContact, resolveContactType }
