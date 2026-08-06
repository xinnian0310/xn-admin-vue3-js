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
      label-width="90px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="字典标签" prop="label">
        <el-input v-model="form.label" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="字典键值" prop="value">
        <el-input v-model="form.value" :disabled="mode === 'view'" />
      </el-form-item>
      <el-form-item label="标签样式" prop="listClass">
        <el-select v-model="form.listClass" clearable placeholder="默认" style="width: 100%">
          <el-option
            v-for="opt in DICT_LIST_CLASS_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <div class="preview-tip">
          预览：
          <el-tag :type="previewType">{{ form.label || '示例' }}</el-tag>
        </div>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
      <el-form-item label="默认项" prop="isDefault">
        <el-switch v-model="form.isDefault" />
        <span class="form-tip">同一字典下仅一项可设为默认</span>
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
import { get, create, update } from '@/api/dict-data'
import { DICT_LIST_CLASS_OPTIONS } from '@/types'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'DictDataSave' })
const props = defineProps({
  dictType: { required: true },
})
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '字典数据'))
const previewType = computed(() => {
  const allowed = ['primary', 'success', 'info', 'warning', 'danger']
  return allowed.includes(form.listClass || '') ? form.listClass : ''
})
const form = reactive({
  dictType: '',
  label: '',
  value: '',
  sort: 0,
  status: 1,
  isDefault: false,
  listClass: '',
  remark: '',
})
const rules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
}
function resetForm() {
  form.dictType = props.dictType
  form.label = ''
  form.value = ''
  form.sort = 0
  form.status = 1
  form.isDefault = false
  form.listClass = ''
  form.remark = ''
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  const data = res.data
  form.dictType = data.dictType
  form.label = data.label
  form.value = data.value
  form.sort = data.sort ?? 0
  form.status = data.status ?? 1
  form.isDefault = !!data.isDefault
  form.listClass = data.listClass ?? ''
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
      const payload = { ...form, dictType: props.dictType }
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
  margin-left: 12px;
  font-size: 12px;
  color: var(--app-text-muted);
}

.preview-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--app-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
