<template>
  <!-- 双列侧栏：窄图标栏（一级）+ 展开侧栏（子菜单） -->
  <el-container class="layout-columns">
    <aside v-show="!isFullscreen" class="layout-columns__rail">
      <div class="layout-columns__brand" :title="appConfig.app.name">
        <xnAppBrandLogo />
      </div>
      <button
        v-for="item in rootMenus"
        :key="item.id"
        type="button"
        class="layout-columns__rail-item"
        :class="{ 'is-active': item.id === activeTopId }"
        :title="item.title"
        @click="onRailClick(item)"
      >
        <xnAppIcon v-if="item.icon" :name="item.icon" :size="20" />
        <span v-else class="layout-columns__rail-text">{{ item.title.charAt(0) }}</span>
      </button>
    </aside>

    <LayoutAside
      v-if="sideMenus.length"
      :visible="!isFullscreen"
      :show-logo="false"
      :subtitle="activeTop?.title"
      :menus="sideMenus"
      width="200px"
    />

    <el-container class="layout-columns__main">
      <LayoutHeader :visible="!isFullscreen" />
      <xnTagsView v-show="!isFullscreen" />
      <LayoutContent />
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import xnAppBrandLogo from '@/components/xnAppBrandLogo/xnAppBrandLogo.vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import xnTagsView from '@/components/xnTagsView/xnTagsView.vue'
import { useMenuStore } from '@/stores/menu'
import { filterHiddenMenus, findFirstNavigablePath, findTopLevelMenu } from '@/utils/menu'
import { appConfig } from '@/config/app'
import LayoutAside from '../components/LayoutAside.vue'
import LayoutHeader from '../components/LayoutHeader.vue'
import LayoutContent from '../components/LayoutContent.vue'
defineProps({
  isFullscreen: { required: true },
})
const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const rootMenus = computed(() => filterHiddenMenus(menuStore.menus))
const activePath = computed(() => {
  if (route.meta.activeMenu) return route.meta.activeMenu
  return route.path.replace(/\/save(\/.*)?$/, '') || route.path
})
const activeTop = computed(
  () => findTopLevelMenu(rootMenus.value, activePath.value) ?? rootMenus.value[0],
)
const activeTopId = computed(() => activeTop.value?.id ?? '')
const sideMenus = computed(() => activeTop.value?.children ?? [])
function onRailClick(item) {
  const path = findFirstNavigablePath(item)
  if (path && path !== route.path) {
    router.push(path)
  }
}
</script>

<style scoped>
.layout-columns {
  height: 100%;
}

.layout-columns__rail {
  width: 64px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 0 12px;
  background: var(--app-sidebar-rail-bg);
  border-right: 1px solid var(--app-sidebar-border);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--app-sidebar-text) 45%, transparent) transparent;
}

.layout-columns__rail::-webkit-scrollbar {
  width: 4px;
}

.layout-columns__rail::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-sidebar-text) 42%, transparent);
}

.layout-columns__rail::-webkit-scrollbar-track {
  background: transparent;
}

.layout-columns__brand {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50px;
  color: var(--app-sidebar-active);
  margin-bottom: 8px;
}

.layout-columns__rail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--app-sidebar-text);
  cursor: pointer;
}

.layout-columns__rail-item:hover {
  color: var(--app-sidebar-text-active);
  background: var(--app-sidebar-hover-bg);
}

.layout-columns__rail-item.is-active {
  color: var(--app-sidebar-text-active);
  background: var(--app-sidebar-active-bg);
}

.layout-columns__rail-text {
  font-size: 14px;
  font-weight: 600;
}

.layout-columns__main {
  flex-direction: column;
  min-width: 0;
}
</style>
