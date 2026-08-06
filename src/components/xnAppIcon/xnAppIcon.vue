<template>
  <span
    v-if="parsed"
    class="app-icon"
    :style="wrapStyle"
    :class="{ 'is-svg': parsed.type === 'svg' }"
  >
    <el-icon v-if="parsed.type === 'element' && elementComp" :size="size" :color="color">
      <component :is="elementComp" />
    </el-icon>
    <Icon
      v-else-if="parsed.type === 'iconify'"
      :icon="parsed.name"
      :width="size"
      :height="size"
      :style="{ color }"
    />
    <span
      v-else-if="parsed.type === 'svg' && svgHtml"
      class="app-icon__svg"
      :style="{ width: sizePx, height: sizePx, color }"
      v-html="svgHtml"
    />
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { getSvgRaw, parseIcon, resolveElementIcon } from '@/utils/icons'
const props = defineProps({
  name: { required: false },
  size: { type: Number, required: false, default: 16 },
  color: { required: false },
})
const parsed = computed(() => parseIcon(props.name))
const elementComp = computed(() =>
  parsed.value?.type === 'element' ? resolveElementIcon(parsed.value.name) : undefined,
)
const svgHtml = computed(() =>
  parsed.value?.type === 'svg' ? getSvgRaw(parsed.value.name) : undefined,
)
const sizePx = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
const wrapStyle = computed(() => ({
  fontSize: sizePx.value,
  lineHeight: 1,
}))
</script>

<style scoped>
.app-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.app-icon__svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.app-icon__svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
  fill: currentColor;
}
</style>
