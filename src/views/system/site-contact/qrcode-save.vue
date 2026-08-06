<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="480px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="名称">
        <el-input :model-value="form.label" disabled />
        <div class="form-tip">名称固定，仅可更换二维码图片</div>
      </el-form-item>
      <el-form-item label="二维码" prop="src">
        <el-upload
          v-model:file-list="fileList"
          class="qr-uploader"
          :class="{ 'is-full': fileList.length >= 1 }"
          list-type="picture-card"
          accept="image/png,image/jpeg,image/webp"
          :limit="1"
          :disabled="mode === 'view' || uploading"
          :http-request="handleUpload"
          :on-exceed="onExceed"
          :on-remove="onRemove"
          :on-preview="onPreview"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="form-tip">仅可上传 1 张，支持 png / jpg / webp，建议正方形清晰图</div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="uploading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>

  <el-image-viewer
    v-if="previewVisible"
    :url-list="[form.src]"
    teleported
    @close="previewVisible = false"
  />
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadDonationQrcode } from '@/api/site-contact'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'SiteDonationQrSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const previewVisible = ref(false)
const mode = ref('add')
const editingIndex = ref(null)
const uploading = ref(false)
const formRef = ref()
const fileList = ref([])
const dialogTitle = computed(() => saveDialogTitle(mode.value, '捐赠二维码'))
const form = reactive({
  label: '',
  src: '',
})
const rules = {
  src: [{ required: true, message: '请上传二维码图片', trigger: 'change' }],
}
function syncFileList(src) {
  if (!src) {
    fileList.value = []
    return
  }
  fileList.value = [
    {
      name: 'donation-qrcode',
      url: src,
      status: 'success',
      uid: Date.now(),
    },
  ]
}
function resetForm() {
  form.label = ''
  form.src = ''
  editingIndex.value = null
  fileList.value = []
  previewVisible.value = false
  formRef.value?.clearValidate()
}
function open(openMode, row, index) {
  mode.value = openMode
  resetForm()
  if (row) {
    form.label = row.label || ''
    form.src = row.src || ''
    editingIndex.value = index ?? null
    syncFileList(form.src)
  }
  visible.value = true
}
function onExceed() {
  ElMessage.warning('仅允许上传一张二维码图片')
}
function onRemove() {
  form.src = ''
  fileList.value = []
  formRef.value?.validateField('src')
}
function onPreview() {
  if (form.src) {
    previewVisible.value = true
  }
}
async function handleUpload(opt) {
  uploading.value = true
  try {
    const res = await uploadDonationQrcode(opt.file)
    form.src = res.data.url
    syncFileList(form.src)
    ElMessage.success('上传成功')
    formRef.value?.validateField('src')
    opt.onSuccess?.(res)
  } catch (e) {
    form.src = ''
    fileList.value = []
    ElMessage.error(e?.message || '上传失败')
    opt.onError?.(e)
  } finally {
    uploading.value = false
  }
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    emit('success', {
      mode: mode.value,
      index: editingIndex.value,
      data: {
        label: form.label.trim(),
        src: form.src.trim(),
      },
    })
    visible.value = false
  })
}
function handleClosed() {
  resetForm()
}
defineExpose({ open })
</script>

<style scoped>
.qr-uploader :deep(.el-upload--picture-card),
.qr-uploader :deep(.el-upload-list__item) {
  width: 120px;
  height: 120px;
}

/* 已有图片时隐藏加号上传框 */
.qr-uploader.is-full :deep(.el-upload--picture-card) {
  display: none;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  width: 100%;
}
</style>
