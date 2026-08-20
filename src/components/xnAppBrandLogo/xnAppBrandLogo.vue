<template>
  <img
    v-if="!useIconFallback"
    class="app-brand-logo"
    :key="displaySrc"
    :src="displaySrc"
    :alt="alt"
    :width="width ?? undefined"
    :height="height ?? undefined"
    :style="sizeStyle"
    @error="onImgError"
  />
  <el-icon v-else class="app-brand-logo is-fallback" :size="fallbackSize" :style="fallbackStyle">
    <Monitor />
  </el-icon>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Monitor } from '@element-plus/icons-vue'
import { appConfig, defaultAppConfig } from '@/config/app'

const LOCAL_LOGO = defaultAppConfig.app.logo

const props = defineProps({
  src: { required: false, default: undefined },
  width: { required: false, default: undefined },
  height: { required: false, default: undefined },
  alt: { type: String, required: false, default: appConfig.app.name },
})

const configuredSrc = computed(() => {
  const value = props.src ?? appConfig.app.logo
  return value?.trim() || ''
})

const loadFailed = ref(false)
const localFailed = ref(false)

watch(configuredSrc, () => {
  loadFailed.value = false
  localFailed.value = false
})

const displaySrc = computed(() => {
  if (loadFailed.value) return LOCAL_LOGO
  return configuredSrc.value || LOCAL_LOGO
})

const useIconFallback = computed(() => localFailed.value)

function onImgError() {
  if (displaySrc.value !== LOCAL_LOGO) {
    loadFailed.value = true
    return
  }
  localFailed.value = true
}

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
