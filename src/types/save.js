function saveDialogTitle(mode, entity) {
  const prefix = { add: '\u65B0\u589E', edit: '\u7F16\u8F91', view: '\u67E5\u770B' }[mode]
  return `${prefix}${entity}`
}
export { saveDialogTitle }
