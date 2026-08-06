<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="780px"
    class="xn-import-dialog"
    destroy-on-close
    align-center
    @closed="handleClosed"
  >
    <div class="xn-import">
      <div class="xn-import__steps">
        <div class="xn-import__step">
          <span class="xn-import__step-no">1</span>
          <div class="xn-import__step-body">
            <div class="xn-import__step-title">下载模板</div>
            <div class="xn-import__step-desc">按表头填写；带 * 为必填，下拉列请选中文名称</div>
            <el-button type="primary" plain :icon="Download" @click="handleDownloadTemplate">
              下载 Excel 模板
            </el-button>
          </div>
        </div>

        <div class="xn-import__step">
          <span class="xn-import__step-no">2</span>
          <div class="xn-import__step-body">
            <div class="xn-import__step-title">上传文件</div>
            <div class="xn-import__step-desc">支持 .xlsx / .xls，单次不超过 {{ maxRows }} 行</div>
            <el-upload
              class="xn-import__uploader"
              drag
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls"
              :disabled="parsing"
              @change="onFileChange"
            >
              <div v-if="parsing" class="xn-import__drop xn-import__drop--loading">
                <el-icon class="is-loading" :size="28"><Loading /></el-icon>
                <div class="xn-import__drop-text">正在解析…</div>
              </div>
              <div v-else-if="fileName" class="xn-import__drop xn-import__drop--done">
                <el-icon :size="28" color="var(--el-color-success)"><CircleCheckFilled /></el-icon>
                <div class="xn-import__drop-name">{{ fileName }}</div>
                <div class="xn-import__drop-meta">
                  共 {{ rows.length }} 行有效数据 · 点击或拖拽可重新选择
                </div>
              </div>
              <div v-else class="xn-import__drop">
                <el-icon :size="36" class="xn-import__drop-icon"><UploadFilled /></el-icon>
                <div class="xn-import__drop-text">将文件拖到此处，或 <em>点击上传</em></div>
                <div class="xn-import__drop-hint">仅支持 Excel 文件</div>
              </div>
            </el-upload>
          </div>
        </div>
      </div>

      <div v-if="rows.length" class="xn-import__preview">
        <div class="xn-import__preview-head">
          <span>数据预览</span>
          <span class="xn-import__preview-count">
            {{
              rows.length > previewLimit
                ? `前 ${previewLimit} / 共 ${rows.length} 行`
                : `${rows.length} 行`
            }}
          </span>
        </div>
        <el-table :data="previewRows" border stripe max-height="280" size="small">
          <el-table-column type="index" label="#" width="50" />
          <el-table-column
            v-for="col in columns"
            :key="col.key"
            :prop="col.key"
            :label="col.required ? `${col.title}*` : col.title"
            min-width="100"
            show-overflow-tooltip
          />
        </el-table>
      </div>

      <div v-if="result" class="xn-import__result">
        <el-alert
          :type="result.failed > 0 ? 'warning' : 'success'"
          :closable="false"
          show-icon
          :title="`导入完成：成功 ${result.success} 条，失败 ${result.failed} 条`"
        />
        <el-table
          v-if="result.errors?.length"
          :data="result.errors"
          border
          size="small"
          max-height="160"
          class="xn-import__errors"
        >
          <el-table-column prop="row" label="行号" width="80" />
          <el-table-column prop="message" label="原因" min-width="200" show-overflow-tooltip />
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="xn-import__footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="!rows.length"
          @click="handleSubmit"
        >
          开始导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, ref } from 'vue'
import { CircleCheckFilled, Download, Loading, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  downloadExcelTemplate,
  mapImportRows,
  parseExcelFile,
  validateImportRows,
} from '@/utils/excel'
defineOptions({ name: 'XnImportDialog' })
const props = defineProps({
  title: { type: String, required: false, default: 'Excel 导入' },
  columns: { required: true },
  templateName: { type: String, required: false, default: '导入模板' },
  importer: { required: true },
  maxRows: { type: Number, required: false, default: 2000 },
  previewLimit: { type: Number, required: false, default: 50 },
})
const emit = defineEmits(['success'])
const visible = ref(false)
const parsing = ref(false)
const submitting = ref(false)
const fileName = ref('')
const rows = ref([])
const result = ref(null)
const previewRows = computed(() => rows.value.slice(0, props.previewLimit))
function open() {
  reset()
  visible.value = true
}
function reset() {
  fileName.value = ''
  rows.value = []
  result.value = null
  parsing.value = false
  submitting.value = false
}
function handleClosed() {
  reset()
}
async function handleDownloadTemplate() {
  try {
    await downloadExcelTemplate(props.columns, props.templateName)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '模板下载失败')
  }
}
async function onFileChange(uploadFile) {
  const raw = uploadFile.raw
  if (!raw) return
  const lower = raw.name.toLowerCase()
  if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
    ElMessage.warning('请上传 Excel 文件（.xlsx / .xls）')
    return
  }
  parsing.value = true
  result.value = null
  try {
    const parsed = await parseExcelFile(raw, props.columns)
    if (!parsed.length) {
      ElMessage.warning('未解析到有效数据行')
      rows.value = []
      fileName.value = ''
      return
    }
    if (parsed.length > props.maxRows) {
      ElMessage.error(`超过单次导入上限 ${props.maxRows} 行`)
      return
    }
    const err = validateImportRows(parsed, props.columns)
    if (err) {
      ElMessage.warning(err)
    }
    rows.value = parsed
    fileName.value = raw.name
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '解析失败')
    rows.value = []
    fileName.value = ''
  } finally {
    parsing.value = false
  }
}
async function handleSubmit() {
  if (!rows.value.length) {
    ElMessage.warning('请先上传 Excel')
    return
  }
  const err = validateImportRows(rows.value, props.columns)
  if (err) {
    ElMessage.error(err)
    return
  }
  submitting.value = true
  try {
    const payload = mapImportRows(rows.value, props.columns)
    const res = await props.importer(payload)
    result.value = res ?? null
    if (res && res.failed > 0) {
      ElMessage.warning(`导入完成：成功 ${res.success}，失败 ${res.failed}`)
    } else {
      ElMessage.success(res ? `成功导入 ${res.success} 条` : '导入成功')
      if (!res || res.failed === 0) {
        visible.value = false
      }
    }
    emit('success', res)
  } finally {
    submitting.value = false
  }
}
defineExpose({ open })
</script>

<style scoped>
.xn-import__steps {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.xn-import__step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.xn-import__step-no {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.xn-import__step-body {
  flex: 1;
  min-width: 0;
}

.xn-import__step-title {
  font-weight: 600;
  font-size: var(--app-font-size-main, 14px);
  margin-bottom: 4px;
}

.xn-import__step-desc {
  font-size: 12px;
  color: var(--app-text-muted, var(--el-text-color-secondary));
  margin-bottom: 10px;
  line-height: 1.5;
}

.xn-import__uploader {
  width: 100%;
}

.xn-import__uploader :deep(.el-upload) {
  width: 100%;
}

.xn-import__uploader :deep(.el-upload-dragger) {
  width: 100%;
  padding: 0;
  border-radius: 8px;
  border: 1px dashed var(--el-border-color);
  background: var(--el-fill-color-blank);
  transition:
    border-color 0.2s,
    background 0.2s;
}

.xn-import__uploader :deep(.el-upload-dragger:hover) {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.xn-import__drop {
  padding: 28px 16px;
  text-align: center;
}

.xn-import__drop-icon {
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.xn-import__drop-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.xn-import__drop-text em {
  color: var(--el-color-primary);
  font-style: normal;
}

.xn-import__drop-hint,
.xn-import__drop-meta {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.xn-import__drop-name {
  margin-top: 8px;
  font-weight: 600;
  font-size: 14px;
  word-break: break-all;
}

.xn-import__preview {
  margin-top: 18px;
}

.xn-import__preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
}

.xn-import__preview-count {
  font-weight: 400;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.xn-import__result {
  margin-top: 16px;
}

.xn-import__errors {
  margin-top: 8px;
}

.xn-import__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
