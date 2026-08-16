<template>
  <el-aside v-show="visible" :width="width" class="layout-aside">
    <div v-if="showLogo" class="layout-aside__logo">
      <xnAppBrandLogo />
      <span>{{ title }}</span>
    </div>
    <div v-else-if="subtitle" class="layout-aside__subtitle">{{ subtitle }}</div>
    <div class="layout-aside__search">
      <el-input
        v-model="searchDraft"
        clearable
        placeholder="搜索菜单"
        @keyup.enter="runSearch"
        @clear="clearSearch"
      >
        <template #append>
          <el-button :icon="Search" aria-label="搜索菜单" @click="runSearch" />
        </template>
      </el-input>
    </div>
    <el-scrollbar ref="scrollRef" class="layout-aside__scroll">
      <xnSidebarMenu ref="menuCompRef" :menus="menus" :highlight-ids="highlightIds" />
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import xnAppBrandLogo from '@/components/xnAppBrandLogo/xnAppBrandLogo.vue'
import xnSidebarMenu from '@/components/xnSidebarMenu/xnSidebarMenu.vue'
import { appConfig } from '@/config/app'
import { useMenuStore } from '@/stores/menu'
import { collectSearchOpenIds, filterHiddenMenus, searchMenus } from '@/utils/menu'

const props = defineProps({
  visible: { type: Boolean, required: false, default: true },
  width: { type: String, required: false, default: '220px' },
  title: { type: String, required: false, default: appConfig.app.name },
  showLogo: { type: Boolean, required: false, default: true },
  subtitle: { required: false },
  menus: { required: false },
})

const menuStore = useMenuStore()
const searchDraft = ref('')
const highlightIds = ref([])
const scrollRef = ref(null)
const menuCompRef = ref(null)

const resolvedMenus = computed(() =>
  props.menus ? filterHiddenMenus(props.menus) : filterHiddenMenus(menuStore.menus),
)

function clearSearch() {
  searchDraft.value = ''
  highlightIds.value = []
}

async function runSearch() {
  const keyword = searchDraft.value.trim()
  if (!keyword) {
    highlightIds.value = []
    return
  }

  const hits = searchMenus(resolvedMenus.value, keyword)
  highlightIds.value = hits.map((h) => h.id)
  const openIds = collectSearchOpenIds(hits)
  await nextTick()
  menuCompRef.value?.openMenus(openIds)

  const firstId = hits[0]?.id
  if (!firstId) return
  await nextTick()
  // 等展开动画/DOM 更新后再滚动
  window.setTimeout(() => {
    const wrap = scrollRef.value?.wrapRef
    const scope = wrap ?? document
    const el = scope.querySelector(`[data-menu-id="${CSS.escape(firstId)}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, 120)
}
</script>

<style scoped>
.layout-aside {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--app-sidebar-bg);
  border-right: 1px solid var(--app-sidebar-border);
  overflow: hidden;
  font-size: var(--app-font-size-sidebar);
}

.layout-aside :deep(.el-menu),
.layout-aside :deep(.el-menu-item),
.layout-aside :deep(.el-sub-menu__title) {
  font-size: inherit;
}

.layout-aside__logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  margin: 8px 10px 4px;
  padding: 0 12px;
  color: var(--app-sidebar-text-active);
  font-size: var(--app-font-size-main);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.layout-aside__subtitle {
  flex-shrink: 0;
  height: 48px;
  margin: 4px 10px 0;
  padding: 0 12px;
  display: flex;
  align-items: center;
  color: var(--app-sidebar-text-active);
  font-size: var(--app-font-size-main);
  font-weight: 600;
}

.layout-aside__search {
  flex-shrink: 0;
  padding: 8px 10px 4px;
}

.layout-aside__search :deep(.el-input-group__append) {
  padding: 0;
  background: color-mix(in srgb, var(--app-sidebar-text) 12%, transparent);
  border-color: color-mix(in srgb, var(--app-sidebar-text) 22%, transparent);
  box-shadow: none;
}

.layout-aside__search :deep(.el-input__wrapper) {
  background: color-mix(in srgb, var(--app-sidebar-text) 8%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-sidebar-text) 22%, transparent) inset;
}

.layout-aside__search :deep(.el-input__inner) {
  color: var(--app-sidebar-text-active);
}

.layout-aside__search :deep(.el-input__inner::placeholder) {
  color: color-mix(in srgb, var(--app-sidebar-text) 70%, transparent);
}

.layout-aside__search :deep(.el-input__wrapper:hover),
.layout-aside__search :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--app-sidebar-text-active) 55%, transparent) inset;
}

.layout-aside__search :deep(.el-button) {
  margin: 0;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--app-sidebar-text-active);
}

.layout-aside__search :deep(.el-button:hover) {
  color: var(--app-sidebar-active);
  background: color-mix(in srgb, var(--app-sidebar-text) 14%, transparent);
}

.layout-aside__scroll {
  flex: 1;
  min-height: 0;
}

/* 细滚动条，颜色跟随侧栏文字，避免原生灰条 */
.layout-aside__scroll :deep(.el-scrollbar__bar) {
  z-index: 2;
}

.layout-aside__scroll :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
  right: 2px;
}

.layout-aside__scroll :deep(.el-scrollbar__bar.is-horizontal) {
  height: 4px;
  bottom: 2px;
}

.layout-aside__scroll :deep(.el-scrollbar__thumb) {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-sidebar-text) 42%, transparent);
  opacity: 1;
}

.layout-aside__scroll :deep(.el-scrollbar__thumb:hover) {
  background: color-mix(in srgb, var(--app-sidebar-text) 62%, transparent);
}
</style>
