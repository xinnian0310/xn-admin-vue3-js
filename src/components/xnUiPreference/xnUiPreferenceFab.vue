<template>
  <button
    type="button"
    class="ui-pref-fab"
    :class="{ 'is-dragging': dragging, 'is-open': drawerVisible, 'is-peek': peek }"
    :style="{ top: `${topPx}px` }"
    title="界面偏好（可上下拖动，平时半隐）"
    aria-label="界面偏好"
    @pointerdown="onPointerDown"
  >
    <el-icon :size="16"><Setting /></el-icon>
  </button>

  <el-drawer
    v-model="drawerVisible"
    title="界面偏好"
    direction="rtl"
    size="420px"
    append-to-body
    destroy-on-close
    @closed="closeDrawer"
  >
    <p class="ui-pref-hint">
      自定义本账号的布局模式、系统字号与标签栏高度；未设置的项沿用管理员通用配置。
    </p>
    <el-form label-width="100px" class="ui-pref-form" @submit.prevent>
      <el-form-item label="布局模式">
        <el-radio-group v-model="form.layoutMode">
          <el-radio-button value="side">左侧</el-radio-button>
          <el-radio-button value="top">顶部</el-radio-button>
          <el-radio-button value="mix">混合</el-radio-button>
          <el-radio-button value="columns">双列</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="弹窗最大高度">
        <el-input v-model="form.dialogMaxHeight" placeholder="如 95vh" />
      </el-form-item>
      <el-form-item label="标签栏高度">
        <div class="px-field">
          <el-input-number
            v-model="form.tagsViewHeight"
            :min="1"
            :max="120"
            :step="1"
            controls-position="right"
          />
          <span class="px-field__unit">px</span>
        </div>
      </el-form-item>
      <el-form-item label="侧栏字号">
        <div class="px-field">
          <el-input-number
            v-model="form.sidebar"
            :min="1"
            :max="48"
            :step="1"
            controls-position="right"
          />
          <span class="px-field__unit">px</span>
        </div>
      </el-form-item>
      <el-form-item label="顶栏字号">
        <div class="px-field">
          <el-input-number
            v-model="form.header"
            :min="1"
            :max="48"
            :step="1"
            controls-position="right"
          />
          <span class="px-field__unit">px</span>
        </div>
      </el-form-item>
      <el-form-item label="标签栏字号">
        <div class="px-field">
          <el-input-number
            v-model="form.tagsView"
            :min="1"
            :max="48"
            :step="1"
            controls-position="right"
          />
          <span class="px-field__unit">px</span>
        </div>
      </el-form-item>
      <el-form-item label="正文字号">
        <div class="px-field">
          <el-input-number
            v-model="form.main"
            :min="1"
            :max="48"
            :step="1"
            controls-position="right"
          />
          <span class="px-field__unit">px</span>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="ui-pref-footer">
        <el-button :loading="resetting" @click="onReset">恢复通用</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting } from '@element-plus/icons-vue'
import { appConfig } from '@/config/app'
import { useUiPreferenceStore } from '@/stores/uiPreference'
import { parsePxInt, toPx } from '@/utils/px'
import { showCaughtError } from '@/utils/request'
const STORAGE_KEY = 'xn-ui-pref-fab-top'
const FAB_HEIGHT = 48
const DRAG_THRESHOLD = 4
const EDGE_PROXIMITY = 28
const Y_PAD = 48
const uiPrefStore = useUiPreferenceStore()
const saving = ref(false)
const resetting = ref(false)
const dragging = ref(false)
const peek = ref(false)
const topPx = ref(loadTop())
const drawerVisible = computed({
  get: () => uiPrefStore.drawerVisible,
  set: (v) => {
    if (v) uiPrefStore.openDrawer()
    else uiPrefStore.closeDrawer()
  },
})
const form = reactive({
  layoutMode: 'side',
  dialogMaxHeight: '95vh',
  tagsViewHeight: 40,
  sidebar: 14,
  header: 14,
  tagsView: 14,
  main: 14,
})
function loadTop() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const n = raw ? Number(raw) : NaN
  if (Number.isFinite(n)) return clampTop(n)
  return Math.round(window.innerHeight * 0.62)
}
function clampTop(value) {
  const max = Math.max(8, window.innerHeight - FAB_HEIGHT - 8)
  return Math.min(max, Math.max(8, Math.round(value)))
}
function persistTop() {
  localStorage.setItem(STORAGE_KEY, String(topPx.value))
}
function syncFormFromApp() {
  form.layoutMode = appConfig.ui.layout.mode
  form.dialogMaxHeight = appConfig.ui.dialog.maxHeight
  form.tagsViewHeight = parsePxInt(appConfig.ui.tagsView.height, 40)
  form.sidebar = parsePxInt(appConfig.ui.fontSize.sidebar, 14)
  form.header = parsePxInt(appConfig.ui.fontSize.header, 14)
  form.tagsView = parsePxInt(appConfig.ui.fontSize.tagsView, 14)
  form.main = parsePxInt(appConfig.ui.fontSize.main, 14)
}
watch(
  () => uiPrefStore.drawerVisible,
  (open) => {
    if (open) syncFormFromApp()
  },
)
function closeDrawer() {
  uiPrefStore.closeDrawer()
}
let pointerId = null
let startY = 0
let startTop = 0
let moved = false
function onPointerDown(e) {
  if (e.button !== 0) return
  pointerId = e.pointerId
  startY = e.clientY
  startTop = topPx.value
  moved = false
  dragging.value = true
  e.currentTarget.setPointerCapture(e.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
}
function onPointerMove(e) {
  if (pointerId !== e.pointerId) return
  const dy = e.clientY - startY
  if (Math.abs(dy) > DRAG_THRESHOLD) moved = true
  topPx.value = clampTop(startTop + dy)
}
function onPointerUp(e) {
  if (pointerId !== e.pointerId) return
  pointerId = null
  dragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  persistTop()
  if (!moved) uiPrefStore.openDrawer()
}
function onResize() {
  topPx.value = clampTop(topPx.value)
}
function onMouseMove(e) {
  if (dragging.value || drawerVisible.value) {
    peek.value = true
    return
  }
  const nearRight = window.innerWidth - e.clientX <= EDGE_PROXIMITY
  const nearY = e.clientY >= topPx.value - Y_PAD && e.clientY <= topPx.value + FAB_HEIGHT + Y_PAD
  peek.value = nearRight && nearY
}
onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
})
async function onSave() {
  saving.value = true
  try {
    await uiPrefStore.save({
      layout: { mode: form.layoutMode },
      dialog: { maxHeight: form.dialogMaxHeight.trim() || '95vh' },
      tagsView: { height: toPx(form.tagsViewHeight, 40) },
      fontSize: {
        sidebar: toPx(form.sidebar, 14),
        header: toPx(form.header, 14),
        tagsView: toPx(form.tagsView, 14),
        main: toPx(form.main, 14),
      },
    })
    ElMessage.success('个人布局已保存')
    closeDrawer()
  } catch (err) {
    showCaughtError(err, '保存失败')
  } finally {
    saving.value = false
  }
}
async function onReset() {
  resetting.value = true
  try {
    await uiPrefStore.reset()
    syncFormFromApp()
    ElMessage.success('已恢复为通用配置')
  } catch (err) {
    showCaughtError(err, '重置失败')
  } finally {
    resetting.value = false
  }
}
</script>

<style scoped>
.ui-pref-fab {
  position: fixed;
  right: 0;
  z-index: 2800;
  width: 36px;
  height: 48px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 24px 0 0 24px;
  background: var(--app-color-primary, var(--el-color-primary));
  color: #fff;
  cursor: grab;
  box-shadow: -2px 2px 10px
    color-mix(in srgb, var(--app-color-primary, var(--el-color-primary)) 40%, transparent);
  transform: translateX(50%);
  transition:
    transform 0.2s ease,
    filter 0.15s ease;
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}

.ui-pref-fab::before {
  content: '';
  position: absolute;
  top: -12px;
  bottom: -12px;
  left: -20px;
  right: 0;
}

.ui-pref-fab.is-peek,
.ui-pref-fab:hover,
.ui-pref-fab.is-open,
.ui-pref-fab.is-dragging {
  transform: translateX(0);
  filter: brightness(1.05);
}

.ui-pref-fab.is-dragging {
  cursor: grabbing;
  transition: none;
  filter: brightness(1.08);
}

.ui-pref-hint {
  margin: 0 0 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.ui-pref-form :deep(.el-radio-group) {
  display: flex;
  flex-wrap: nowrap;
}

.ui-pref-form :deep(.el-input-number) {
  width: 140px;
}

.px-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.px-field__unit {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.ui-pref-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
