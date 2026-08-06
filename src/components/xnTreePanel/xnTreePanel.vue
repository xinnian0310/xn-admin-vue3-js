<template>
  <div class="tree-panel" :style="panelStyle">
    <div v-if="title || $slots.title" class="tree-panel__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <div v-if="filterable" class="tree-panel__search">
      <el-input
        :model-value="filter"
        :placeholder="filterPlaceholder"
        clearable
        @update:model-value="onFilterUpdate"
      />
    </div>

    <el-scrollbar class="tree-panel__scroll">
      <slot>
        <el-tree
          v-if="data"
          ref="treeRef"
          :data="data"
          :node-key="nodeKey"
          :props="treeProps"
          :default-expand-all="defaultExpandAll"
          :highlight-current="highlightCurrent"
          :expand-on-click-node="expandOnClickNode"
          :filter-node-method="resolvedFilterMethod"
          :current-node-key="currentKey"
          class="tree-panel__tree"
          @node-click="onNodeClick"
        >
          <template v-if="$slots.node" #default="scope">
            <slot name="node" v-bind="scope" />
          </template>
        </el-tree>
      </slot>
    </el-scrollbar>

    <div v-if="$slots.footer" class="tree-panel__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
defineOptions({ name: 'xnTreePanel' })
const props = defineProps({
  title: { required: false },
  width: { type: String, required: false, default: '260px' },
  filter: { type: String, required: false, default: '' },
  filterable: { type: Boolean, required: false, default: true },
  filterPlaceholder: { type: String, required: false, default: '搜索' },
  data: { required: false },
  nodeKey: { type: String, required: false, default: 'id' },
  treeProps: {
    type: Object,
    required: false,
    default: () => ({ label: 'label', children: 'children' }),
  },
  defaultExpandAll: { type: Boolean, required: false, default: true },
  highlightCurrent: { type: Boolean, required: false, default: true },
  expandOnClickNode: { type: Boolean, required: false, default: false },
  currentKey: { required: false },
  filterNodeMethod: { required: false },
})
const emit = defineEmits(['update:filter', 'node-click'])
const treeRef = ref()
const panelStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}))
const resolvedFilterMethod = computed(() => {
  if (props.filterNodeMethod) return props.filterNodeMethod
  const labelKey = props.treeProps?.label || 'label'
  return (value, data) => {
    if (!value) return true
    const label = data[labelKey]
    return String(label ?? '')
      .toLowerCase()
      .includes(value.toLowerCase())
  }
})
function onFilterUpdate(value) {
  emit('update:filter', value)
}
function onNodeClick(data, node, event) {
  const disabledKey = props.treeProps?.disabled || 'disabled'
  if (data?.[disabledKey]) return
  emit('node-click', data, node, event)
}
function setCurrentKey(key) {
  treeRef.value?.setCurrentKey(key)
}
function filterTree(value) {
  treeRef.value?.filter(value ?? props.filter)
}
watch(
  () => props.filter,
  async (value) => {
    await nextTick()
    filterTree(value)
  },
)
watch(
  () => props.currentKey,
  async (key) => {
    await nextTick()
    if (key != null) setCurrentKey(key)
  },
)
defineExpose({
  treeRef,
  setCurrentKey,
  filter: filterTree,
})
</script>

<style scoped>
.tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.tree-panel__title {
  flex-shrink: 0;
  font-size: var(--app-font-size-main);
  font-weight: 600;
  color: var(--app-text-primary);
}

.tree-panel__search {
  flex-shrink: 0;
}

.tree-panel__scroll {
  flex: 1;
  min-height: 0;
}

.tree-panel__footer {
  flex-shrink: 0;
  padding-top: 12px;
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.tree-panel__scroll :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
  right: 2px;
}

.tree-panel__scroll :deep(.el-scrollbar__thumb) {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-text-muted) 55%, transparent);
  opacity: 1;
}

.tree-panel__tree {
  background: transparent;
  --el-tree-node-hover-bg-color: rgba(var(--app-color-primary-rgb), 0.12);
  --el-color-primary-light-9: rgba(var(--app-color-primary-rgb), 0.12);
}

.tree-panel__tree :deep(.el-tree-node__content) {
  height: 34px;
  border-radius: 6px;
  color: var(--app-text-primary);
}

.tree-panel__tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: rgba(var(--app-color-primary-rgb), 0.18) !important;
  color: var(--app-color-primary);
  font-weight: 600;
}

.tree-panel__tree :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__label) {
  color: var(--app-color-primary);
}
</style>
