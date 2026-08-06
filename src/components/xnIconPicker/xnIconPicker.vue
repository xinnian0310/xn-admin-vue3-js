<template>
  <div class="icon-picker">
    <el-popover
      v-model:visible="popoverVisible"
      placement="bottom-start"
      :width="440"
      trigger="manual"
      :disabled="disabled"
      :persistent="true"
      :teleported="true"
      popper-class="icon-picker-popper"
    >
      <template #reference>
        <div
          class="icon-picker__trigger"
          :class="{ 'is-disabled': disabled, 'is-empty': !modelValue }"
          @click.stop="toggle"
        >
          <xnAppIcon v-if="modelValue" :name="modelValue" />
          <span class="icon-picker__label">{{ modelValue || placeholder }}</span>
          <el-icon v-if="modelValue && !disabled" class="icon-picker__clear" @click.stop="clear">
            <CircleClose />
          </el-icon>
          <el-icon v-else class="icon-picker__arrow"><ArrowDown /></el-icon>
        </div>
      </template>

      <div class="icon-picker__panel" @click.stop @mousedown.stop>
        <el-radio-group v-model="activeTab" class="icon-picker__tabs">
          <el-radio-button value="element">Element</el-radio-button>
          <el-radio-button value="iconify">Iconify</el-radio-button>
          <el-radio-button value="svg">SVG</el-radio-button>
        </el-radio-group>

        <el-input
          v-model="keyword"
          clearable
          :placeholder="searchPlaceholder"
          class="icon-picker__search"
        />

        <div v-if="activeTab === 'iconify'" class="icon-picker__iconify-input">
          <el-input
            v-model="iconifyInput"
            placeholder="输入 Iconify 名称，如 mdi:home，回车选用"
            @keyup.enter="applyIconifyInput"
          >
            <template #append>
              <el-button @click="applyIconifyInput">选用</el-button>
            </template>
          </el-input>
          <div class="icon-picker__hint">
            可在
            <a href="https://icon-sets.iconify.design/" target="_blank" rel="noreferrer">Iconify</a>
            搜索后粘贴至此
          </div>
        </div>

        <div class="icon-picker__scroll-wrap">
          <el-scrollbar height="100%" class="icon-picker__scroll">
            <div class="icon-picker__grid" :class="{ 'is-element': activeTab === 'element' }">
              <button
                v-for="item in displayList"
                :key="item.value"
                type="button"
                class="icon-picker__item"
                :class="{ 'is-active': modelValue === item.value }"
                :title="item.value"
                @click="select(item.value)"
              >
                <xnAppIcon :name="item.value" />
                <span class="icon-picker__item-name">{{ item.label }}</span>
              </button>
              <div v-if="!displayList.length" class="icon-picker__empty">暂无匹配图标</div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ArrowDown, CircleClose } from '@element-plus/icons-vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import {
  ICONIFY_PRESETS,
  buildIconValue,
  listElementIconNames,
  listSvgIconNames,
  parseIcon,
} from '@/utils/icons'
const props = defineProps({
  modelValue: { type: String, required: false, default: '' },
  disabled: { required: false },
  placeholder: { type: String, required: false, default: '选择图标' },
})
const emit = defineEmits(['update:modelValue'])
const popoverVisible = ref(false)
const keyword = ref('')
const iconifyInput = ref('')
const activeTab = ref('element')
const elementNames = listElementIconNames()
const svgNames = listSvgIconNames()
watch(
  () => props.modelValue,
  (val) => {
    const parsed = parseIcon(val)
    if (parsed) {
      activeTab.value = parsed.type
      if (parsed.type === 'iconify') iconifyInput.value = parsed.name
    }
  },
  { immediate: true },
)
const searchPlaceholder = computed(() => {
  if (activeTab.value === 'element') return '搜索 Element 图标名，如 Setting'
  if (activeTab.value === 'iconify') return '筛选预设，如 home / dashboard'
  return '搜索本地 SVG 文件名'
})
const displayList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (activeTab.value === 'element') {
    return elementNames
      .filter((name) => !kw || name.toLowerCase().includes(kw))
      .slice(0, 200)
      .map((name) => ({ value: buildIconValue('element', name), label: name }))
  }
  if (activeTab.value === 'svg') {
    return svgNames
      .filter((name) => !kw || name.toLowerCase().includes(kw))
      .map((name) => ({ value: buildIconValue('svg', name), label: name }))
  }
  return ICONIFY_PRESETS.filter((name) => !kw || name.toLowerCase().includes(kw)).map((name) => ({
    value: name,
    label: name.includes(':') ? name.split(':')[1] : name,
  }))
})
function toggle() {
  if (props.disabled) return
  popoverVisible.value = !popoverVisible.value
}
function select(value) {
  emit('update:modelValue', value)
  popoverVisible.value = false
}
function clear() {
  emit('update:modelValue', '')
  popoverVisible.value = false
}
function applyIconifyInput() {
  const name = iconifyInput.value.trim()
  if (!name.includes(':')) return
  activeTab.value = 'iconify'
  select(buildIconValue('iconify', name))
}
/** 点击页面其他区域关闭（避开触发器和弹出层本身） */
function onDocPointerDown(event) {
  if (!popoverVisible.value) return
  const target = event.target
  if (!target) return
  if (target.closest('.icon-picker') || target.closest('.icon-picker-popper')) return
  popoverVisible.value = false
}
onMounted(() => {
  document.addEventListener('mousedown', onDocPointerDown, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocPointerDown, true)
})
</script>

<style scoped>
.icon-picker {
  width: 100%;
}

.icon-picker__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 4px 11px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-blank);
  cursor: pointer;
  box-sizing: border-box;
}

.icon-picker__trigger:hover:not(.is-disabled) {
  border-color: var(--el-border-color-hover);
}

.icon-picker__trigger.is-disabled {
  cursor: not-allowed;
  background: var(--el-disabled-bg-color);
  color: var(--el-text-color-placeholder);
}

.icon-picker__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--app-font-size-main);
  color: var(--el-text-color-regular);
}

.icon-picker__trigger.is-empty .icon-picker__label {
  color: var(--el-text-color-placeholder);
}

.icon-picker__clear,
.icon-picker__arrow {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}

.icon-picker__panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 100%;
  /* 固定面板高度，避免切换 Element / Iconify / SVG 时高度变化导致弹层位置跳动 */
  height: 388px;
  overflow: hidden;
}

.icon-picker__tabs {
  width: 100%;
  display: flex !important;
  flex-wrap: nowrap;
}

.icon-picker__tabs :deep(.el-radio-button) {
  flex: 1 1 0;
  min-width: 0;
}

.icon-picker__tabs :deep(.el-radio-button__inner) {
  width: 100%;
  padding: 8px 0;
  font-size: var(--app-font-size-main);
}

.icon-picker__search {
  margin-top: 0;
}

.icon-picker__iconify-input {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.icon-picker__hint {
  font-size: var(--app-font-size-main);
  color: var(--el-text-color-secondary);
}

.icon-picker__hint a {
  color: var(--el-color-primary);
}

.icon-picker__scroll-wrap {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.icon-picker__scroll {
  width: 100%;
  height: 100%;
}

.icon-picker__scroll :deep(.el-scrollbar__wrap) {
  overflow-x: hidden !important;
}

.icon-picker__scroll :deep(.el-scrollbar__view) {
  max-width: 100%;
  overflow-x: hidden;
}

.icon-picker__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding: 2px 0 4px;
  width: 100%;
  box-sizing: border-box;
}

.icon-picker__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 0;
  width: 100%;
  padding: 8px 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  cursor: pointer;
  color: inherit;
  box-sizing: border-box;
}

.icon-picker__item:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.icon-picker__item.is-active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.icon-picker__item-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--app-font-size-main);
  color: var(--el-text-color-secondary);
}

.icon-picker__empty {
  grid-column: 1 / -1;
  padding: 24px 0;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: var(--app-font-size-main);
}
</style>

<!-- popover 挂载到 body，补一层全局样式保证 Tab 一行三等分 -->
<style>
.icon-picker-popper .icon-picker__tabs {
  width: 100%;
  display: flex !important;
  flex-wrap: nowrap !important;
}

.icon-picker-popper .icon-picker__tabs .el-radio-button {
  flex: 1 1 0;
  min-width: 0;
}

.icon-picker-popper .icon-picker__tabs .el-radio-button__inner {
  width: 100%;
  padding: 8px 0;
  font-size: var(--app-font-size-main);
}
</style>
