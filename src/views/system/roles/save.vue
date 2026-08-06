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
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" :disabled="mode === 'view' || editingBuiltIn" />
      </el-form-item>
      <el-form-item label="数据权限" prop="dataScope">
        <el-select
          v-model="form.dataScope"
          style="width: 100%"
          :disabled="mode === 'view' || isSuperAdminRole"
        >
          <el-option
            v-for="opt in dataScopeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <div class="form-tip">
          {{ isSuperAdminRole ? '超级管理员固定为全部数据' : '多角色取最宽范围；默认本单位及下级' }}
        </div>
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
import { create, get, update } from '@/api/role'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'RolesSave' })
const emit = defineEmits(['success'])
const dataScopeOptions = [
  { value: 'ALL', label: '全部数据' },
  { value: 'UNIT_AND_CHILDREN', label: '本单位及下级' },
  { value: 'UNIT', label: '仅本单位' },
  { value: 'SELF', label: '仅本人' },
]
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const editingCode = ref('')
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '角色'))
const isSuperAdminRole = computed(() => editingCode.value === 'SUPER_ADMIN')
const form = reactive({
  name: '',
  code: '',
  description: '',
  dataScope: 'UNIT_AND_CHILDREN',
})
const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  dataScope: [{ required: true, message: '请选择数据权限', trigger: 'change' }],
}
function resetForm() {
  form.code = ''
  form.name = ''
  form.description = ''
  form.dataScope = 'UNIT_AND_CHILDREN'
  editingBuiltIn.value = false
  editingCode.value = ''
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  editingBuiltIn.value = res.data.builtIn
  editingCode.value = res.data.code
  form.code = res.data.code
  form.name = res.data.name
  form.description = res.data.description ?? ''
  form.dataScope =
    res.data.dataScope || (res.data.code === 'SUPER_ADMIN' ? 'ALL' : 'UNIT_AND_CHILDREN')
}
async function open(openMode, id) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
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
        dataScope: isSuperAdminRole.value ? 'ALL' : form.dataScope,
      }
      if (mode.value === 'edit' && editingId.value) {
        await update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await create(payload)
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
  color: var(--app-text-muted, #909399);
  line-height: 1.4;
}
</style>
