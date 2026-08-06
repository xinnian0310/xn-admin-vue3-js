<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="80px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="上级单位" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          check-strictly
          clearable
          placeholder="无（顶级）"
          style="width: 100%"
          :disabled="mode === 'view' || editingBuiltIn"
        />
      </el-form-item>
      <el-form-item label="默认角色" prop="roleIds">
        <el-select
          v-model="form.roleIds"
          multiple
          clearable
          filterable
          placeholder="单位下用户自动继承"
          style="width: 100%"
        >
          <el-option v-for="r in availableRoles" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
        <div class="form-tip">绑定后，该单位用户无需再单独分配这些角色</div>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status" :disabled="editingBuiltIn">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useCrudApi } from '@/composables/useCrudApi'
import { list as listUnits } from '@/api/unit'
import { getOptions as getRoleOptions } from '@/api/role'
import { usePermission } from '@/directives/permission'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'UnitsSave' })
const emit = defineEmits(['success'])
const api = useCrudApi()
const { isSuperAdmin } = usePermission()
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const parentOptions = ref([])
const roleOptions = ref([])
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '单位'))
const availableRoles = computed(() =>
  isSuperAdmin.value
    ? roleOptions.value
    : roleOptions.value.filter((r) => r.code !== 'SUPER_ADMIN'),
)
const form = reactive({
  code: '',
  name: '',
  parentId: undefined,
  description: '',
  sort: 0,
  status: 1,
  roleIds: [],
})
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
}
function resetForm() {
  form.code = ''
  form.name = ''
  form.parentId = undefined
  form.description = ''
  form.sort = 0
  form.status = 1
  form.roleIds = []
  editingBuiltIn.value = false
  editingId.value = null
  formRef.value?.clearValidate()
}
function excludeSelf(nodes, selfId) {
  return nodes
    .filter((n) => n.id !== selfId)
    .map((n) => ({
      ...n,
      children: n.children?.length ? excludeSelf(n.children, selfId) : [],
    }))
}
async function loadParents(selfId) {
  const res = await listUnits()
  parentOptions.value = excludeSelf(res.data || [], selfId)
}
async function loadRoles() {
  if (roleOptions.value.length) return
  const res = await getRoleOptions()
  roleOptions.value = res.data || []
}
async function loadDetail(id) {
  const res = await api.get(id)
  const data = res.data
  editingBuiltIn.value = !!data.builtIn
  form.code = data.code
  form.name = data.name
  form.parentId = data.parentId ?? undefined
  form.description = data.description ?? ''
  form.sort = data.sort ?? 0
  form.status = data.status ?? 1
  form.roleIds = data.roleIds?.length ? [...data.roleIds] : (data.roleList || []).map((r) => r.id)
}
async function open(openMode, id, options) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
  await Promise.all([loadParents(id ?? null), loadRoles()])
  if (options?.parentId != null) {
    form.parentId = options.parentId
  }
  visible.value = true
  if (openMode !== 'add' && id) {
    await loadDetail(id)
  }
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...form,
        parentId: form.parentId ?? null,
        roleIds: form.roleIds || [],
      }
      if (mode.value === 'edit' && editingId.value) {
        await api.update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await api.create(payload)
        ElMessage.success('创建成功')
      }
      visible.value = false
      emit('success')
    } finally {
      submitting.value = false
    }
  })
}
function handleClosed() {
  resetForm()
}
defineExpose({ open })
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
}
</style>
