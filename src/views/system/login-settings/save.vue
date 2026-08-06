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
      <el-form-item label="配置名称" prop="name">
        <el-input v-model="form.name" maxlength="50" placeholder="如：默认登录页" />
      </el-form-item>

      <el-form-item label="启用状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">未启用</el-radio>
        </el-radio-group>
        <div class="form-tip">同时仅允许启用一套配置；启用时会自动停用其它配置</div>
      </el-form-item>

      <el-form-item label="开启验证" prop="captchaEnabled">
        <el-switch v-model="form.captchaEnabled" />
      </el-form-item>

      <el-form-item v-if="form.captchaEnabled" label="验证类型" prop="captchaType">
        <el-select v-model="form.captchaType" placeholder="请选择" style="width: 100%">
          <el-option label="图形验证码" value="IMAGE" />
          <el-option label="滑块验证" value="SLIDER" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="200" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { get, create, update } from '@/api/login-page'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'LoginPageSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '登录页配置'))
const form = reactive({
  name: '',
  captchaEnabled: false,
  captchaType: 'IMAGE',
  status: 0,
  remark: '',
})
const rules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  captchaType: [
    {
      validator: (_rule, value, callback) => {
        if (form.captchaEnabled && !value) {
          callback(new Error('请选择验证类型'))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],
}
function resetForm() {
  form.name = ''
  form.captchaEnabled = false
  form.captchaType = 'IMAGE'
  form.status = 0
  form.remark = ''
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  const data = res.data
  form.name = data.name
  form.captchaEnabled = !!data.captchaEnabled
  form.captchaType = data.captchaType || 'IMAGE'
  form.status = data.status ?? 0
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
      const payload = {
        name: form.name.trim(),
        captchaEnabled: form.captchaEnabled,
        captchaType: form.captchaEnabled ? form.captchaType || 'IMAGE' : undefined,
        status: form.status,
        remark: form.remark?.trim() || undefined,
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
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  width: 100%;
}
</style>
