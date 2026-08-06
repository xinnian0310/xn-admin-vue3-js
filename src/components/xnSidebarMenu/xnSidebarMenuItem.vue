<template>
  <template v-for="item in menus" :key="item.id">
    <el-sub-menu
      v-if="item.children?.length"
      :index="item.id"
      :class="{ 'is-self-active': isSelfActive(item) }"
    >
      <template #title>
        <span
          class="submenu-title"
          :class="{ 'is-link': !!item.path }"
          @click="onTitleClick($event, item)"
        >
          <xnAppIcon v-if="item.icon" :name="item.icon" class="menu-icon" />
          <span>{{ item.title }}</span>
        </span>
      </template>
      <xnSidebarMenuItem :menus="item.children" />
    </el-sub-menu>

    <el-menu-item v-else-if="item.path" :index="item.path">
      <xnAppIcon v-if="item.icon" :name="item.icon" class="menu-icon" />
      <span>{{ item.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
defineOptions({ name: 'xnSidebarMenuItem' })
defineProps({
  menus: { required: true },
})
const route = useRoute()
const router = useRouter()
function isSelfActive(item) {
  if (!item.path) return false
  const active = route.meta.activeMenu || route.path.replace(/\/save(\/.*)?$/, '') || route.path
  return active === item.path
}
/** 有 path 的父级：点标题跳转；点右侧箭头仍展开/收起 */
function onTitleClick(e, item) {
  if (!item.path) return
  e.stopPropagation()
  e.preventDefault()
  if (route.path !== item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.menu-icon {
  margin-right: 8px;
  flex-shrink: 0;
}

.submenu-title {
  display: inline-flex;
  align-items: center;
  min-width: 0;
}

.submenu-title.is-link {
  cursor: pointer;
}

.submenu-title.is-link:hover {
  color: var(--app-sidebar-text-active);
}

:deep(.el-sub-menu.is-self-active > .el-sub-menu__title) {
  color: var(--app-sidebar-text-active) !important;
}
</style>
