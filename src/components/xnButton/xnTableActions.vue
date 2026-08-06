<template>
  <div v-if="visibleList.length" class="xn-table-actions">
    <el-button
      v-for="item in visibleList"
      :key="item.action || item.name"
      link
      :type="item.typeColor && item.typeColor !== 'default' ? item.typeColor : 'primary'"
      :disabled="isDisabled(item)"
      @click="emitAction(item)"
    >
      {{ item.name }}
    </el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePermission } from '@/directives/permission'
defineOptions({ name: 'xnTableActions' })
const props = defineProps({
  items: { type: Array, required: false, default: () => [] },
  row: { type: Object, required: false, default: () => ({}) },
  disabled: { required: false },
})
const emit = defineEmits(['actionClick'])
const { hasPermission } = usePermission()
const visibleList = computed(() =>
  props.items.filter((item) => !item.permission || hasPermission(item.permission)),
)
function actionOf(item) {
  return item.action || item.name
}
function isDisabled(item) {
  if (item.disabled) return true
  if (!props.disabled) return false
  const result = props.disabled(actionOf(item), props.row)
  return result === true || typeof result === 'string'
}
function emitAction(item) {
  emit('actionClick', { action: actionOf(item), row: props.row })
}
</script>

<style scoped>
.xn-table-actions {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
</style>
