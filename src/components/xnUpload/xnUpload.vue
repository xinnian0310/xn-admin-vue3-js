<template>
  <div class="xn-upload" :class="{ 'is-disabled': disabled }">
    <div
      v-if="drag"
      class="xn-upload__drop"
      :class="{ 'is-over': dragOver }"
      role="button"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <el-icon :size="38" class="xn-upload__drop-icon"><UploadFilled /></el-icon>
      <div class="xn-upload__drop-text">将文件拖到此处，或 <em>点击选择文件</em></div>
      <div class="xn-upload__drop-hint">{{ hintText }}</div>
    </div>
    <el-button v-else type="primary" :icon="UploadFilled" :disabled="disabled" @click="openPicker">
      选择文件
    </el-button>

    <input
      ref="inputRef"
      class="xn-upload__input"
      type="file"
      hidden
      tabindex="-1"
      aria-hidden="true"
      :multiple="multiple"
      :accept="acceptAttr"
      @change="onPick"
    />

    <div v-if="showFileList && tasks.length" class="xn-upload__toolbar">
      <div class="xn-upload__summary">
        共 {{ tasks.length }} 个文件 · {{ formatBytes(totalSize) }} · 已完成 {{ successCount }}/{{
          tasks.length
        }}
      </div>
      <div class="xn-upload__toolbar-actions">
        <el-button size="small" :disabled="!hasStartable" @click="startAll">全部开始</el-button>
        <el-button size="small" :disabled="!hasPausable" @click="pauseAll">全部暂停</el-button>
        <el-button size="small" :disabled="!hasSettled" @click="clearSettled">清除已完成</el-button>
      </div>
    </div>

    <ul v-if="showFileList && tasks.length" class="xn-upload__list">
      <li v-for="task in tasks" :key="task.id" class="xn-upload__item">
        <div class="xn-upload__item-head">
          <div class="xn-upload__item-title">
            <span class="xn-upload__item-name" :title="task.name">{{ task.name }}</span>
            <span v-if="task.instant" class="xn-upload__badge">秒传</span>
            <span v-else-if="task.direct" class="xn-upload__badge">直传</span>
            <span v-else-if="task.totalChunks" class="xn-upload__badge">
              分片 {{ task.uploadedChunks }}/{{ task.totalChunks }}
            </span>
          </div>
          <el-tag size="small" :type="statusMeta(task).type" disable-transitions>
            {{ statusMeta(task).text }}
          </el-tag>
          <span class="xn-upload__item-size">{{ formatBytes(task.size) }}</span>
          <span v-if="task.status === 'success'" class="xn-upload__item-time">
            {{ formatDateTime(task.result?.lastModified) }}
          </span>
          <span class="xn-upload__item-actions">
            <el-button
              v-if="canPause(task)"
              size="small"
              text
              :icon="VideoPause"
              @click="pause(task.id)"
            >
              暂停
            </el-button>
            <el-button
              v-if="task.status === 'paused'"
              size="small"
              text
              type="primary"
              :icon="VideoPlay"
              @click="resume(task.id)"
            >
              继续
            </el-button>
            <el-button
              v-if="task.status === 'error'"
              size="small"
              text
              type="warning"
              :icon="RefreshRight"
              @click="retry(task.id)"
            >
              重试
            </el-button>
            <el-button
              v-if="!isSettled(task)"
              size="small"
              text
              type="danger"
              :icon="CircleClose"
              @click="cancel(task.id)"
            >
              取消
            </el-button>
            <el-button
              v-if="task.status === 'success' && task.result?.path"
              size="small"
              text
              :icon="View"
              @click="openKkFileViewPreview(task.result.path, task.result.name || task.name)"
            >
              查看
            </el-button>
            <el-button size="small" text :icon="Delete" @click="remove(task.id)">移除</el-button>
          </span>
        </div>

        <el-progress
          :percentage="progressOf(task)"
          :status="progressStatus(task)"
          :stroke-width="4"
          :show-text="false"
        />

        <div v-if="metaText(task)" class="xn-upload__item-meta">
          <span>{{ metaText(task) }}</span>
        </div>

        <div v-if="task.chunks.length > 1" class="xn-upload__chunks">
          <span
            v-for="block in chunkBlocks(task)"
            :key="block.key"
            class="xn-upload__chunk"
            :class="`is-${block.state}`"
          />
        </div>

        <div v-if="task.error" class="xn-upload__item-error">{{ task.error }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  CircleClose,
  Delete,
  RefreshRight,
  UploadFilled,
  VideoPause,
  VideoPlay,
  View,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { UploadManager } from '@/utils/upload/upload-manager'
import { DEFAULT_MAX_FILE_SIZE, DEFAULT_UPLOADER_OPTIONS } from '@/utils/upload/types'
import { formatBytes, formatDuration, formatSpeed, validateFile } from '@/utils/upload/format'
import { formatDateTime } from '@/utils/datetime'
import { openKkFileViewPreview } from '@/utils/kk-file-view'

defineOptions({ name: 'xnUpload' })

const props = defineProps({
  /** 分片大小；MinIO 原生分片要求除末片外 ≥ 5MiB */
  chunkSize: { type: Number, required: false, default: DEFAULT_UPLOADER_OPTIONS.chunkSize },
  /** 单文件内同时上传的分片数 */
  concurrency: { type: Number, required: false, default: DEFAULT_UPLOADER_OPTIONS.concurrency },
  /** 同时上传的文件数 */
  fileConcurrency: {
    type: Number,
    required: false,
    default: DEFAULT_UPLOADER_OPTIONS.fileConcurrency,
  },
  maxRetries: { type: Number, required: false, default: DEFAULT_UPLOADER_OPTIONS.maxRetries },
  retryDelay: { type: Number, required: false, default: DEFAULT_UPLOADER_OPTIONS.retryDelay },
  /** 单片请求超时毫秒数；0 表示不限制 */
  chunkTimeout: { type: Number, required: false, default: DEFAULT_UPLOADER_OPTIONS.chunkTimeout },
  /** 小于此值直接单请求上传 */
  sliceThreshold: {
    type: Number,
    required: false,
    default: DEFAULT_UPLOADER_OPTIONS.sliceThreshold,
  },
  enableSlice: { type: Boolean, required: false, default: true },
  enableResume: { type: Boolean, required: false, default: true },
  enableInstant: { type: Boolean, required: false, default: true },
  /** 关闭后不读文件内容算指纹，秒传随之失效 */
  enableHash: { type: Boolean, required: false, default: true },
  /** `sha256-tree` | `sha256` */
  hashAlgo: { type: String, required: false, default: 'sha256-tree' },
  verifyChunkHash: { type: Boolean, required: false, default: true },
  /** 单文件大小上限；0 表示不限 */
  maxSize: { type: Number, required: false, default: DEFAULT_MAX_FILE_SIZE },
  minSize: { type: Number, required: false, default: 0 },
  /** 允许类型，支持 `.mp4` / `video/mp4` / `video/*` */
  accept: { type: Array, required: false, default: () => [] },
  /** 文件数量上限；0 表示不限 */
  limit: { type: Number, required: false, default: 0 },
  multiple: { type: Boolean, required: false, default: true },
  /** 选择后立即开始上传 */
  autoUpload: { type: Boolean, required: false, default: true },
  /** 展示拖拽区；false 时只给一个选择按钮 */
  drag: { type: Boolean, required: false, default: true },
  showFileList: { type: Boolean, required: false, default: true },
  disabled: { type: Boolean, required: false, default: false },
})

const emit = defineEmits(['change', 'progress', 'success', 'error', 'exceed', 'invalid'])

const STATUS_META = {
  pending: { text: '等待中', type: 'info' },
  hashing: { text: '计算指纹', type: 'warning' },
  checking: { text: '秒传探测', type: 'warning' },
  uploading: { text: '上传中', type: 'primary' },
  paused: { text: '已暂停', type: 'info' },
  merging: { text: '合并中', type: 'warning' },
  success: { text: '已完成', type: 'success' },
  error: { text: '失败', type: 'danger' },
  cancelled: { text: '已取消', type: 'info' },
}

/** 分片数可达上万，超过这个数量就聚合成区块展示，避免渲染上万个节点 */
const MAX_CHUNK_BLOCKS = 100

const inputRef = ref()
const tasks = ref([])
const dragOver = ref(false)
const lastStatus = new Map()

const manager = new UploadManager(currentOptions())

const unsubscribe = manager.subscribe((snapshot) => {
  tasks.value = snapshot
  for (const id of [...lastStatus.keys()]) {
    if (!snapshot.some((task) => task.id === id)) lastStatus.delete(id)
  }
  for (const task of snapshot) {
    if (task.status === 'uploading') {
      emit('progress', task)
    }
    if (lastStatus.get(task.id) === task.status) continue
    lastStatus.set(task.id, task.status)
    if (task.status === 'success' && task.result) {
      emit('success', task.result, task)
    } else if (task.status === 'error') {
      emit('error', task.error ?? '上传失败', task)
    }
  }
  emit('change', snapshot)
})

watch(
  () => currentOptions(),
  (options) => manager.setOptions(options),
  { deep: true },
)

onBeforeUnmount(() => {
  unsubscribe()
  manager.dispose()
})

function currentOptions() {
  return {
    chunkSize: props.chunkSize,
    concurrency: props.concurrency,
    fileConcurrency: props.fileConcurrency,
    maxRetries: props.maxRetries,
    retryDelay: props.retryDelay,
    chunkTimeout: props.chunkTimeout,
    sliceThreshold: props.sliceThreshold,
    enableSlice: props.enableSlice,
    enableResume: props.enableResume,
    enableInstant: props.enableInstant,
    enableHash: props.enableHash,
    hashAlgo: props.hashAlgo,
    verifyChunkHash: props.verifyChunkHash,
  }
}

const acceptAttr = computed(() => (props.accept.length ? props.accept.join(',') : void 0))

const hintText = computed(() => {
  const parts = []
  parts.push(props.accept.length ? `支持 ${props.accept.join('、')}` : '支持任意类型')
  if (props.maxSize > 0) parts.push(`单文件 ≤ ${formatBytes(props.maxSize)}`)
  return parts.join(' · ')
})

const totalSize = computed(() => tasks.value.reduce((sum, task) => sum + task.size, 0))
const successCount = computed(() => tasks.value.filter((task) => task.status === 'success').length)
const hasStartable = computed(() =>
  tasks.value.some((task) => task.status === 'pending' || task.status === 'paused'),
)
const hasPausable = computed(() => tasks.value.some((task) => canPause(task)))
const hasSettled = computed(() => tasks.value.some((task) => isSettled(task)))

function openPicker() {
  if (props.disabled) return
  inputRef.value?.click()
}

function onPick(event) {
  const input = event.target
  addFiles(Array.from(input.files ?? []))
  // 清空后同一个文件可再次触发 change，续传场景需要重新选同一文件
  input.value = ''
}

function onDragOver() {
  if (props.disabled) return
  dragOver.value = true
}

function onDragLeave() {
  dragOver.value = false
}

async function onDrop(event) {
  dragOver.value = false
  if (props.disabled || !event.dataTransfer) return
  addFiles(await collectDroppedFiles(event.dataTransfer))
}

/** 支持拖入文件夹：逐层展开目录内的所有文件 */
async function collectDroppedFiles(transfer) {
  const entries = []
  for (const item of Array.from(transfer.items)) {
    const entry = item.webkitGetAsEntry?.()
    if (entry) entries.push(entry)
  }
  if (entries.length === 0) return Array.from(transfer.files)

  const files = []
  const walk = async (entry) => {
    if (entry.isFile) {
      files.push(await readEntryFile(entry))
      return
    }
    for (const child of await readDirectory(entry)) {
      await walk(child)
    }
  }
  for (const entry of entries) {
    await walk(entry)
  }
  return files
}

function readEntryFile(entry) {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

/** readEntries 每次最多返回一批，须反复读到空数组为止 */
function readDirectory(entry) {
  const reader = entry.createReader()
  const all = []
  return new Promise((resolve, reject) => {
    const readBatch = () => {
      reader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(all)
          return
        }
        all.push(...batch)
        readBatch()
      }, reject)
    }
    readBatch()
  })
}

function addFiles(files) {
  if (props.disabled || files.length === 0) return
  const accepted = []
  for (const file of files) {
    const message = validateFile(file, {
      maxSize: props.maxSize,
      minSize: props.minSize,
      accept: props.accept,
    })
    if (message) {
      ElMessage.warning(message)
      emit('invalid', message, file)
      continue
    }
    accepted.push(file)
  }
  if (accepted.length === 0) return

  let queued = accepted
  if (props.limit > 0) {
    const room = Math.max(0, props.limit - tasks.value.length)
    if (accepted.length > room) {
      const dropped = accepted.slice(room)
      queued = accepted.slice(0, room)
      ElMessage.warning(`最多上传 ${props.limit} 个文件，已忽略 ${dropped.length} 个`)
      emit('exceed', dropped)
    }
  }
  if (queued.length === 0) return
  manager.add(queued, props.autoUpload)
}

function startAll() {
  manager.resumeAll()
  manager.start()
}

function pauseAll() {
  manager.pauseAll()
}

function clearSettled() {
  manager.clearSettled()
}

function pause(id) {
  manager.find(id)?.pause()
}

function resume(id) {
  manager.find(id)?.resume()
}

function retry(id) {
  manager.find(id)?.retry()
}

async function cancel(id) {
  await manager.find(id)?.cancel()
}

async function remove(id) {
  lastStatus.delete(id)
  await manager.remove(id)
}

async function clear() {
  await manager.cancelAll()
  lastStatus.clear()
  manager.clearSettled()
}

function statusMeta(task) {
  return STATUS_META[task.status]
}

function isSettled(task) {
  return task.status === 'success' || task.status === 'cancelled'
}

function canPause(task) {
  return task.status === 'uploading' || task.status === 'hashing' || task.status === 'checking'
}

/** 指纹阶段没有上传字节，进度条改为展示指纹进度，否则界面看着像卡住 */
function progressOf(task) {
  return task.status === 'hashing' ? task.hashPercent : task.percent
}

function progressStatus(task) {
  if (task.status === 'success') return 'success'
  if (task.status === 'error') return 'exception'
  if (task.status === 'cancelled') return 'warning'
  return void 0
}

function metaText(task) {
  switch (task.status) {
    case 'hashing':
      return `计算文件指纹 ${task.hashPercent.toFixed(1)}%`
    case 'checking':
      return '正在探测秒传 / 断点续传'
    case 'merging':
      return '服务端合并分片中'
    case 'success':
      return task.instant ? '服务端已存在同内容文件，未重复传输' : '上传完成'
    case 'uploading':
      return `${formatSpeed(task.speed)} · 剩余 ${formatDuration(task.remainingTime)}`
    case 'paused':
      return '已暂停'
    default:
      return ''
  }
}

function chunkBlocks(task) {
  const groupSize = Math.max(1, Math.ceil(task.chunks.length / MAX_CHUNK_BLOCKS))
  const blocks = []
  for (let start = 0; start < task.chunks.length; start += groupSize) {
    const group = task.chunks.slice(start, start + groupSize)
    let state = 'pending'
    if (group.every((chunk) => chunk.status === 'success')) state = 'success'
    else if (group.some((chunk) => chunk.status === 'error')) state = 'error'
    else if (group.some((chunk) => chunk.status === 'uploading')) state = 'uploading'
    blocks.push({ key: start, state })
  }
  return blocks
}

defineExpose({
  /** 打开系统文件选择框 */
  openPicker,
  /** 以代码方式加入文件（同样走大小 / 类型校验） */
  addFiles,
  startAll,
  pauseAll,
  clearSettled,
  /** 取消并清空整个队列 */
  clear,
  tasks,
})
</script>

<style scoped>
.xn-upload__input {
  display: none !important;
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}

.xn-upload__drop {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.xn-upload__drop:hover,
.xn-upload__drop.is-over {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.xn-upload.is-disabled .xn-upload__drop {
  cursor: not-allowed;
  opacity: 0.6;
}

.xn-upload__drop-icon {
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.xn-upload__drop-text {
  font-size: var(--app-font-size-main, 14px);
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.xn-upload__drop-text em {
  color: var(--el-color-primary);
  font-style: normal;
}

.xn-upload__drop-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.xn-upload__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.xn-upload__summary {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.xn-upload__toolbar-actions {
  display: flex;
  gap: 8px;
}

.xn-upload__list {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.xn-upload__item {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 6px 10px;
  background: var(--el-fill-color-blank);
}

.xn-upload__item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.xn-upload__item :deep(.el-progress) {
  line-height: 1;
}

.xn-upload__item-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.xn-upload__item-name {
  min-width: 0;
  font-size: var(--app-font-size-main, 14px);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.xn-upload__item-size,
.xn-upload__item-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.xn-upload__item-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.xn-upload__item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.xn-upload__badge {
  padding: 0 6px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
  flex-shrink: 0;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.xn-upload__chunks {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-top: 4px;
}

.xn-upload__chunk {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: var(--el-fill-color-dark);
}

.xn-upload__chunk.is-uploading {
  background: var(--el-color-primary);
}

.xn-upload__chunk.is-success {
  background: var(--el-color-success);
}

.xn-upload__chunk.is-error {
  background: var(--el-color-danger);
}

.xn-upload__item-error {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-color-danger);
  word-break: break-all;
}
</style>
