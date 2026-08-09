<template>
  <el-main class="layout-content">
    <div class="layout-content__body">
      <router-view v-slot="{ Component, route: currentRoute }">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="currentRoute.path" />
        </keep-alive>
      </router-view>
    </div>
    <footer v-if="footerText && !tagsViewStore.isFullscreen" class="layout-content__footer">
      {{ footerText }}
    </footer>
  </el-main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { appConfig } from '@/config/app'
import { useTagsViewStore } from '@/stores/tagsView'

const tagsViewStore = useTagsViewStore()
const footerText = computed(() => appConfig.app.footer?.trim() || '')
</script>

<style scoped>
.layout-content {
  flex: 1;
  min-height: 0;
  background-color: var(--app-main-bg, #f5f7fa);
  background-image: var(--app-main-bg-image, none);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: var(--app-font-size-main);
  position: relative;
}

.layout-content__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* xnPageLayout：撑满高度，内部自行滚动 */
.layout-content__body :deep(> .page-layout),
.layout-content__body :deep(> .el-container) {
  flex: 1;
  min-height: 0;
  height: 100%;
}

/* 个人信息：左侧头像固定，右侧内部滚动 */
.layout-content__body :deep(> .profile-page) {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

.layout-content__body :deep(> .iframe-page) {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

/* 系统配置：整页占满，仅标签页内容区滚动 */
.layout-content__body :deep(> .system-config-page) {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

/* 组件演示：整页占满，左侧分类固定，右侧内容区滚动 */
.layout-content__body :deep(> .demo-page) {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}

/* 首页 / 监控等：内容超出时在主区域滚动 */
.layout-content__body
  :deep(
    > *:not(.page-layout):not(.el-container):not(.profile-page):not(.system-config-page):not(
        .iframe-page
      ):not(.demo-page)
  ) {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.layout-content__footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 16px;
  background: var(--app-card-bg, #fff);
  border-top: 1px solid var(--app-border-color, #ebeef5);
  color: var(--app-text-muted, #909399);
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  user-select: none;
}
</style>
