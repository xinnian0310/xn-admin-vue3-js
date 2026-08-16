<template>
  <el-dialog
    v-model="themeStore.dialogVisible"
    title="主题设置"
    width="640px"
    append-to-body
    destroy-on-close
    class="theme-dialog"
    @closed="themeStore.closeDialog()"
  >
    <el-tabs v-model="activeTab" class="theme-tabs">
      <el-tab-pane label="外观模式" name="appearance">
        <p class="theme-tab__hint">
          独立完整主题：亮色 / 暗色整站切换（侧栏、顶栏、内容区一并修改）。
        </p>
        <div class="theme-mode">
          <button
            type="button"
            class="theme-mode__card"
            :class="{
              'is-active': themeStore.source === 'appearance' && themeStore.appearance === 'light',
            }"
            @click="themeStore.setAppearance('light')"
          >
            <div class="theme-mode__preview theme-mode__preview--light">
              <span class="theme-mode__preview-side" />
              <span class="theme-mode__preview-main">
                <span class="theme-mode__preview-bar" />
                <span class="theme-mode__preview-body" />
              </span>
            </div>
            <div class="theme-mode__meta">
              <el-icon><Sunny /></el-icon>
              <span>亮色</span>
            </div>
            <el-icon
              v-if="themeStore.source === 'appearance' && themeStore.appearance === 'light'"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
          <button
            type="button"
            class="theme-mode__card"
            :class="{
              'is-active': themeStore.source === 'appearance' && themeStore.appearance === 'dark',
            }"
            @click="themeStore.setAppearance('dark')"
          >
            <div class="theme-mode__preview theme-mode__preview--dark">
              <span class="theme-mode__preview-side" />
              <span class="theme-mode__preview-main">
                <span class="theme-mode__preview-bar" />
                <span class="theme-mode__preview-body" />
              </span>
            </div>
            <div class="theme-mode__meta">
              <el-icon><Moon /></el-icon>
              <span>暗色</span>
            </div>
            <el-icon
              v-if="themeStore.source === 'appearance' && themeStore.appearance === 'dark'"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="预设主题" name="preset">
        <p class="theme-tab__hint">独立完整主题：一键切换侧栏、顶栏、主色与页面配色。</p>
        <div class="theme-dialog__grid">
          <button
            v-for="item in themeStore.themes"
            :key="item.id"
            type="button"
            class="theme-card"
            :class="{
              'is-active': themeStore.source === 'preset' && item.id === themeStore.themeId,
            }"
            @click="themeStore.setTheme(item.id)"
          >
            <div class="theme-card__swatches">
              <span class="theme-card__swatch" :style="{ background: item.swatches[0] }" />
              <span class="theme-card__swatch" :style="{ background: item.colors.primary }" />
            </div>
            <div class="theme-card__name">{{ item.name }}</div>
            <el-icon
              v-if="themeStore.source === 'preset' && item.id === themeStore.themeId"
              class="theme-card__check"
            >
              <Check />
            </el-icon>
          </button>
        </div>
      </el-tab-pane>

      <el-tab-pane label="个性化" name="custom">
        <p class="theme-tab__hint">独立完整主题：自定义颜色与内容区底图，保存后整站应用。</p>

        <div class="theme-custom-preview">
          <div
            class="theme-custom-preview__shell"
            :style="{
              '--preview-sidebar': themeStore.customParts.sidebarBg,
              '--preview-header': themeStore.customParts.headerBg,
              '--preview-primary': themeStore.customParts.primary,
              backgroundImage: themeStore.mainBgImage
                ? `url(${themeStore.mainBgImage})`
                : undefined,
            }"
          >
            <span class="theme-custom-preview__side" />
            <span class="theme-custom-preview__main">
              <span class="theme-custom-preview__bar" />
              <span class="theme-custom-preview__body">
                <span class="theme-custom-preview__accent" />
              </span>
            </span>
          </div>
          <div class="theme-custom-preview__caption">实时预览</div>
        </div>

        <div class="theme-custom">
          <label v-for="item in customColorFields" :key="item.key" class="theme-custom__row">
            <span class="theme-custom__meta">
              <span class="theme-custom__name">{{ item.label }}</span>
              <span class="theme-custom__hex">{{ themeStore.customParts[item.key] }}</span>
            </span>
            <el-color-picker
              :model-value="themeStore.customParts[item.key]"
              @update:model-value="onColor(item.key, $event)"
            />
          </label>
        </div>

        <div class="theme-bg">
          <div class="theme-bg__head">
            <div class="theme-bg__label">内容区底图</div>
            <span class="theme-bg__hint">PNG / JPG / WebP · ≤ 800KB</span>
          </div>

          <div v-if="themeStore.mainBgImage" class="theme-bg__filled">
            <div
              class="theme-bg__image"
              :style="{ backgroundImage: `url(${themeStore.mainBgImage})` }"
            />
            <div class="theme-bg__toolbar">
              <el-upload
                class="theme-bg__toolbar-upload"
                :show-file-list="false"
                :auto-upload="false"
                accept="image/png,image/jpeg,image/webp,image/gif"
                :on-change="onBgChange"
              >
                <button type="button" class="theme-bg__btn theme-bg__btn--primary">
                  <el-icon><Upload /></el-icon>
                  更换图片
                </button>
              </el-upload>
              <button type="button" class="theme-bg__btn theme-bg__btn--mute" @click="clearBg">
                <el-icon><Delete /></el-icon>
                清除
              </button>
            </div>
          </div>

          <el-upload
            v-else
            class="theme-bg__upload"
            drag
            :show-file-list="false"
            :auto-upload="false"
            accept="image/png,image/jpeg,image/webp,image/gif"
            :on-change="onBgChange"
          >
            <div class="theme-bg__empty">
              <span class="theme-bg__icon">
                <el-icon :size="22"><Picture /></el-icon>
              </span>
              <span class="theme-bg__title">点击或拖拽上传底图</span>
              <span class="theme-bg__desc">仅本地保存，不会上传到服务器</span>
            </div>
          </el-upload>

          <p class="theme-bg__tip">修改颜色或底图会自动切换到个性化主题。</p>

          <button
            v-if="themeStore.source !== 'custom'"
            type="button"
            class="theme-custom__apply"
            @click="themeStore.applyCustom()"
          >
            应用个性化
          </button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Check, Delete, Moon, Picture, Sunny, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { MAIN_BG_MAX_BYTES, useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()
const activeTab = ref(themeStore.source)
const customColorFields = [
  { key: 'primary', label: '主色' },
  { key: 'sidebarBg', label: '侧栏背景' },
  { key: 'headerBg', label: '顶栏背景' },
]
watch(
  () => themeStore.dialogVisible,
  (open) => {
    if (open) activeTab.value = themeStore.source
  },
)
function onColor(key, value) {
  if (!value) return
  themeStore.setCustomParts({ [key]: value })
}
function onBgChange(file) {
  const raw = file.raw
  if (!raw) return
  if (!raw.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  if (raw.size > MAIN_BG_MAX_BYTES) {
    ElMessage.warning('图片过大，请压缩到 800KB 以内')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    try {
      themeStore.setMainBgImage(String(reader.result))
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '保存底图失败')
    }
  }
  reader.readAsDataURL(raw)
}
function clearBg() {
  try {
    themeStore.setMainBgImage(null)
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '清除失败')
  }
}
</script>

<style scoped>
.theme-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.theme-tab__hint {
  margin: 0 0 14px;
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.theme-dialog__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-card,
.theme-mode__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--app-border-color);
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.theme-card:hover,
.theme-mode__card:hover {
  border-color: var(--app-color-primary);
}

.theme-card.is-active,
.theme-mode__card.is-active {
  border-color: var(--app-color-primary);
  box-shadow: 0 0 0 1px var(--app-color-primary);
}

.theme-card__swatches {
  display: flex;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
}

.theme-card__swatch {
  flex: 1;
}

.theme-card__name {
  font-size: 13px;
  color: var(--app-text-primary);
  font-weight: 500;
}

.theme-card__check {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--app-color-primary);
  font-size: 16px;
}

.theme-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.theme-mode__preview {
  display: flex;
  height: 88px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.theme-mode__preview-side {
  width: 28%;
  flex-shrink: 0;
}

.theme-mode__preview-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.theme-mode__preview-bar {
  height: 18px;
  flex-shrink: 0;
}

.theme-mode__preview-body {
  flex: 1;
}

.theme-mode__preview--light .theme-mode__preview-side {
  background: #ffffff;
  border-right: 1px solid #ebeef5;
}

.theme-mode__preview--light .theme-mode__preview-bar {
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
}

.theme-mode__preview--light .theme-mode__preview-body {
  background: #f5f7fa;
}

.theme-mode__preview--dark {
  border-color: rgba(255, 255, 255, 0.08);
}

.theme-mode__preview--dark .theme-mode__preview-side {
  background: #141414;
  border-right: 1px solid #414243;
}

.theme-mode__preview--dark .theme-mode__preview-bar {
  background: #1d1e1f;
  border-bottom: 1px solid #414243;
}

.theme-mode__preview--dark .theme-mode__preview-body {
  background: #0a0a0a;
}

.theme-mode__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-primary);
}

.theme-custom-preview {
  margin-bottom: 16px;
}

.theme-custom-preview__shell {
  display: flex;
  height: 96px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--app-border-color);
  background-color: var(--app-page-bg, #f5f7fa);
  background-size: cover;
  background-position: center;
}

.theme-custom-preview__side {
  width: 26%;
  flex-shrink: 0;
  background: var(--preview-sidebar);
}

.theme-custom-preview__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.theme-custom-preview__bar {
  height: 22px;
  flex-shrink: 0;
  background: var(--preview-header);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
}

.theme-custom-preview__body {
  flex: 1;
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.55);
}

.theme-custom-preview__accent {
  width: 42px;
  height: 8px;
  border-radius: 999px;
  background: var(--preview-primary);
}

.theme-custom-preview__caption {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--app-text-muted);
}

.theme-custom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}

.theme-custom__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--app-border-color);
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.theme-custom__row:hover {
  border-color: color-mix(in srgb, var(--app-color-primary) 45%, var(--app-border-color));
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);
}

.theme-custom__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.theme-custom__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-primary);
}

.theme-custom__hex {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--app-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.theme-bg__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.theme-bg__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-primary);
}

.theme-bg__hint {
  font-size: 11px;
  color: var(--app-text-muted);
}

.theme-bg__upload {
  width: 100%;
}

.theme-bg__upload :deep(.el-upload) {
  width: 100%;
}

.theme-bg__upload :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 0;
  border: 1px dashed color-mix(in srgb, var(--app-border-color) 80%, var(--app-color-primary));
  border-radius: 12px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--app-color-primary) 4%, transparent),
      transparent 60%
    ),
    var(--app-card-bg, #fff);
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.theme-bg__upload :deep(.el-upload-dragger:hover) {
  border-color: var(--app-color-primary);
}

.theme-bg__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
}

.theme-bg__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-bottom: 4px;
  border-radius: 12px;
  color: var(--app-color-primary);
  background: color-mix(in srgb, var(--app-color-primary) 12%, transparent);
}

.theme-bg__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--app-text-primary);
}

.theme-bg__desc {
  font-size: 12px;
  color: var(--app-text-muted);
}

.theme-bg__filled {
  overflow: hidden;
  border: 1px solid var(--app-border-color);
  border-radius: 12px;
  background: var(--app-card-bg, #fff);
}

.theme-bg__image {
  height: 108px;
  background-size: cover;
  background-position: center;
}

.theme-bg__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--app-border-color);
  background: color-mix(in srgb, var(--app-card-bg, #fff) 88%, var(--app-page-bg, #f5f7fa));
}

.theme-bg__toolbar-upload :deep(.el-upload) {
  display: inline-flex;
}

.theme-bg__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.theme-bg__btn--primary {
  color: #fff;
  background: var(--app-color-primary);
}

.theme-bg__btn--primary:hover {
  filter: brightness(1.06);
}

.theme-bg__btn--mute {
  color: var(--app-text-secondary, var(--app-text-muted));
  background: transparent;
  border-color: var(--app-border-color);
}

.theme-bg__btn--mute:hover {
  color: var(--el-color-danger);
  border-color: color-mix(in srgb, var(--el-color-danger) 35%, var(--app-border-color));
  background: color-mix(in srgb, var(--el-color-danger) 8%, transparent);
}

.theme-bg__tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--app-text-muted);
}

.theme-custom__apply {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  margin-top: 14px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(
    135deg,
    var(--app-color-primary),
    color-mix(in srgb, var(--app-color-primary) 70%, #111)
  );
  box-shadow: 0 8px 18px color-mix(in srgb, var(--app-color-primary) 28%, transparent);
  transition:
    transform 0.15s ease,
    filter 0.15s ease;
}

.theme-custom__apply:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .theme-dialog__grid,
  .theme-custom {
    grid-template-columns: 1fr;
  }

  .theme-mode {
    grid-template-columns: 1fr;
  }
}
</style>
