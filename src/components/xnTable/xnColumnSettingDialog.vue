<template>
  <el-dialog
    v-model="visible"
    title="列设置"
    width="min(960px, 94vw)"
    destroy-on-close
    class="column-setting-dialog"
    @closed="emit('closed')"
  >
    <div class="column-setting">
      <div class="column-setting__head">
        <span class="col-drag" />
        <span class="col-label">列名</span>
        <span class="col-prop">字段值</span>
        <span class="col-width">宽度</span>
        <span class="col-enable">是否启用</span>
      </div>

      <div
        v-for="(row, index) in rows"
        :key="row.key"
        class="column-setting__row"
        :class="{
          'is-dragging': dragIndex === index,
          'is-locked': isLocked(row),
        }"
        :draggable="!isLocked(row)"
        @dragstart="onDragStart(index, $event)"
        @dragover.prevent="onDragOver(index)"
        @drop.prevent="onDrop(index)"
        @dragend="onDragEnd"
      >
        <span class="col-drag" :title="isLocked(row) ? '固定列不可拖动' : '拖动排序'">
          <el-icon><Rank /></el-icon>
        </span>
        <span class="col-label">
          <el-input v-model="row.label" placeholder="列名" :disabled="isLocked(row)" />
        </span>
        <span class="col-prop">
          <el-input :model-value="row.prop || '—'" disabled />
        </span>
        <span class="col-width">
          <el-input-number
            v-model="row.width"
            :min="40"
            :max="800"
            :step="10"
            controls-position="right"
            placeholder="自适应"
            :disabled="isLocked(row)"
          />
        </span>
        <span class="col-enable">
          <el-switch v-model="row.visible" />
        </span>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleReset">恢复默认</el-button>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Rank } from '@element-plus/icons-vue'
defineOptions({ name: 'xnColumnSettingDialog' })
const props = defineProps({
  modelValue: { required: true },
  columns: { required: true },
  saving: { required: false },
})
const emit = defineEmits(['update:modelValue', 'save', 'reset', 'closed'])
const visible = ref(props.modelValue)
const rows = ref([])
const dragIndex = ref(null)
function isLocked(row) {
  return !!row.locked || row.key === 'type:selection'
}
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      rows.value = props.columns.map((col, index) => {
        const locked = isLocked(col)
        return {
          ...col,
          label: locked ? '选择框' : col.label,
          visible: col.visible !== false,
          sort: index,
          width: col.width == null ? undefined : Number(col.width),
          locked,
        }
      })
    }
  },
)
watch(visible, (val) => emit('update:modelValue', val))
function onDragStart(index, event) {
  if (isLocked(rows.value[index])) {
    event.preventDefault()
    return
  }
  dragIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}
function onDragOver(index) {
  if (dragIndex.value == null || dragIndex.value === index) return
  if (isLocked(rows.value[index]) || isLocked(rows.value[dragIndex.value])) return
  const list = [...rows.value]
  const [moved] = list.splice(dragIndex.value, 1)
  list.splice(index, 0, moved)
  rows.value = list
  dragIndex.value = index
}
function onDrop(index) {
  onDragOver(index)
  dragIndex.value = null
}
function onDragEnd() {
  dragIndex.value = null
}
function handleReset() {
  emit('reset')
}
function handleSave() {
  emit(
    'save',
    rows.value.map((row, index) => ({
      ...row,
      label: isLocked(row) ? '选择框' : row.label,
      visible: row.visible !== false,
      sort: index,
      width: row.width == null ? undefined : Number(row.width),
    })),
  )
}
</script>

<style scoped>
.column-setting {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 60vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.column-setting__head,
.column-setting__row {
  display: grid;
  grid-template-columns: 32px minmax(0, 1.2fr) minmax(0, 1fr) 150px 88px;
  gap: 10px;
  align-items: center;
  min-width: 0;
  box-sizing: border-box;
}

.column-setting__head {
  padding: 0 8px 8px;
  color: var(--app-text-muted);
  font-size: var(--app-font-size-main);
  border-bottom: 1px solid var(--app-border-color);
}

.column-setting__row {
  padding: 8px;
  border: 1px solid var(--app-border-color);
  border-radius: 6px;
  background: var(--app-card-bg, #fff);
  cursor: grab;
}

.column-setting__row.is-locked {
  cursor: default;
  background: var(--app-fill-color, #fafafa);
}

.column-setting__row.is-locked .col-drag {
  color: #c0c4cc;
  cursor: not-allowed;
}

.column-setting__row.is-dragging {
  opacity: 0.6;
  border-color: var(--app-color-primary);
}

.col-drag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
}

.col-label,
.col-prop,
.col-width {
  min-width: 0;
}

.col-enable {
  display: inline-flex;
  justify-content: center;
}

.col-label :deep(.el-input),
.col-prop :deep(.el-input),
.col-width :deep(.el-input-number) {
  width: 100%;
}
</style>
