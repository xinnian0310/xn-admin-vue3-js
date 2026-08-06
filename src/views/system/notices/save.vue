<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="820px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" :disabled="readonly">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          maxlength="200"
          show-word-limit
          placeholder="请输入公告标题"
        />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <xnRichEditor v-model="form.content" :disabled="readonly" height="360px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ readonly ? '关闭' : '取消' }}</el-button>
      <el-button v-if="!readonly" type="primary" :loading="submitting" @click="handleSubmit">
        保存草稿
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import xnRichEditor from '@/components/xnRichEditor/xnRichEditor.vue'
import { create, get, update } from '@/api/notice'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'NoticesSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref()
const readonly = computed(() => mode.value === 'view')
const dialogTitle = computed(() => saveDialogTitle(mode.value, '公告'))
const form = reactive({
  title: '',
  content: '',
})
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [
    {
      validator: (_rule, value, callback) => {
        const text = String(value || '')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim()
        if (!text) callback(new Error('请输入内容'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}
function resetForm() {
  form.title = ''
  form.content = ''
  editingId.value = null
}
async function open(nextMode, id) {
  mode.value = nextMode
  resetForm()
  visible.value = true
  if (id) {
    editingId.value = id
    const res = await get(id)
    form.title = res.data.title
    form.content = res.data.content
  }
}
async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = { title: form.title.trim(), content: form.content }
    if (editingId.value) {
      await update(editingId.value, payload)
      ElMessage.success('更新成功')
    } else {
      await create(payload)
      ElMessage.success('保存成功')
    }
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}
function handleClosed() {
  formRef.value?.resetFields()
  resetForm()
}
defineExpose({ open })
</script>
