<template>
  <component :is="tag" v-show="visible" class="layout-header" :class="{ 'is-embed': embed }">
    <div class="layout-header__left">
      <slot name="left" />
    </div>
    <div class="layout-header__right">
      <slot name="right">
        <div class="layout-header__tools">
          <el-tooltip content="消息" effect="light" placement="bottom" :show-after="200">
            <button type="button" class="layout-header__tool" @click="noticeStore.openDrawer()">
              <el-badge
                :value="noticeStore.unreadCount"
                :hidden="!noticeStore.unreadCount"
                :max="99"
              >
                <el-icon :size="18"><Bell /></el-icon>
              </el-badge>
            </button>
          </el-tooltip>

          <el-tooltip
            :content="isFullscreen ? '退出全屏 (Esc)' : '全屏'"
            effect="light"
            placement="bottom"
            :show-after="200"
          >
            <button type="button" class="layout-header__tool" @click.stop="handleFullscreenClick">
              <el-icon :size="18">
                <component :is="isFullscreen ? Close : FullScreen" />
              </el-icon>
            </button>
          </el-tooltip>

          <el-tooltip content="主题设置" effect="light" placement="bottom" :show-after="200">
            <button type="button" class="layout-header__tool" @click="themeStore.openDialog()">
              <el-icon :size="18"><Brush /></el-icon>
            </button>
          </el-tooltip>

          <el-dropdown trigger="click" @command="handleCommand">
            <span class="layout-header__user">
              <el-avatar :size="28" :src="userStore.user?.avatar">{{ avatarText }}</el-avatar>
              <span class="layout-header__username">
                {{ userStore.user?.nickname || userStore.user?.username }}
              </span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" :icon="User">个人信息</el-dropdown-item>
                <el-dropdown-item divided command="logout" :icon="SwitchButton">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </slot>
    </div>
  </component>

  <xnNoticeInbox />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowDown,
  Bell,
  Brush,
  Close,
  FullScreen,
  SwitchButton,
  User,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnNoticeInbox from '@/components/xnNoticeInbox/xnNoticeInbox.vue'
import { useNoticeStore } from '@/stores/notice'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import {
  isBrowserFullscreen,
  isFullscreenEnabled,
  onBrowserFullscreenChange,
  toggleBrowserFullscreen,
} from '@/utils/fullscreen'
const props = defineProps({
  visible: { type: Boolean, required: false, default: true },
  embed: { type: Boolean, required: false, default: false },
})
const tag = computed(() => (props.embed ? 'div' : 'el-header'))
const router = useRouter()
const userStore = useUserStore()
const themeStore = useThemeStore()
const noticeStore = useNoticeStore()
const isFullscreen = ref(isBrowserFullscreen())
let offFullscreen
const avatarText = computed(() => {
  const name = userStore.user?.nickname || userStore.user?.username || 'U'
  return name.charAt(0).toUpperCase()
})
async function handleCommand(command) {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定退出登录吗？', '提示', {
        type: 'warning',
        confirmButtonText: '退出',
        cancelButtonText: '取消',
      })
    } catch {
      return
    }
    noticeStore.stopRealtime()
    await userStore.logout()
    await router.push('/login')
    return
  }
  if (command === 'profile') {
    router.push('/profile')
  }
}
/** 浏览器原生全屏（Fullscreen API，接近 F11） */
function handleFullscreenClick() {
  if (!isFullscreenEnabled()) {
    ElMessage.warning('当前环境不支持全屏，请直接按键盘 F11')
    return
  }
  // 在点击同步栈内发起 requestFullscreen，避免丢失 user activation
  toggleBrowserFullscreen(document.documentElement)
    .then(() => {
      isFullscreen.value = isBrowserFullscreen()
    })
    .catch((e) => {
      console.warn('[fullscreen]', e)
      ElMessage.warning('无法进入全屏，请按键盘 F11，或在系统浏览器中打开本站')
    })
}
onMounted(() => {
  isFullscreen.value = isBrowserFullscreen()
  offFullscreen = onBrowserFullscreenChange(() => {
    isFullscreen.value = isBrowserFullscreen()
  })
})
onUnmounted(() => {
  offFullscreen?.()
})
</script>

<style scoped>
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--app-header-bg);
  border-bottom: 1px solid var(--app-header-border);
  height: 50px;
  padding: 0 16px;
  font-size: var(--app-font-size-header);
  color: var(--app-header-text);
}

.layout-header.is-embed {
  height: auto;
  padding: 0;
  background: transparent;
  border-bottom: none;
}

.layout-header__left,
.layout-header__right {
  display: flex;
  align-items: center;
}

.layout-header__tools {
  display: flex;
  align-items: center;
  gap: 4px;
}

.layout-header__tool {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--app-header-text);
  cursor: pointer;
}

.layout-header__tool :deep(.el-badge) {
  display: inline-flex;
  line-height: 1;
}

.layout-header__tool :deep(.el-badge__content) {
  border: none;
}

.layout-header__user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--app-header-text);
}

.layout-header__user:hover {
  background: color-mix(in srgb, var(--app-header-text) 12%, transparent);
}

.layout-header__username {
  color: var(--app-header-text);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
