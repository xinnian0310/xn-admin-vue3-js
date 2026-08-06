<template>
  <div v-if="visibleList.length" class="xn-button">
    <template v-for="item in visibleList" :key="item.name">
      <el-dropdown
        v-if="item.type === 'down'"
        trigger="click"
        @command="(cmd) => handleDropdownCommand(item, cmd)"
      >
        <el-button
          :type="item.typeColor || 'primary'"
          :icon="resolveBtnIcon(item.icon)"
          :disabled="isDisabled(item)"
        >
          {{ item.name }}
          <el-icon class="xn-button__arrow"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="sub in visibleDropdownItems(item)"
              :key="sub.name"
              :command="sub.name"
            >
              {{ sub.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <el-button
        v-else
        :type="item.typeColor || 'default'"
        :icon="resolveBtnIcon(item.icon)"
        :disabled="isDisabled(item)"
        @click="emitAction(item)"
      >
        {{ item.name }}
      </el-button>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { usePermission } from '@/directives/permission'
import { createDefaultButtonList } from '@/components/xnButton/defaultButtons'
import { resolveIcon } from '@/utils/icons'
defineOptions({ name: 'xnButton' })
const props = defineProps({
  listItem: { required: false },
  selected: { type: Array, required: false, default: () => [] },
  createPermission: { required: false },
  updatePermission: { required: false },
  viewPermission: { required: false },
  deletePermission: { required: false },
})
const emit = defineEmits(['buttonClick'])
const { hasPermission } = usePermission()
const resolvedList = computed(() => {
  if (props.listItem !== undefined) {
    return props.listItem
  }
  return createDefaultButtonList({
    create: props.createPermission,
    update: props.updatePermission,
    view: props.viewPermission,
    delete: props.deletePermission,
  })
})
const visibleList = computed(() =>
  resolvedList.value.filter((item) => !item.permission || hasPermission(item.permission)),
)
function resolveBtnIcon(icon) {
  if (!icon) return undefined
  if (typeof icon === 'string') return resolveIcon(icon)
  return icon
}
function visibleDropdownItems(item) {
  return (item.searchItem ?? []).filter((sub) => !sub.permission || hasPermission(sub.permission))
}
function isDisabled(item) {
  if (item.disabled) return true
  // index 表示「需要选中的行数 - 1」；后端未配置时可能下发 null，不能当成 0
  if (item.index != null) {
    return props.selected.length !== item.index + 1
  }
  // 删除 / 下发 / 撤回：至少选中 1 条
  if (item.action === 'delete' || item.action === 'publish' || item.action === 'revoke') {
    return props.selected.length < 1
  }
  return false
}
function emitAction(item) {
  emit('buttonClick', item.action || item.name)
}
function handleDropdownCommand(item, cmd) {
  const sub = item.searchItem?.find((s) => s.name === cmd)
  emit('buttonClick', sub?.action || cmd)
}
</script>

<style scoped>
.xn-button {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xn-button__arrow {
  margin-left: 4px;
}
</style>
