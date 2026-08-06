<template>
  <div class="page-card system-config-page" v-loading="loading">
    <div class="page-header">
      <div class="system-config-page__heading">
        <h2 class="page-title">系统配置</h2>
        <p class="system-config-page__hint">
          与前端 app.js
          对齐：保存后即时生效。登录页背景/验证码请在「登录页设置」中配置；主题色请在右上角主题面板调整。
          「项目名称 / 应用介绍」按当前前端工程（{{ clientId }}）单独存储，不影响其他前端项目。
        </p>
      </div>
      <div class="system-config-page__actions">
        <el-button v-permission="'system-config:view'" :icon="Refresh" @click="loadConfig"
          >刷新</el-button
        >
        <el-button
          v-permission="'system-config:update'"
          type="primary"
          :loading="saving"
          @click="handleSave"
        >
          保存
        </el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" tab-position="left" class="system-config-page__tabs">
      <el-tab-pane label="应用信息" name="app">
        <el-form :model="form" label-width="120px" class="system-config-page__form">
          <el-form-item label="当前前端工程">
            <el-input :model-value="clientId" disabled />
            <p class="system-config-page__field-hint">
              项目名称 / 应用介绍按此 clientId
              写入数据库（app.clients），各技术栈互不影响；页脚与品牌图标仍共享。
            </p>
          </el-form-item>
          <el-form-item label="项目名称" required>
            <el-input
              v-model="form.app.name"
              maxlength="50"
              placeholder="侧栏 / 登录页 / 管理端首页标题 / 官网项目副标题（仅本工程）"
            />
          </el-form-item>
          <el-form-item label="应用介绍">
            <el-input
              v-model="form.app.intro"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="管理端首页与官网开源项目介绍文案（仅本工程）"
            />
          </el-form-item>
          <el-form-item label="页脚">
            <el-input v-model="form.app.footer" maxlength="200" placeholder="留空则不显示页脚" />
          </el-form-item>
          <el-form-item label="品牌图标">
            <div>
              <el-upload
                v-permission="'system-config:update'"
                :file-list="brandIconList"
                class="brand-uploader"
                :class="{ 'is-full': brandIconList.length >= 1 }"
                list-type="picture-card"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
                :limit="1"
                :http-request="uploadBrandIcon"
                :on-exceed="onBrandIconExceed"
                :on-remove="onBrandIconRemove"
                :on-preview="onBrandIconPreview"
                @update:file-list="(files) => (brandIconList = files)"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
              <div class="form-tip">一张图同时用于浏览器标签图标与侧栏 / 登录页 Logo</div>
            </div>
          </el-form-item>
          <el-form-item label="图标宽度">
            <el-input-number
              v-model="form.app.logoWidth"
              :min="1"
              :max="200"
              controls-position="right"
              clearable
            />
            <span class="hint">px；清空表示按比例自适应</span>
          </el-form-item>
          <el-form-item label="图标高度">
            <el-input-number
              v-model="form.app.logoHeight"
              :min="1"
              :max="200"
              controls-position="right"
              clearable
            />
            <span class="hint">px；清空表示按比例自适应</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="会话策略" name="session">
        <el-form :model="form" label-width="140px" class="system-config-page__form">
          <el-form-item label="空闲自动登出">
            <el-switch v-model="form.session.idleLogoutEnabled" />
          </el-form-item>
          <el-form-item label="空闲超时">
            <el-input-number
              v-model="idleTimeoutMin"
              :min="1"
              :max="1440"
              controls-position="right"
            />
            <span class="hint">分钟</span>
          </el-form-item>
          <el-form-item label="滑动续期">
            <el-switch v-model="form.session.slidingRefreshEnabled" />
          </el-form-item>
          <el-form-item label="续期间隔">
            <el-input-number
              v-model="refreshIntervalMin"
              :min="1"
              :max="120"
              controls-position="right"
            />
            <span class="hint">分钟</span>
          </el-form-item>
          <el-form-item label="空闲检测间隔">
            <el-input-number
              v-model="idleCheckIntervalSec"
              :min="5"
              :max="300"
              controls-position="right"
            />
            <span class="hint">秒</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="布局与 UI" name="ui">
        <div class="ui-split">
          <section class="ui-split__panel">
            <h3 class="ui-split__title">布局与字号</h3>
            <p class="ui-split__desc ui-split__desc--block">
              通用默认；登录用户可在右下角悬浮入口单独覆盖。字号 / 高度填正整数，单位 px 自动带入。
            </p>
            <el-form
              :model="form"
              label-width="120px"
              class="system-config-page__form system-config-page__form--compact"
            >
              <el-form-item label="布局模式">
                <el-radio-group v-model="form.ui.layout.mode">
                  <el-radio-button value="side">左侧</el-radio-button>
                  <el-radio-button value="top">顶部</el-radio-button>
                  <el-radio-button value="mix">混合</el-radio-button>
                  <el-radio-button value="columns">双列</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="弹窗最大高度">
                <el-input v-model="form.ui.dialog.maxHeight" placeholder="如 95vh" />
              </el-form-item>
              <el-form-item label="标签栏高度">
                <div class="px-field">
                  <el-input-number
                    v-model="tagsViewHeightPx"
                    :min="1"
                    :max="120"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="px-field__unit">px</span>
                </div>
              </el-form-item>
              <el-form-item label="侧栏字号">
                <div class="px-field">
                  <el-input-number
                    v-model="fontSidebarPx"
                    :min="1"
                    :max="48"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="px-field__unit">px</span>
                </div>
              </el-form-item>
              <el-form-item label="顶栏字号">
                <div class="px-field">
                  <el-input-number
                    v-model="fontHeaderPx"
                    :min="1"
                    :max="48"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="px-field__unit">px</span>
                </div>
              </el-form-item>
              <el-form-item label="标签栏字号">
                <div class="px-field">
                  <el-input-number
                    v-model="fontTagsViewPx"
                    :min="1"
                    :max="48"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="px-field__unit">px</span>
                </div>
              </el-form-item>
              <el-form-item label="正文字号">
                <div class="px-field">
                  <el-input-number
                    v-model="fontMainPx"
                    :min="1"
                    :max="48"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="px-field__unit">px</span>
                </div>
              </el-form-item>
            </el-form>
          </section>

          <section class="ui-split__panel ui-split__panel--aside">
            <div class="ui-split__head">
              <h3 class="ui-split__title">组件全局</h3>
              <p class="ui-split__desc">
                对应 Element Plus Config Provider；主题色请用右上角主题面板。
              </p>
            </div>
            <el-form
              :model="form"
              label-width="120px"
              class="system-config-page__form system-config-page__form--compact"
            >
              <el-form-item label="语言">
                <el-select v-model="form.ui.elementPlus.locale" style="width: 100%">
                  <el-option label="简体中文" value="zh-cn" />
                  <el-option label="English" value="en" />
                </el-select>
              </el-form-item>
              <el-form-item label="组件尺寸">
                <el-radio-group v-model="form.ui.elementPlus.size">
                  <el-radio-button value="large">大</el-radio-button>
                  <el-radio-button value="default">默认</el-radio-button>
                  <el-radio-button value="small">小</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="弹层 z-index">
                <el-input-number
                  v-model="form.ui.elementPlus.zIndex"
                  :min="1000"
                  :max="9999"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="类名前缀">
                <el-input v-model="form.ui.elementPlus.namespace" placeholder="默认 el" />
              </el-form-item>
              <el-form-item label="按钮自动空格">
                <el-switch v-model="form.ui.elementPlus.button.autoInsertSpace" />
              </el-form-item>
              <el-form-item label="消息最大数量">
                <el-input-number
                  v-model="form.ui.elementPlus.message.max"
                  :min="1"
                  :max="20"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="对话框居中">
                <el-switch v-model="form.ui.elementPlus.dialog.alignCenter" />
              </el-form-item>
              <el-form-item label="对话框可拖拽">
                <el-switch v-model="form.ui.elementPlus.dialog.draggable" />
              </el-form-item>
              <el-form-item label="拖拽限制可视区">
                <el-switch v-model="form.ui.elementPlus.dialog.overflow" />
              </el-form-item>
            </el-form>
          </section>
        </div>
      </el-tab-pane>

      <el-tab-pane label="对象存储" name="storage">
        <el-form :model="form" label-width="120px" class="system-config-page__form">
          <el-alert
            type="warning"
            :closable="false"
            show-icon
            class="system-config-page__alert"
            title="仅配置 endpoint / bucket / region；密钥请放在后端，勿写入前端配置。"
          />
          <el-form-item label="Endpoint">
            <el-input
              v-model="form.storage.minio.endpoint"
              placeholder="https://minio.example.com"
            />
          </el-form-item>
          <el-form-item label="Bucket">
            <el-input v-model="form.storage.minio.bucket" />
          </el-form-item>
          <el-form-item label="Region">
            <el-input v-model="form.storage.minio.region" placeholder="可选" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="日志保留" name="logRetention">
        <el-form :model="form" label-width="140px" class="system-config-page__form">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="system-config-page__alert"
            title="定时任务「日志保留清理」每天凌晨按此天数删除过期日志；设为 0 表示不自动清理该类日志。"
          />
          <el-form-item label="登录日志">
            <el-input-number
              v-model="form.logRetention.loginDays"
              :min="0"
              :max="3650"
              controls-position="right"
            />
            <span class="hint">天</span>
          </el-form-item>
          <el-form-item label="操作日志">
            <el-input-number
              v-model="form.logRetention.operDays"
              :min="0"
              :max="3650"
              controls-position="right"
            />
            <span class="hint">天</span>
          </el-form-item>
          <el-form-item label="异常日志">
            <el-input-number
              v-model="form.logRetention.exceptionDays"
              :min="0"
              :max="3650"
              controls-position="right"
            />
            <span class="hint">天</span>
          </el-form-item>
          <el-form-item label="任务日志">
            <el-input-number
              v-model="form.logRetention.jobDays"
              :min="0"
              :max="3650"
              controls-position="right"
            />
            <span class="hint">天</span>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="数据脱敏" name="sensitiveData">
        <el-form :model="form" label-width="140px" class="system-config-page__form">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            class="system-config-page__alert"
            title="无「查看敏感信息」权限的角色，在用户列表/详情/导出中会对勾选字段打码。授权：角色权限 → 用户管理 → 敏感信息。"
          />
          <el-form-item label="启用脱敏">
            <el-switch v-model="form.sensitiveData.enabled" />
            <span class="hint">关闭后不再打码</span>
          </el-form-item>
          <el-form-item label="敏感字段">
            <el-checkbox-group v-model="form.sensitiveData.fields">
              <el-checkbox value="phone">手机号</el-checkbox>
              <el-checkbox value="email">邮箱</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <el-image-viewer
      v-if="brandIconPreviewVisible"
      :url-list="brandIconPreviewUrl ? [brandIconPreviewUrl] : []"
      teleported
      @close="brandIconPreviewVisible = false"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  appConfig,
  applyRemoteAppConfig,
  applyUserUiPreference,
  captureGlobalUiBaseline,
  defaultAppConfig,
} from '@/config/app'
import { getSystemConfig, updateSystemConfig, uploadBrandAsset } from '@/api/system-config'
import { APP_CLIENT_ID } from '@/config/client'
import { useUiPreferenceStore } from '@/stores/uiPreference'
import { parsePxInt, toPx } from '@/utils/px'
defineOptions({ name: 'SystemConfig' })
const clientId = APP_CLIENT_ID
/** 共享兜底 name（写入 app.name，供未配置 clients 的工程使用）；介绍只存 clients */
const sharedBrand = reactive({ name: '' })
const loading = ref(false)
const saving = ref(false)
const activeTab = ref('app')
const brandIconList = ref([])
const brandIconPreviewVisible = ref(false)
const brandIconPreviewUrl = ref('')
function brandIconUrl() {
  return (form.app.logo || form.app.favicon || '').trim()
}
function syncBrandIconList(url = brandIconUrl()) {
  if (!url) {
    brandIconList.value = []
    return
  }
  brandIconList.value = [
    {
      name: 'brand-icon',
      url,
      status: 'success',
      uid: Date.now(),
    },
  ]
}
function applyBrandIcon(url) {
  form.app.logo = url
  form.app.favicon = url
  syncBrandIconList(url)
}
function onBrandIconExceed() {
  ElMessage.warning('仅允许上传一张品牌图标')
}
function onBrandIconRemove() {
  applyBrandIcon('')
}
function onBrandIconPreview(file) {
  const url = file.url || brandIconUrl()
  if (!url) return
  brandIconPreviewUrl.value = url
  brandIconPreviewVisible.value = true
}
function createForm() {
  const d = JSON.parse(JSON.stringify(defaultAppConfig))
  return {
    app: { ...d.app, clients: { ...(d.app.clients || {}) } },
    session: { ...d.session },
    ui: {
      dialog: { ...d.ui.dialog },
      layout: { mode: d.ui.layout.mode },
      fontSize: { ...d.ui.fontSize },
      tagsView: { ...d.ui.tagsView },
      elementPlus: {
        ...d.ui.elementPlus,
        button: { ...d.ui.elementPlus.button },
        message: { ...d.ui.elementPlus.message },
        dialog: { ...d.ui.elementPlus.dialog },
      },
    },
    storage: {
      minio: { ...d.storage.minio },
    },
    logRetention: { ...d.logRetention },
    sensitiveData: {
      enabled: d.sensitiveData.enabled,
      fields: [...d.sensitiveData.fields],
    },
  }
}
const form = reactive(createForm())
const idleTimeoutMin = computed({
  get: () => Math.round(form.session.idleTimeoutMs / 60000),
  set: (v) => {
    form.session.idleTimeoutMs = Math.max(1, v || 1) * 60000
  },
})
const refreshIntervalMin = computed({
  get: () => Math.round(form.session.refreshIntervalMs / 60000),
  set: (v) => {
    form.session.refreshIntervalMs = Math.max(1, v || 1) * 60000
  },
})
const idleCheckIntervalSec = computed({
  get: () => Math.round(form.session.idleCheckIntervalMs / 1000),
  set: (v) => {
    form.session.idleCheckIntervalMs = Math.max(5, v || 5) * 1000
  },
})
function pxField(get, set, fallback) {
  return computed({
    get: () => parsePxInt(get(), fallback),
    set: (v) => set(toPx(v, fallback)),
  })
}
const tagsViewHeightPx = pxField(
  () => form.ui.tagsView.height,
  (v) => {
    form.ui.tagsView.height = v
  },
  40,
)
const fontSidebarPx = pxField(
  () => form.ui.fontSize.sidebar,
  (v) => {
    form.ui.fontSize.sidebar = v
  },
  14,
)
const fontHeaderPx = pxField(
  () => form.ui.fontSize.header,
  (v) => {
    form.ui.fontSize.header = v
  },
  14,
)
const fontTagsViewPx = pxField(
  () => form.ui.fontSize.tagsView,
  (v) => {
    form.ui.fontSize.tagsView = v
  },
  14,
)
const fontMainPx = pxField(
  () => form.ui.fontSize.main,
  (v) => {
    form.ui.fontSize.main = v
  },
  14,
)
function assignForm(data) {
  Object.assign(form.app, data.app)
  form.app.clients = { ...(data.app?.clients || {}) }
  sharedBrand.name = data.app?.name || ''
  const profile = form.app.clients[APP_CLIENT_ID]
  // 名称：本工程 profile > 本地默认 > 共享兜底
  if (profile?.name) form.app.name = profile.name
  else form.app.name = defaultAppConfig.app.name || sharedBrand.name
  // 介绍：只认云端 clients，本地不兜底长文
  form.app.intro = profile?.intro ?? ''
  // 品牌图标：favicon / logo 共用同一张图
  const icon = (form.app.logo || form.app.favicon || '').trim()
  form.app.logo = icon
  form.app.favicon = icon
  syncBrandIconList(icon)
  Object.assign(form.session, data.session)
  Object.assign(form.ui.dialog, data.ui.dialog)
  form.ui.layout.mode = data.ui.layout?.mode || 'side'
  Object.assign(form.ui.fontSize, data.ui.fontSize)
  Object.assign(form.ui.tagsView, data.ui.tagsView)
  Object.assign(form.ui.elementPlus, {
    ...data.ui.elementPlus,
    button: { ...data.ui.elementPlus.button },
    message: { ...data.ui.elementPlus.message },
    dialog: { ...data.ui.elementPlus.dialog },
  })
  Object.assign(form.storage.minio, data.storage?.minio || {})
  Object.assign(form.logRetention, data.logRetention || defaultAppConfig.logRetention)
  const sd = data.sensitiveData || defaultAppConfig.sensitiveData
  form.sensitiveData.enabled = sd.enabled !== false
  form.sensitiveData.fields = [
    ...(sd.fields?.length ? sd.fields : defaultAppConfig.sensitiveData.fields),
  ]
}
async function loadConfig() {
  loading.value = true
  try {
    const res = await getSystemConfig()
    if (res.data) assignForm(res.data)
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}
async function handleSave() {
  if (!form.app.name?.trim()) {
    ElMessage.warning('项目名称不能为空')
    activeTab.value = 'app'
    return
  }
  saving.value = true
  try {
    const icon = brandIconUrl()
    form.app.logo = icon
    form.app.favicon = icon
    const payload = JSON.parse(JSON.stringify(form))
    const clientName = payload.app.name.trim()
    const clientIntro = payload.app.intro ?? ''
    payload.app.clients = {
      ...(payload.app.clients || {}),
      [APP_CLIENT_ID]: { name: clientName, intro: clientIntro },
    }
    // 名称保留共享兜底；介绍只写在 clients，根 intro 留空避免与 clients 重复
    payload.app.name = (sharedBrand.name || clientName).trim()
    payload.app.intro = ''
    const res = await updateSystemConfig(payload)
    if (res.data) {
      assignForm(res.data)
    }
    applyRemoteAppConfig({
      ...(res.data || payload),
      app: {
        ...(res.data || payload).app,
        name: clientName,
        intro: clientIntro,
      },
    })
    captureGlobalUiBaseline()
    const pref = useUiPreferenceStore().preference
    if (pref) applyUserUiPreference(pref)
    ElMessage.success('保存成功，已即时生效（通用配置；用户个人偏好仍优先）')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
async function uploadBrandIcon(opt) {
  try {
    const file = opt.file
    const res = await uploadBrandAsset(file)
    const url = res.data?.url
    if (!url) throw new Error('上传失败')
    applyBrandIcon(url)
    ElMessage.success('上传成功')
    opt.onSuccess?.(res)
  } catch (e) {
    ElMessage.error(e?.message || '上传失败')
    opt.onError?.(e)
  }
}
onMounted(() => {
  // 先用当前运行时配置填充，再拉后端
  assignForm({
    app: { ...appConfig.app },
    session: { ...appConfig.session },
    ui: {
      dialog: { ...appConfig.ui.dialog },
      layout: { mode: appConfig.ui.layout.mode },
      fontSize: { ...appConfig.ui.fontSize },
      tagsView: { ...appConfig.ui.tagsView },
      elementPlus: {
        ...appConfig.ui.elementPlus,
        button: { ...appConfig.ui.elementPlus.button },
        message: { ...appConfig.ui.elementPlus.message },
        dialog: { ...appConfig.ui.elementPlus.dialog },
      },
    },
    storage: { minio: { ...appConfig.storage.minio } },
    logRetention: { ...appConfig.logRetention },
    sensitiveData: {
      enabled: appConfig.sensitiveData.enabled,
      fields: [...appConfig.sensitiveData.fields],
    },
  })
  loadConfig()
})
</script>

<style scoped>
.system-config-page__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.system-config-page__heading {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
  flex: 1;
  margin-right: 16px;
}

.system-config-page__heading .page-title {
  margin: 0;
  flex-shrink: 0;
}

.system-config-page__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}

.system-config-page__field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}

.system-config-page__tabs {
  min-height: 420px;
}

.system-config-page__tabs :deep(.el-tabs__header.is-left) {
  margin-right: 0;
}

.system-config-page__tabs :deep(.el-tabs__nav-wrap.is-left) {
  width: 128px;
}

.system-config-page__tabs :deep(.el-tabs__item.is-left) {
  justify-content: flex-start;
  padding: 0 16px;
  height: 44px;
}

.system-config-page__tabs :deep(.el-tabs__content) {
  padding: 4px 8px 8px 24px;
  overflow: auto;
}

.system-config-page__form {
  max-width: 720px;
  padding-top: 4px;
}

.system-config-page__form--compact {
  max-width: none;
  width: 100%;
}

.ui-split {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(280px, 1fr);
  gap: 16px;
  align-items: start;
  max-width: 1100px;
}

.ui-split__panel {
  padding: 16px 18px 8px;
  border: 1px solid var(--app-border-color, #ebeef5);
  border-radius: 8px;
  background: var(--app-fill-color, #fafbfc);
}

.ui-split__panel--aside {
  background: var(--app-card-bg, #ffffff);
  border-style: dashed;
}

.ui-split__title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
}

.ui-split__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.ui-split__head .ui-split__title {
  margin: 0;
  flex-shrink: 0;
}

.ui-split__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
  text-align: right;
}

.ui-split__desc--block {
  display: block;
  text-align: left;
  margin: -4px 0 12px;
}

@media (max-width: 960px) {
  .ui-split {
    grid-template-columns: 1fr;
  }
}

.hint {
  margin-left: 8px;
  color: var(--app-text-muted, #909399);
  font-size: 12px;
}

.form-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}

.brand-uploader :deep(.el-upload--picture-card),
.brand-uploader :deep(.el-upload-list__item) {
  width: 96px;
  height: 96px;
}

.brand-uploader.is-full :deep(.el-upload--picture-card) {
  display: none;
}

.px-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.px-field :deep(.el-input-number) {
  width: 140px;
}

.px-field__unit {
  color: var(--app-text-muted, #909399);
  font-size: 13px;
}
</style>
