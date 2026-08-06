<template>
  <el-dialog
    v-model="visible"
    :title="`分配权限 - ${menuName}`"
    width="920px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="接口" name="api">
        <PermissionAssignPanel
          :items="groups.api"
          type="API"
          :menu-id="menuId"
          @changed="loadGroups"
        />
      </el-tab-pane>
      <el-tab-pane label="按钮" name="button">
        <PermissionAssignPanel
          :items="groups.button"
          type="BUTTON"
          :menu-id="menuId"
          :button-prefix="buttonPrefix"
          @changed="loadGroups"
        />
      </el-tab-pane>
      <el-tab-pane label="表格操作列按钮" name="tableButton">
        <PermissionAssignPanel
          :items="groups.tableButton"
          type="TABLE_BUTTON"
          :menu-id="menuId"
          :button-prefix="buttonPrefix"
          @changed="loadGroups"
        />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button type="primary" @click="visible = false">完成</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { getMenuGroups } from '@/api/permission'
import PermissionAssignPanel from './assign-panel.vue'
defineOptions({ name: 'PermissionAssign' })
const emit = defineEmits(['success'])
const visible = ref(false)
const activeTab = ref('api')
const menuId = ref(0)
const menuName = ref('')
const groups = reactive({
  menuId: 0,
  menuName: '',
  menuCode: '',
  api: [],
  button: [],
  tableButton: [],
})
const buttonPrefix = computed(() => {
  const code = groups.menuCode ?? ''
  const parts = code.split(':')
  return parts[parts.length - 1] || ''
})
async function loadGroups() {
  if (!menuId.value) return
  const res = await getMenuGroups(menuId.value)
  Object.assign(groups, res.data)
  emit('success')
}
async function open(id, name) {
  menuId.value = id
  menuName.value = name
  activeTab.value = 'api'
  visible.value = true
  await loadGroups()
}
function handleClosed() {
  menuId.value = 0
  menuName.value = ''
  groups.menuCode = ''
  groups.api = []
  groups.button = []
  groups.tableButton = []
}
defineExpose({ open })
</script>
