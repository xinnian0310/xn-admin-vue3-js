<template>
  <div class="tags-view">
    <button
      v-show="showArrows"
      type="button"
      class="tags-view__arrow"
      :disabled="!canScrollLeft"
      title="向左"
      @click="scrollBy(-1)"
    >
      <el-icon><ArrowLeft /></el-icon>
    </button>

    <div ref="scrollRef" class="tags-view__scroll" @scroll="updateScrollState">
      <el-dropdown
        v-for="tag in tagsViewStore.visitedViews"
        :key="tag.path"
        trigger="contextmenu"
        placement="bottom-start"
        @command="(cmd) => onMenuCommand(cmd, tag)"
      >
        <div
          class="tags-view__item"
          :class="{ 'is-active': isActive(tag) }"
          @click="handleClick(tag)"
        >
          <span class="tags-view__title">{{ tag.title }}</span>
          <el-icon v-if="!tag.affix" class="tags-view__close" @click.stop="handleClose(tag)">
            <Close />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh" :icon="RefreshRight"> 刷新 </el-dropdown-item>
            <el-dropdown-item divided command="close" :icon="Close" :disabled="!!tag.affix">
              关闭当前
            </el-dropdown-item>
            <el-dropdown-item
              command="closeLeft"
              :icon="DArrowLeft"
              :disabled="!hasClosableLeft(tag)"
            >
              关闭左侧
            </el-dropdown-item>
            <el-dropdown-item
              command="closeRight"
              :icon="DArrowRight"
              :disabled="!hasClosableRight(tag)"
            >
              关闭右侧
            </el-dropdown-item>
            <el-dropdown-item command="closeAll" :icon="CircleClose" :disabled="!hasClosableAny()">
              关闭全部
            </el-dropdown-item>
            <el-dropdown-item divided command="fullscreen" :icon="FullScreen">
              全屏当前标签
            </el-dropdown-item>
            <el-dropdown-item command="openWindow" :icon="CopyDocument">
              在新窗口打开
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <button
      v-show="showArrows"
      type="button"
      class="tags-view__arrow"
      :disabled="!canScrollRight"
      title="向右"
      @click="scrollBy(1)"
    >
      <el-icon><ArrowRight /></el-icon>
    </button>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  CircleClose,
  Close,
  CopyDocument,
  DArrowLeft,
  DArrowRight,
  FullScreen,
  RefreshRight,
} from '@element-plus/icons-vue'
import { useTagsViewStore } from '@/stores/tagsView'
const route = useRoute()
const router = useRouter()
const tagsViewStore = useTagsViewStore()
const scrollRef = ref()
const showArrows = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
let resizeObserver = null
function isActive(tag) {
  return tag.path === route.path
}
function hasClosableLeft(tag) {
  const index = tagsViewStore.visitedViews.findIndex((v) => v.path === tag.path)
  if (index <= 0) return false
  return tagsViewStore.visitedViews.slice(0, index).some((v) => !v.affix)
}
function hasClosableRight(tag) {
  const index = tagsViewStore.visitedViews.findIndex((v) => v.path === tag.path)
  if (index === -1) return false
  return tagsViewStore.visitedViews.slice(index + 1).some((v) => !v.affix)
}
function hasClosableAny() {
  return tagsViewStore.visitedViews.some((v) => !v.affix)
}
function handleClick(tag) {
  if (tag.path !== route.path) {
    router.push(tag.path)
  }
}
function ensureRouteAlive(fallback) {
  if (!tagsViewStore.visitedViews.some((v) => v.path === route.path)) {
    router.push(fallback.path)
  }
}
function handleClose(tag) {
  const views = tagsViewStore.visitedViews
  const index = views.findIndex((v) => v.path === tag.path)
  tagsViewStore.delView(tag)
  if (tag.path !== route.path) {
    nextTick(updateScrollState)
    return
  }
  if (views.length <= 1) {
    router.push('/dashboard')
    return
  }
  const nextTag = views[index + 1] || views[index - 1]
  if (nextTag) {
    router.push(nextTag.path)
  } else {
    router.push('/dashboard')
  }
}
async function handleRefresh(tag) {
  if (tag.path !== route.path) {
    await router.push(tag.path)
  }
  tagsViewStore.delCachedView(tag.name)
  await router.replace({ path: `/redirect${tag.path}`, query: route.query })
}
async function handleFullscreen(tag) {
  if (tag.path !== route.path) {
    await router.push(tag.path)
  }
  tagsViewStore.setFullscreen(true)
}
function handleOpenWindow(tag) {
  const { href } = router.resolve(tag.path)
  window.open(href, '_blank')
}
async function onMenuCommand(command, tag) {
  await handleMenuCommand(command, tag)
}
async function handleMenuCommand(command, tag) {
  switch (command) {
    case 'refresh':
      await handleRefresh(tag)
      break
    case 'close':
      handleClose(tag)
      break
    case 'closeLeft':
      tagsViewStore.delLeftViews(tag)
      ensureRouteAlive(tag)
      break
    case 'closeRight':
      tagsViewStore.delRightViews(tag)
      ensureRouteAlive(tag)
      break
    case 'closeAll':
      tagsViewStore.delAllViews()
      ensureRouteAlive(tagsViewStore.visitedViews[0] || tag)
      break
    case 'fullscreen':
      await handleFullscreen(tag)
      break
    case 'openWindow':
      handleOpenWindow(tag)
      break
  }
  await nextTick()
  scheduleScrollActiveIntoView()
}
function updateScrollState() {
  const el = scrollRef.value
  if (!el) {
    showArrows.value = false
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }
  const overflow = el.scrollWidth > el.clientWidth + 1
  showArrows.value = overflow
  canScrollLeft.value = el.scrollLeft > 1
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}
function scrollBy(direction) {
  const el = scrollRef.value
  if (!el) return
  const step = Math.max(160, Math.floor(el.clientWidth * 0.6))
  el.scrollBy({ left: direction * step, behavior: 'smooth' })
}
function scrollActiveIntoView() {
  const container = scrollRef.value
  if (!container) {
    updateScrollState()
    return
  }
  const activeEl = container.querySelector('.tags-view__item.is-active')
  if (!activeEl) {
    updateScrollState()
    return
  }

  const padding = 12
  const cRect = container.getBoundingClientRect()
  const aRect = activeEl.getBoundingClientRect()

  if (aRect.left < cRect.left + padding) {
    container.scrollBy({ left: aRect.left - cRect.left - padding, behavior: 'smooth' })
  } else if (aRect.right > cRect.right - padding) {
    container.scrollBy({ left: aRect.right - cRect.right + padding, behavior: 'smooth' })
  }
  updateScrollState()
}
function scheduleScrollActiveIntoView() {
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollActiveIntoView)
  })
}
watch(
  () => route.path,
  async () => {
    await nextTick()
    scheduleScrollActiveIntoView()
  },
)
watch(
  () => tagsViewStore.visitedViews.length,
  async () => {
    await nextTick()
    scheduleScrollActiveIntoView()
  },
)
onMounted(() => {
  updateScrollState()
  scheduleScrollActiveIntoView()
  const el = scrollRef.value
  if (el && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => updateScrollState())
    resizeObserver.observe(el)
  }
  window.addEventListener('resize', updateScrollState)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', updateScrollState)
})
</script>

<style scoped>
.tags-view {
  display: flex;
  align-items: stretch;
  height: var(--app-tags-view-height);
  background: var(--app-tags-bg);
  border-bottom: 1px solid var(--app-tags-border);
  font-size: var(--app-font-size-tags-view);
}

.tags-view__arrow {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  border: none;
  border-right: 1px solid var(--app-tags-border);
  background: var(--app-tags-bg);
  color: var(--app-tags-item-text);
  cursor: pointer;
  padding: 0;
}

.tags-view__arrow:last-child {
  border-right: none;
  border-left: 1px solid var(--app-tags-border);
}

.tags-view__arrow:hover:not(:disabled) {
  color: var(--app-color-primary);
  background: var(--app-tags-item-hover-bg);
}

.tags-view__arrow:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.tags-view__scroll {
  display: flex;
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.tags-view__scroll::-webkit-scrollbar {
  display: none;
  height: 0;
}

.tags-view__scroll :deep(.el-dropdown) {
  display: inline-flex;
  height: 100%;
  flex-shrink: 0;
}

.tags-view__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0 12px;
  background: var(--app-tags-item-bg);
  color: var(--app-tags-item-text);
  font-size: inherit;
  cursor: pointer;
  white-space: nowrap;
  border: none;
  border-right: 1px solid var(--app-tags-border);
  transition:
    background 0.2s,
    color 0.2s;
  outline: none;
}

.tags-view__item:hover {
  background: var(--app-tags-item-hover-bg);
}

.tags-view__item.is-active {
  background: var(--app-tags-item-active-bg);
  color: var(--app-tags-item-active-text);
}

.tags-view__title {
  line-height: 1;
}

.tags-view__close {
  font-size: var(--app-font-size-main);
  border-radius: 50%;
  padding: 1px;
}

.tags-view__item:not(.is-active) .tags-view__close:hover {
  color: var(--app-color-primary);
  background: var(--app-color-primary-light-9);
}

.tags-view__item.is-active .tags-view__close:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
