<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="520px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="岗位名称" prop="name">
        <el-input v-model="form.name" maxlength="50" />
      </el-form-item>
      <el-form-item label="岗位编码" prop="code">
        <el-input
          v-model="form.code"
          :disabled="mode === 'view' || editingBuiltIn"
          maxlength="50"
          placeholder="如 manager"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" />
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
import { create, get, update } from '@/api/post'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'PostSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '岗位'))
const form = reactive({
  code: '',
  name: '',
  sort: 0,
  status: 1,
  remark: '',
})
const rules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: '需以字母开头，只能包含字母、数字、下划线',
      trigger: 'blur',
    },
  ],
}
function resetForm() {
  form.code = ''
  form.name = ''
  form.sort = 0
  form.status = 1
  form.remark = ''
  editingBuiltIn.value = false
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  editingBuiltIn.value = !!res.data.builtIn
  form.code = res.data.code
  form.name = res.data.name
  form.sort = res.data.sort ?? 0
  form.status = res.data.status ?? 1
  form.remark = res.data.remark ?? ''
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
      if (mode.value === 'edit' && editingId.value) {
        await update(editingId.value, form)
        ElMessage.success('更新成功')
      } else {
        await create(form)
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
