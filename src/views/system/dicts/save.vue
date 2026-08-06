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
      <el-form-item label="字典名称" prop="name">
        <el-input v-model="form.name" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="字典编码" prop="type">
        <el-input
          v-model="form.type"
          :disabled="mode === 'view' || editingBuiltIn"
          placeholder="如 sys_common_status"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" />
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
import { get, create, update } from '@/api/dict-type'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'DictTypeSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '字典'))
const form = reactive({
  name: '',
  type: '',
  status: 1,
  remark: '',
})
const rules = {
  name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  type: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    {
      pattern: /^[a-z][a-z0-9_]*$/,
      message: '需以小写字母开头，只能包含小写字母、数字、下划线',
      trigger: 'blur',
    },
  ],
}
function resetForm() {
  form.name = ''
  form.type = ''
  form.status = 1
  form.remark = ''
  editingBuiltIn.value = false
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  const data = res.data
  editingBuiltIn.value = !!data.builtIn
  form.name = data.name
  form.type = data.type
  form.status = data.status ?? 1
  form.remark = data.remark ?? ''
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
