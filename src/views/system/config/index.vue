<template>
  <div class="page-card system-config-page" v-loading="loading">
    <div class="page-header">
      <div class="system-config-page__heading">
        <h2 class="page-title">系统配置</h2>
        <p class="system-config-page__hint">
          与前端 app.js
          对齐：每个分区一张表、一套独立接口，点「修改」后才可编辑，保存后即时生效。登录页背景/验证码请在「登录页设置」中配置；主题色请在右上角主题面板调整。
          「项目名称 / 应用介绍」按当前前端工程（{{ clientId }}）单独存储，不影响其他前端项目。
        </p>
      </div>
    </div>

    <el-tabs v-model="activeTab" tab-position="left" class="system-config-page__tabs">
      <el-tab-pane label="应用信息" name="app">
        <el-form
          :model="form"
          :disabled="!editing.app"
          label-width="120px"
          class="system-config-page__form"
        >
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
                :disabled="!editing.app"
                :file-list="brandIconList"
                class="brand-uploader"
                :class="{ 'is-full': brandIconList.length >= 1 || !editing.app }"
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
        <SectionActions
          :editing="editing.app"
          :saving="savingSection === 'app'"
          @edit="startEdit('app')"
          @save="saveSection('app')"
          @cancel="cancelEdit('app')"
          @refresh="refreshSection('app')"
        />
      </el-tab-pane>

      <el-tab-pane label="会话策略" name="session">
        <el-form
          :model="form"
          :disabled="!editing.session"
          label-width="140px"
          class="system-config-page__form"
        >
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
        <SectionActions
          :editing="editing.session"
          :saving="savingSection === 'session'"
          @edit="startEdit('session')"
          @save="saveSection('session')"
          @cancel="cancelEdit('session')"
          @refresh="refreshSection('session')"
        />
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
              :disabled="!editing.ui"
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
              <h3 class="ui-split__title">Element Plus 全局</h3>
              <p class="ui-split__desc">对应本工程 ui.elementPlus。主题色请用右上角主题面板。</p>
            </div>
            <el-form
              :model="form"
              :disabled="!editing.ui"
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
        <SectionActions
          :editing="editing.ui"
          :saving="savingSection === 'ui'"
          @edit="startEdit('ui')"
          @save="saveSection('ui')"
          @cancel="cancelEdit('ui')"
          @refresh="refreshSection('ui')"
        />
      </el-tab-pane>

      <el-tab-pane label="日志保留" name="logRetention">
        <el-form
          :model="form"
          :disabled="!editing.logRetention"
          label-width="140px"
          class="system-config-page__form"
        >
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
        <SectionActions
          :editing="editing.logRetention"
          :saving="savingSection === 'logRetention'"
          @edit="startEdit('logRetention')"
          @save="saveSection('logRetention')"
          @cancel="cancelEdit('logRetention')"
          @refresh="refreshSection('logRetention')"
        />
      </el-tab-pane>

      <el-tab-pane label="数据脱敏" name="sensitiveData">
        <el-form
          :model="form"
          :disabled="!editing.sensitiveData"
          label-width="140px"
          class="system-config-page__form"
        >
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
        <SectionActions
          :editing="editing.sensitiveData"
          :saving="savingSection === 'sensitiveData'"
          @edit="startEdit('sensitiveData')"
          @save="saveSection('sensitiveData')"
          @cancel="cancelEdit('sensitiveData')"
          @refresh="refreshSection('sensitiveData')"
        />
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SectionActions from './section-actions.vue'
import {
  appConfig,
  applyRemoteAppConfig,
  applyUserUiPreference,
  captureGlobalUiBaseline,
  defaultAppConfig,
} from '@/config/app'
import {
  getSystemConfig,
  getSystemConfigSection,
  updateSystemConfigSection,
  uploadBrandAsset,
} from '@/api/system-config'
import { APP_CLIENT_ID } from '@/config/client'
import { useUiPreferenceStore } from '@/stores/uiPreference'
import { parsePxInt, toPx } from '@/utils/px'
defineOptions({ name: 'SystemConfig' })
const clientId = APP_CLIENT_ID
/** 共享兜底 name（写入 app.name，供未配置 clients 的工程使用）；介绍只存 clients */
const sharedBrand = reactive({ name: '' })
const loading = ref(false)
const savingSection = ref('')
const activeTab = ref('app')
const brandIconList = ref([])
const brandIconPreviewVisible = ref(false)
const brandIconPreviewUrl = ref('')
const editing = reactive({
  app: false,
  session: false,
  ui: false,
  logRetention: false,
  sensitiveData: false,
})
/** 进入编辑态时的快照，取消时回滚 */
const snapshots = {}
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
    storage: { ...d.storage },
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
function applyAppSection(app) {
  Object.assign(form.app, app)
  form.app.clients = { ...(app?.clients || {}) }
  sharedBrand.name = app?.name || ''
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
}
function applyUiSection(ui) {
  Object.assign(form.ui.dialog, ui.dialog)
  form.ui.layout.mode = ui.layout?.mode || 'side'
  Object.assign(form.ui.fontSize, ui.fontSize)
  Object.assign(form.ui.tagsView, ui.tagsView)
  Object.assign(form.ui.elementPlus, {
    ...ui.elementPlus,
    button: { ...ui.elementPlus.button },
    message: { ...ui.elementPlus.message },
    dialog: { ...ui.elementPlus.dialog },
  })
}
function applySensitiveSection(sd) {
  form.sensitiveData.enabled = sd?.enabled !== false
  form.sensitiveData.fields = [
    ...(sd?.fields?.length ? sd.fields : defaultAppConfig.sensitiveData.fields),
  ]
}
function applySectionData(section, data) {
  if (data == null) return
  if (section === 'app') applyAppSection(data)
  else if (section === 'session') Object.assign(form.session, data)
  else if (section === 'ui') applyUiSection(data)
  else if (section === 'logRetention') Object.assign(form.logRetention, data)
  else if (section === 'sensitiveData') applySensitiveSection(data)
}
function assignForm(data) {
  applyAppSection(data.app)
  Object.assign(form.session, data.session)
  applyUiSection(data.ui)
  form.storage = { ...(data.storage || {}) }
  Object.assign(form.logRetention, data.logRetention || defaultAppConfig.logRetention)
  applySensitiveSection(data.sensitiveData || defaultAppConfig.sensitiveData)
}
function buildSectionPayload(section) {
  if (section === 'app') {
    const icon = brandIconUrl()
    const clientName = form.app.name.trim()
    const clientIntro = form.app.intro ?? ''
    return {
      ...JSON.parse(JSON.stringify(form.app)),
      logo: icon,
      favicon: icon,
      clients: {
        ...(form.app.clients || {}),
        [APP_CLIENT_ID]: { name: clientName, intro: clientIntro },
      },
      name: (sharedBrand.name || clientName).trim(),
      intro: '',
    }
  }
  return JSON.parse(JSON.stringify(form[section]))
}
function sectionOfPayload(section, payload) {
  return payload[section]
}
function startEdit(section) {
  snapshots[section] = JSON.stringify(buildSectionPayload(section))
  editing[section] = true
}
function cancelEdit(section) {
  const raw = snapshots[section]
  if (raw) applySectionData(section, JSON.parse(raw))
  delete snapshots[section]
  editing[section] = false
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
async function refreshSection(section) {
  loading.value = true
  try {
    const res = await getSystemConfigSection(section)
    applySectionData(section, res.data)
    ElMessage.success('已刷新')
  } catch (e) {
    ElMessage.error(e?.message || '刷新失败')
  } finally {
    loading.value = false
  }
}
/** 保存返回的是全量配置，回填时保留本工程的项目名 / 介绍 */
function withClientBrand(payload) {
  const clientName =
    payload.app?.clients?.[APP_CLIENT_ID]?.name || form.app.name || defaultAppConfig.app.name
  const clientIntro = payload.app?.clients?.[APP_CLIENT_ID]?.intro ?? form.app.intro ?? ''
  return { ...payload, app: { ...payload.app, name: clientName, intro: clientIntro } }
}
function validateSection(section) {
  if (section === 'app' && !form.app.name?.trim()) {
    ElMessage.warning('项目名称不能为空')
    return false
  }
  return true
}
async function saveSection(section) {
  if (!validateSection(section)) return
  savingSection.value = section
  try {
    const res = await updateSystemConfigSection(section, buildSectionPayload(section))
    if (res.data) {
      applySectionData(section, sectionOfPayload(section, res.data))
      applyRemoteAppConfig(withClientBrand(res.data))
      if (section === 'ui') {
        captureGlobalUiBaseline()
        const pref = useUiPreferenceStore().preference
        if (pref) applyUserUiPreference(pref)
      }
    }
    delete snapshots[section]
    editing[section] = false
    ElMessage.success('保存成功，已即时生效')
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    savingSection.value = ''
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
    storage: { ...appConfig.storage },
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
.system-config-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.system-config-page > .page-header {
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

.system-config-page__tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.system-config-page__tabs :deep(.el-tabs__header.is-left) {
  margin-right: 0;
  flex-shrink: 0;
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
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 4px 8px 8px 24px;
  overflow: auto;
}

.section-actions {
  width: min(100%, 720px);
  justify-content: center;
  margin-top: 16px;
  flex-shrink: 0;
}

.system-config-page__form {
  max-width: 720px;
  padding-top: 4px;
}

.system-config-page__form--compact {
  max-width: none;
  width: 100%;
}

.system-config-page__alert {
  margin-bottom: 12px;
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
