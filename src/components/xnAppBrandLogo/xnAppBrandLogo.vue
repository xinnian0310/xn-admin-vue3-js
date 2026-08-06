<template>
  <img
    v-if="src"
    class="app-brand-logo"
    :src="src"
    :alt="alt"
    :width="width ?? undefined"
    :height="height ?? undefined"
    :style="sizeStyle"
  />
  <el-icon v-else class="app-brand-logo is-fallback" :size="fallbackSize" :style="fallbackStyle">
    <Monitor />
  </el-icon>
</template>

<script setup>
import { computed } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { appConfig } from '@/config/app'
const props = defineProps({
  src: { required: false, default: undefined },
  width: { required: false, default: undefined },
  height: { required: false, default: undefined },
  alt: { type: String, required: false, default: appConfig.app.name },
})
const src = computed(() => {
  const value = props.src ?? appConfig.app.logo
  return value?.trim() || ''
})
const width = computed(() => (props.width !== undefined ? props.width : appConfig.app.logoWidth))
const height = computed(() =>
  props.height !== undefined ? props.height : appConfig.app.logoHeight,
)
/** 只设一边时另一边为 auto，保持原图比例；两边都设则定宽高 */
const sizeStyle = computed(() => {
  const w = width.value
  const h = height.value
  return {
    width: w != null ? `${w}px` : 'auto',
    height: h != null ? `${h}px` : 'auto',
  }
})
const fallbackSize = computed(() => {
  const w = width.value
  const h = height.value
  if (w != null && h != null) return Math.min(w, h)
  if (w != null) return w
  if (h != null) return h
  return 28
})
const fallbackStyle = computed(() => ({
  width: `${fallbackSize.value}px`,
  height: `${fallbackSize.value}px`,
  fontSize: `${fallbackSize.value}px`,
}))
</script>

<style scoped>
.app-brand-logo {
  display: inline-block;
  flex-shrink: 0;
  object-fit: contain;
  vertical-align: middle;
}

.app-brand-logo.is-fallback {
  color: var(--app-sidebar-active);
}
</style>
