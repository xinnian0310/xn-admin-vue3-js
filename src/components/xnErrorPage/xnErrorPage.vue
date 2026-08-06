<template>
  <div class="xn-error-page" :data-tone="tone">
    <div class="xn-error-page__panel">
      <div class="xn-error-page__visual" aria-hidden="true">
        <div class="xn-error-page__halo" />
        <svg class="xn-error-page__ring" viewBox="0 0 120 120" fill="none">
          <circle class="ring-outer" cx="60" cy="60" r="52" />
          <circle class="ring-inner" cx="60" cy="60" r="40" />
          <g v-if="tone === 'warn'" class="glyph">
            <rect x="42" y="54" width="36" height="28" rx="5" />
            <path d="M49 54v-7a11 11 0 0 1 22 0v7" />
            <circle cx="60" cy="68" r="3" fill="currentColor" stroke="none" />
          </g>
          <g v-else-if="tone === 'danger'" class="glyph">
            <path
              d="M44 70h32a12 12 0 0 0 1-24 16 16 0 0 0-30-4 11 11 0 0 0-3 28z"
              stroke-linejoin="round"
            />
            <path d="M54 78l12-12M66 78L54 66" stroke-width="2.25" stroke-linecap="round" />
          </g>
          <g v-else class="glyph">
            <circle cx="54" cy="54" r="13" />
            <path d="M64 64l12 12" stroke-width="2.5" stroke-linecap="round" />
          </g>
        </svg>
        <p class="xn-error-page__code">{{ code }}</p>
      </div>

      <h2 class="xn-error-page__title">{{ title }}</h2>
      <p class="xn-error-page__desc">{{ description }}</p>

      <div class="xn-error-page__actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({ name: 'XnErrorPage' })
defineProps({
  code: { required: true },
  title: { required: true },
  description: { required: true },
  tone: { type: String, required: false, default: 'muted' },
})
</script>

<style scoped>
.xn-error-page {
  --error-accent: var(--app-color-primary);
  --error-soft: var(--app-color-primary-light-9);
  --error-mid: var(--app-color-primary-light-5);

  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 2.25rem 1.25rem;
  overflow: hidden;
  border-radius: 8px;
  background: var(--app-card-bg);
  border: 1px solid var(--app-border-color);
  box-sizing: border-box;
}

.xn-error-page[data-tone='warn'] {
  --error-accent: var(--el-color-warning, #e6a23c);
  --error-soft: var(--el-color-warning-light-9, #fdf6ec);
  --error-mid: var(--el-color-warning-light-5, #f3d19e);
}

.xn-error-page[data-tone='danger'] {
  --error-accent: var(--el-color-danger, #f56c6c);
  --error-soft: var(--el-color-danger-light-9, #fef0f0);
  --error-mid: var(--el-color-danger-light-5, #fab6b6);
}

.xn-error-page__panel {
  position: relative;
  z-index: 1;
  max-width: 24rem;
  text-align: center;
  animation: error-rise 0.45s ease both;
}

.xn-error-page__visual {
  position: relative;
  display: grid;
  place-items: center;
  width: 10.5rem;
  height: 10.5rem;
  margin: 0 auto 0.35rem;
}

.xn-error-page__halo {
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  background: radial-gradient(circle, var(--error-soft) 0%, transparent 72%);
  opacity: 0.95;
}

.xn-error-page__ring {
  position: absolute;
  width: 7rem;
  height: 7rem;
  color: var(--error-accent);
}

.xn-error-page__ring .ring-outer {
  stroke: var(--error-mid);
  stroke-width: 1.5;
  opacity: 0.55;
}

.xn-error-page__ring .ring-inner {
  stroke: var(--error-accent);
  stroke-width: 1.25;
  stroke-dasharray: 5 7;
  opacity: 0.35;
}

.xn-error-page__ring .glyph {
  stroke: var(--error-accent);
  stroke-width: 2;
  fill: color-mix(in srgb, var(--error-accent) 8%, transparent);
}

.xn-error-page__code {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--error-accent);
}

.xn-error-page__title {
  margin: 0.85rem 0 0.45rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--app-text-primary);
}

.xn-error-page__desc {
  margin: 0 auto;
  max-width: 22rem;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--app-text-muted);
}

.xn-error-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1.6rem;
}

.xn-error-page__actions :deep(.el-button) {
  min-width: 7rem;
}

@keyframes error-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .xn-error-page__panel {
    animation: none;
  }
}

html.dark .xn-error-page[data-tone='warn'] {
  --error-soft: color-mix(in srgb, var(--el-color-warning, #e6a23c) 16%, var(--app-card-bg));
  --error-mid: color-mix(in srgb, var(--el-color-warning, #e6a23c) 40%, var(--app-border-color));
}

html.dark .xn-error-page[data-tone='danger'] {
  --error-soft: color-mix(in srgb, var(--el-color-danger, #f56c6c) 16%, var(--app-card-bg));
  --error-mid: color-mix(in srgb, var(--el-color-danger, #f56c6c) 40%, var(--app-border-color));
}

html.dark .xn-error-page[data-tone='muted'] {
  --error-soft: var(--app-surface-soft);
  --error-mid: var(--app-surface-soft-border);
}
</style>
