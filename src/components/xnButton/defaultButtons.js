import { Delete, Edit, Plus, View } from '@element-plus/icons-vue'
const XN_BUTTON_NAMES = {
  ADD: '\u65B0\u589E',
  EDIT: '\u7F16\u8F91',
  VIEW: '\u67E5\u770B',
  DELETE: '\u5220\u9664',
}
function createDefaultButtonList(permissions = {}) {
  return [
    {
      name: XN_BUTTON_NAMES.ADD,
      action: 'add',
      type: 'button',
      icon: Plus,
      typeColor: 'primary',
      permission: permissions.create,
    },
    {
      name: XN_BUTTON_NAMES.EDIT,
      action: 'edit',
      type: 'button',
      icon: Edit,
      typeColor: 'primary',
      permission: permissions.update,
      index: 0,
    },
    {
      name: XN_BUTTON_NAMES.VIEW,
      action: 'view',
      type: 'button',
      icon: View,
      typeColor: 'primary',
      permission: permissions.view,
      index: 0,
    },
    {
      name: XN_BUTTON_NAMES.DELETE,
      action: 'delete',
      type: 'button',
      icon: Delete,
      typeColor: 'danger',
      permission: permissions.delete,
    },
  ]
}
export { XN_BUTTON_NAMES, createDefaultButtonList }
