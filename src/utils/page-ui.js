import { resolveIcon } from '@/utils/icons'
function mapSearchItems(items) {
  return items.map((item) => ({
    label: item.label,
    prop: item.prop,
    type: item.type,
    placeholder: item.placeholder,
    width: item.width,
    clearable: item.clearable,
    multiple: item.multiple,
    options: item.options,
  }))
}
function mapButtonItems(items) {
  return items.map((item) => ({
    name: item.name,
    type: item.type ?? 'button',
    icon: resolveIconName(item.icon),
    typeColor: item.typeColor,
    permission: item.permission,
    // 避免后端 JSON 的 index: null 被当成「必须选中 1 条」
    index: item.index == null ? void 0 : item.index,
    disabled: item.disabled ?? false,
    searchItem: item.searchItem?.map((sub) => ({
      name: sub.name,
      icon: resolveIconName(sub.icon),
      permission: sub.permission,
      action: sub.action,
    })),
    action: item.action,
  }))
}
function resolveIconName(name) {
  if (!name) return void 0
  return resolveIcon(name)
}
function resolveButtonAction(item) {
  return item.action || item.name
}
export { mapButtonItems, mapSearchItems, resolveButtonAction }
