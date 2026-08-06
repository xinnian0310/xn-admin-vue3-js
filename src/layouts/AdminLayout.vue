<template>
  <div class="admin-layout" :class="{ 'is-fullscreen': tagsViewStore.isFullscreen }">
    <component :is="layoutComponent" :is-fullscreen="tagsViewStore.isFullscreen" />

    <UiPreferenceFab />

    <transition name="fade">
      <button
        v-if="tagsViewStore.isFullscreen"
        type="button"
        class="exit-fullscreen"
        title="退出全屏 (Esc)"
        @click="tagsViewStore.setFullscreen(false)"
      >
        <el-icon><Close /></el-icon>
        <span>退出全屏</span>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { appConfig } from '@/config/app'
import { useNoticeStore } from '@/stores/notice'
import { useTagsViewStore } from '@/stores/tagsView'
import UiPreferenceFab from '@/components/UiPreference/UiPreferenceFab.vue'
import SideLayout from './modes/SideLayout.vue'
import TopLayout from './modes/TopLayout.vue'
import MixLayout from './modes/MixLayout.vue'
import ColumnsLayout from './modes/ColumnsLayout.vue'
const tagsViewStore = useTagsViewStore()
const noticeStore = useNoticeStore()
const layoutMap = {
  side: SideLayout,
  top: TopLayout,
  mix: MixLayout,
  columns: ColumnsLayout,
}
const layoutComponent = computed(() => layoutMap[appConfig.ui.layout.mode] ?? SideLayout)
function onKeydown(e) {
  if (e.key === 'Escape' && tagsViewStore.isFullscreen) {
    tagsViewStore.setFullscreen(false)
  }
}
onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  noticeStore.startRealtime()
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  tagsViewStore.setFullscreen(false)
  noticeStore.stopRealtime()
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  position: relative;
}

.exit-fullscreen {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 3000;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  border: 1px solid var(--app-border-color, #dcdfe6);
  border-radius: 4px;
  background: var(--app-card-bg, #fff);
  color: var(--app-text-muted, #606266);
  font-size: var(--app-font-size-main);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.exit-fullscreen:hover {
  color: var(--app-color-primary);
  border-color: var(--app-color-primary-light-5);
  background: var(--app-color-primary-light-9);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
