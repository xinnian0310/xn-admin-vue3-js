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
        <el-input v-model="form.title" maxlength="200" show-word-limit placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <xnRichEditor v-model="form.content" :disabled="readonly" height="360px" />
      </el-form-item>
      <el-form-item label="附件">
        <div class="attachment-field">
          <xnUpload
            v-if="!readonly"
            ref="uploaderRef"
            :limit="remainingSlots"
            :disabled="remainingSlots <= 0"
            :max-size="MAX_ATTACHMENT_SIZE"
            @success="handleUploaded"
          />
          <div v-if="form.attachments.length" class="attachment-field__list">
            <div
              v-for="(item, index) in form.attachments"
              :key="item.path"
              class="attachment-field__row"
            >
              <el-link
                type="primary"
                :href="resolveAttachmentUrl(item.path)"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ item.name }}
              </el-link>
              <span class="attachment-field__meta">
                {{ item.size != null ? formatBytes(item.size) : '—' }} ·
                {{ formatDateTime(item.uploadedAt) }}
              </span>
              <button
                type="button"
                class="attachment-field__action"
                @click="openKkFileViewPreview(item.path, item.name)"
              >
                查看
              </button>
              <el-button v-if="!readonly" link type="danger" @click="removeAttachment(index)">
                移除
              </el-button>
            </div>
          </div>
          <div v-else-if="readonly" class="attachment-field__empty">无附件</div>
        </div>
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
import xnUpload from '@/components/xnUpload/xnUpload.vue'
import { create, get, update } from '@/api/message'
import { resolveAttachmentUrl } from '@/config/app'
import { openKkFileViewPreview } from '@/utils/kk-file-view'
import { saveDialogTitle } from '@/types/save'
import {
  MAX_ATTACHMENT_COUNT,
  MAX_ATTACHMENT_SIZE,
  insertAttachmentByOrder,
  resolveAttachments,
  seedAttachmentOrders,
  toAttachmentItem,
  toAttachmentPayload,
} from '@/utils/attachment'
import { formatBytes } from '@/utils/upload/format'
import { formatDateTime } from '@/utils/datetime'
defineOptions({ name: 'MessagesSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref()
const uploaderRef = ref()
const pathOrder = new Map()
let orderBase = 0
const readonly = computed(() => mode.value === 'view')
const dialogTitle = computed(() => saveDialogTitle(mode.value, '站内信'))
const form = reactive({
  title: '',
  content: '',
  attachments: [],
})
const remainingSlots = computed(() => Math.max(0, MAX_ATTACHMENT_COUNT - form.attachments.length))
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
}
function resetForm() {
  form.title = ''
  form.content = ''
  form.attachments = []
  editingId.value = null
  seedAttachmentOrders([], pathOrder)
  orderBase = 0
}
function removeAttachment(index) {
  form.attachments.splice(index, 1)
}
function handleUploaded(file, task) {
  if (form.attachments.some((item) => item.path === file.path)) {
    uploaderRef.value?.clearSettled()
    return
  }
  if (form.attachments.length >= MAX_ATTACHMENT_COUNT) {
    ElMessage.warning(`最多上传 ${MAX_ATTACHMENT_COUNT} 个附件`)
    uploaderRef.value?.clearSettled()
    return
  }
  const order = orderBase + (task?.queueIndex ?? form.attachments.length + 1)
  form.attachments = insertAttachmentByOrder(
    form.attachments,
    toAttachmentItem(file),
    order,
    pathOrder,
  )
  uploaderRef.value?.clearSettled()
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
    form.attachments = resolveAttachments(res.data)
    seedAttachmentOrders(form.attachments, pathOrder)
    orderBase = form.attachments.length
  }
}
async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const payload = {
      title: form.title.trim(),
      content: form.content,
      ...toAttachmentPayload(form.attachments),
    }
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

<style scoped>
.attachment-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.attachment-field__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: calc(32px * 4 + 6px * 3);
  overflow-y: auto;
}

.attachment-field__row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 32px;
  flex-shrink: 0;
}

.attachment-field__meta {
  color: var(--app-text-muted, #909399);
  font-size: 12px;
  flex-shrink: 0;
}

.attachment-field__action {
  border: 0;
  background: none;
  padding: 0;
  color: var(--el-color-primary);
  cursor: pointer;
  font-size: inherit;
  line-height: inherit;
  flex-shrink: 0;
}

.attachment-field__action:hover {
  color: var(--el-color-primary-light-3);
}

.attachment-field__empty {
  color: var(--app-text-muted, #909399);
  font-size: 13px;
}
</style>
