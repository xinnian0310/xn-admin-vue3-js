<template>
  <!-- 顶部菜单布局：Logo + 菜单在顶栏，无左侧侧栏 -->
  <el-container class="layout-top" direction="vertical">
    <el-header v-show="!isFullscreen" class="layout-top__header">
      <div class="layout-top__brand">
        <xnAppBrandLogo />
        <span>{{ appConfig.app.name }}</span>
      </div>
      <div class="layout-top__menu">
        <xnSidebarMenu mode="horizontal" />
      </div>
      <LayoutHeader embed class="layout-top__user" />
    </el-header>

    <xnTagsView v-show="!isFullscreen" />
    <LayoutContent />
  </el-container>
</template>

<script setup>
import xnAppBrandLogo from '@/components/xnAppBrandLogo/xnAppBrandLogo.vue'
import xnSidebarMenu from '@/components/xnSidebarMenu/xnSidebarMenu.vue'
import xnTagsView from '@/components/xnTagsView/xnTagsView.vue'
import { appConfig } from '@/config/app'
import LayoutHeader from '../components/LayoutHeader.vue'
import LayoutContent from '../components/LayoutContent.vue'
defineProps({
  isFullscreen: { required: true },
})
</script>

<style scoped>
.layout-top {
  height: 100%;
}

.layout-top__header {
  display: flex;
  align-items: center;
  gap: 16px;
  height: 50px;
  padding: 0 16px;
  background: var(--app-sidebar-bg);
  border-bottom: 1px solid var(--app-sidebar-border);
}

.layout-top__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  color: var(--app-sidebar-text-active);
  font-size: var(--app-font-size-main);
  font-weight: 600;
}

.layout-top__menu {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.layout-top__menu :deep(.el-menu) {
  border-bottom: none;
  background: transparent !important;
}

.layout-top__user {
  flex-shrink: 0;
}

.layout-top__user :deep(.layout-header__username),
.layout-top__user :deep(.el-icon) {
  color: var(--app-sidebar-text-active);
}
</style>
