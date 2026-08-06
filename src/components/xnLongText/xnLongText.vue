<template>
  <span class="xn-long-text">
    <button
      v-if="hasText"
      type="button"
      class="xn-long-text__trigger"
      :title="'点击查看全部'"
      @click.stop="open"
    >
      {{ displayText }}
    </button>
    <span v-else class="xn-long-text__empty">{{ emptyText }}</span>

    <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="720px"
      append-to-body
      destroy-on-close
      class="xn-long-text__dialog"
    >
      <pre class="xn-long-text__body">{{ text }}</pre>
      <template #footer>
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="primary" @click="copyText">复制</el-button>
      </template>
    </el-dialog>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
defineOptions({ name: 'xnLongText' })
const props = defineProps({
  text: { type: String, required: false, default: '' },
  title: { type: String, required: false, default: '详细内容' },
  emptyText: { type: String, required: false, default: '—' },
  maxLength: { type: Number, required: false, default: 48 },
})
const visible = ref(false)
const normalized = computed(() => String(props.text ?? '').trim())
const hasText = computed(() => normalized.value.length > 0)
const displayText = computed(() => normalized.value)
const dialogTitle = computed(() => props.title || '详细内容')
function open() {
  if (!hasText.value) return
  visible.value = true
}
async function copyText() {
  try {
    await navigator.clipboard.writeText(normalized.value)
    ElMessage.success('已复制')
  } catch {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.xn-long-text {
  display: block;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.xn-long-text__trigger {
  display: block;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  overflow: hidden;
  color: var(--el-color-primary);
  font: inherit;
  line-height: inherit;
  text-align: left;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.xn-long-text__trigger:hover {
  text-decoration: underline;
}

.xn-long-text__empty {
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.xn-long-text__body {
  margin: 0;
  max-height: min(60vh, 480px);
  overflow: auto;
  padding: 12px 14px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
