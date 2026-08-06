<template>
  <div class="page-layout" :class="{ 'is-with-aside': hasAside }">
    <aside v-if="hasAside" class="page-layout__aside">
      <slot name="aside" />
    </aside>

    <div class="page-layout__right">
      <div v-if="$slots.search" class="page-layout__search">
        <slot name="search" />
      </div>

      <div v-if="hasToolbar" class="page-layout__toolbar">
        <div class="page-layout__toolbar-left">
          <slot name="toolbar" />
        </div>
        <div class="page-layout__toolbar-right">
          <slot name="toolbar-extra" />
          <el-radio-group v-if="showViewSwitchActive" v-model="currentViewMode">
            <el-radio-button value="table">
              <el-icon><Grid /></el-icon>
              表格
            </el-radio-button>
            <el-radio-button value="card">
              <el-icon><Postcard /></el-icon>
              卡片
            </el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="page-layout__main" v-loading="loading">
        <template v-if="hasTableOrCard">
          <div class="page-layout__content">
            <div
              v-show="!showViewSwitchActive || currentViewMode === 'table'"
              class="page-layout__view page-layout__view--table"
            >
              <slot name="table" />
            </div>
            <div
              v-if="$slots.card"
              v-show="currentViewMode === 'card'"
              class="page-layout__view page-layout__view--card"
            >
              <slot name="card" />
            </div>
          </div>

          <div v-if="showPagination" class="page-layout__pagination">
            <slot name="pagination">
              <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="currentPageSize"
                :total="total"
                :page-sizes="pageSizes"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @size-change="handlePageChange"
                @current-change="handlePageChange"
              />
            </slot>
          </div>
        </template>

        <slot v-else />
      </div>

      <div v-if="$slots.footer" class="page-layout__footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Grid, Postcard } from '@element-plus/icons-vue'
defineOptions({ name: 'xnPageLayout' })
const props = defineProps({
  loading: { type: Boolean, required: false, default: false },
  showViewSwitch: { type: Boolean, required: false, default: true },
  viewMode: { type: String, required: false, default: 'table' },
  showPagination: { type: Boolean, required: false, default: false },
  page: { type: Number, required: false, default: 1 },
  pageSize: { type: Number, required: false, default: 10 },
  total: { type: Number, required: false, default: 0 },
  pageSizes: { type: Array, required: false, default: () => [10, 20, 50, 100] },
  persistViewMode: { type: Boolean, required: false, default: true },
})
const emit = defineEmits(['update:viewMode', 'update:page', 'update:pageSize', 'page-change'])
const route = useRoute()
const slots = useSlots()
const hasAside = computed(() => !!slots.aside)
const hasTableOrCard = computed(() => !!slots.table || !!slots.card)
const showViewSwitchActive = computed(() => props.showViewSwitch && !!slots.table && !!slots.card)
const hasToolbar = computed(
  () => !!slots.toolbar || !!slots['toolbar-extra'] || showViewSwitchActive.value,
)
const storageKey = computed(() => `xn-view-mode:${route.path}`)
function loadViewMode() {
  if (!props.persistViewMode) return props.viewMode
  const stored = localStorage.getItem(storageKey.value)
  if (stored === 'table' || stored === 'card') return stored
  return props.viewMode
}
const currentViewMode = computed({
  get: () => props.viewMode,
  set: (val) => {
    if (props.persistViewMode) {
      localStorage.setItem(storageKey.value, val)
    }
    emit('update:viewMode', val)
  },
})
const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
})
const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val),
})
function handlePageChange() {
  emit('page-change')
}
watch(
  () => route.path,
  () => {
    if (props.persistViewMode) {
      const stored = loadViewMode()
      if (stored !== props.viewMode) {
        emit('update:viewMode', stored)
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  background: var(--app-main-bg, #f5f7fa);
  box-sizing: border-box;
  overflow: hidden;
}

.page-layout.is-with-aside {
  flex-direction: row;
  /* gap: 10px; */
  background: var(--app-main-bg, #f5f7fa);
}

.page-layout__aside {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-border-color, #ebeef5);
  box-sizing: border-box;
  overflow: hidden;
}

.page-layout__right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 有左侧树时：左右各自成块，中间留缝，避免连成一片 */
.page-layout.is-with-aside .page-layout__right {
  border: 1px solid var(--app-border-color, #ebeef5);
  background: var(--app-card-bg, #fff);
  box-sizing: border-box;
}

.page-layout__search,
.page-layout__toolbar,
.page-layout__main {
  background: var(--app-card-bg, #fff);
  border-radius: 0;
  box-sizing: border-box;
}

.page-layout:not(.is-with-aside) .page-layout__search,
.page-layout:not(.is-with-aside) .page-layout__toolbar,
.page-layout:not(.is-with-aside) .page-layout__main {
  border: 1px solid var(--app-border-color, #e4e7ed);
}

.page-layout.is-with-aside .page-layout__search,
.page-layout.is-with-aside .page-layout__toolbar {
  border: none;
  border-bottom: 1px solid var(--app-border-color, #ebeef5);
}

.page-layout.is-with-aside .page-layout__main {
  border: none;
}

.page-layout__search {
  flex-shrink: 0;
  padding: 16px 16px 4px;
}

.page-layout__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 12px 16px;
  gap: 12px;
}

.page-layout__toolbar-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.page-layout__toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.page-layout__toolbar-right :deep(.el-radio-button__inner) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.page-layout__main {
  flex: 1;
  min-height: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.page-layout__content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-layout__view {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-layout__view--table :deep(.el-table),
.page-layout__view--table :deep(.xn-table) {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.page-layout__view--card {
  overflow-y: auto;
  padding: 16px;
}

.page-layout__view--card :deep(.page-card-grid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  align-content: start;
}

.page-layout__pagination {
  display: flex;
  justify-content: flex-start;
  padding: 8px 16px;
  flex-shrink: 0;
  background: var(--app-card-bg, #fff);
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.page-layout__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  padding: 12px 16px;
  background: var(--app-card-bg, #fff);
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.page-layout:not(.is-with-aside) .page-layout__footer {
  border: 1px solid var(--app-border-color, #e4e7ed);
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.page-layout.is-with-aside .page-layout__footer {
  border: none;
  border-top: 1px solid var(--app-border-color, #ebeef5);
}
</style>
