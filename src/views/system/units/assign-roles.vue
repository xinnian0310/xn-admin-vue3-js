<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="480px"
    destroy-on-close
    @closed="handleClosed"
  >
    <div v-if="unitName" class="assign-tip">单位：{{ unitName }}</div>
    <el-select
      v-model="roleIds"
      multiple
      filterable
      clearable
      placeholder="选择默认角色"
      style="width: 100%"
    >
      <el-option v-for="r in availableRoles" :key="r.id" :label="r.name" :value="r.id" />
    </el-select>
    <div class="form-tip">单位下用户将自动继承所选角色，无需再逐个分配</div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { assignRoles, get as getUnit } from '@/api/unit'
import { getOptions as getRoleOptions } from '@/api/role'
import { usePermission } from '@/directives/permission'
defineOptions({ name: 'UnitsAssignRoles' })
const emit = defineEmits(['success'])
const { isSuperAdmin } = usePermission()
const visible = ref(false)
const submitting = ref(false)
const unitId = ref(null)
const unitName = ref('')
const roleIds = ref([])
const roleOptions = ref([])
const availableRoles = computed(() =>
  isSuperAdmin.value
    ? roleOptions.value
    : roleOptions.value.filter((r) => r.code !== 'SUPER_ADMIN'),
)
async function open(row) {
  unitId.value = row.id
  unitName.value = row.name
  if (!roleOptions.value.length) {
    const res = await getRoleOptions()
    roleOptions.value = res.data || []
  }
  const detail = await getUnit(row.id)
  roleIds.value = detail.data.roleIds?.length
    ? [...detail.data.roleIds]
    : (detail.data.roleList || []).map((r) => r.id)
  visible.value = true
}
async function handleSubmit() {
  if (unitId.value == null) return
  submitting.value = true
  try {
    await assignRoles(unitId.value, roleIds.value)
    ElMessage.success('角色分配成功')
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}
function handleClosed() {
  unitId.value = null
  unitName.value = ''
  roleIds.value = []
}
defineExpose({ open })
</script>

<style scoped>
.assign-tip {
  margin-bottom: 12px;
  font-weight: 500;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
}
</style>
