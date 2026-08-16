import { reactive } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import {
  DEFAULT_CUSTOM_PARTS,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_SOURCE,
  resolveActiveTheme,
} from '@/config/themes'
import { buildPrimaryScale, mixHex } from '@/utils/color'
const elementPlusLocales = {
  'zh-cn': zhCn,
  en,
}
const defaultAppConfig = {
  app: {
    name: '心念后台管理系统（Vue3 JS）',
    /** 应用介绍：本地留空，由公开配置按 client 投影后写入 */
    intro: '',
    favicon: '/xinnian-tech-logo.png',
    logo: '/xinnian-tech-logo.png',
    logoWidth: 28,
    logoHeight: null,
    footer:
      '\u5FC3\u5FF5\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF \xB7 \u5FC3\u5FF5\u79D1\u6280 \xB7 Copyright \xA9 2026',
  },
  session: {
    idleLogoutEnabled: true,
    idleTimeoutMs: 30 * 60 * 1e3,
    slidingRefreshEnabled: true,
    refreshIntervalMs: 5 * 60 * 1e3,
    idleCheckIntervalMs: 30 * 1e3,
  },
  ui: {
    dialog: {
      maxHeight: '80vh',
    },
    layout: {
      mode: 'side',
      /**
       * 侧栏 / 顶栏菜单配色默认值（仅作文档/兜底；运行时主题由 theme store 写入 CSS）
       */
      sidebar: {
        bg: '#409eff',
        bgElevated: '#337ecc',
        text: 'rgba(255, 255, 255, 0.85)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.22)',
        hoverBg: 'rgba(255, 255, 255, 0.14)',
        border: 'rgba(255, 255, 255, 0.18)',
        railBg: '#337ecc',
      },
      header: {
        bg: '#409eff',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
    fontSize: {
      sidebar: '14px',
      header: '14px',
      tagsView: '14px',
      main: '14px',
    },
    tagsView: {
      height: '40px',
    },
    elementPlus: {
      locale: 'zh-cn',
      size: 'default',
      zIndex: 2e3,
      namespace: 'el',
      button: {
        autoInsertSpace: false,
      },
      message: {
        max: 3,
      },
      dialog: {
        alignCenter: true,
        draggable: true,
        overflow: false,
      },
    },
  },
  storage: {
    minio: 'http://127.0.0.1:9000/xn-admin/',
    /** kkFileView 5.0 预览服务根地址 */
    kkFileView: 'http://127.0.0.1:8012/',
  },
  logRetention: {
    loginDays: 90,
    operDays: 90,
    exceptionDays: 90,
    jobDays: 90,
  },
  /** 用户敏感字段脱敏（列表/详情/导出） */
  sensitiveData: {
    enabled: true,
    /** 可选：phone、email */
    fields: ['phone', 'email'],
  },
}
function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultAppConfig))
}
const appConfig = reactive(cloneDefault())
function deepMergeAppConfig(target, remote) {
  if (remote == null || typeof remote !== 'object' || Array.isArray(remote)) {
    return target
  }
  const src = remote
  for (const key of Object.keys(src)) {
    const value = src[key]
    if (value === void 0) continue
    const current = target[key]
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      current !== null &&
      typeof current === 'object' &&
      !Array.isArray(current)
    ) {
      deepMergeAppConfig(current, value)
    } else {
      target[key] = value
    }
  }
  return target
}
function applyRemoteAppConfig(remote) {
  if (!remote) return
  const remoteStorage = remote.storage
  const { storage: _ignored, ...rest } = remote
  deepMergeAppConfig(appConfig, rest)
  if (remoteStorage && typeof remoteStorage === 'object' && !Array.isArray(remoteStorage)) {
    const entries = Object.entries(remoteStorage).filter(
      ([k, v]) => !!k?.trim() && typeof v === 'string' && !!v.trim(),
    )
    if (entries.length > 0) {
      for (const key of Object.keys(appConfig.storage)) delete appConfig.storage[key]
      for (const [k, v] of entries) appConfig.storage[k.trim()] = v.trim()
    }
  }
  const app = remote.app
  if (app) {
    if ('logoWidth' in app) appConfig.app.logoWidth = app.logoWidth ?? null
    if ('logoHeight' in app) appConfig.app.logoHeight = app.logoHeight ?? null
  }
  // 运行时只用投影后的 name/intro，不保留云端 clients 映射
  delete appConfig.app.clients
  applyAppConfig(appConfig)
}
function resolveStorageBase(name = 'minio') {
  const fromRemote = appConfig.storage?.[name]?.trim()
  if (fromRemote) return fromRemote.endsWith('/') ? fromRemote : `${fromRemote}/`
  const fallback = defaultAppConfig.storage[name] || ''
  if (!fallback) return ''
  return fallback.endsWith('/') ? fallback : `${fallback}/`
}
function resolveStorageUrl(objectPath, storageName = 'minio') {
  const base = resolveStorageBase(storageName)
  const rel = (objectPath || '').replace(/^\/+/, '')
  if (!base) return rel
  return `${base}${rel}`
}
/**
 * 业务附件访问地址：优先远程连接配置 storage.minio；
 * 已是绝对地址或 /uploads 路径时原样返回；再兜底本地 uploads。
 */
function resolveAttachmentUrl(filePath, storageName = 'minio') {
  const path = (filePath || '').trim()
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path
  const remote = resolveStorageUrl(path, storageName)
  if (remote && /^https?:\/\//i.test(remote)) return remote
  return `/uploads/${path.replace(/^\/+/, '')}`
}
let globalUiBaseline = null
function captureGlobalUiBaseline(config = appConfig) {
  globalUiBaseline = {
    layoutMode: config.ui.layout.mode,
    fontSize: { ...config.ui.fontSize },
    tagsView: { ...config.ui.tagsView },
    dialog: { ...config.ui.dialog },
  }
}
function applyUserUiPreference(pref) {
  if (globalUiBaseline) {
    appConfig.ui.layout.mode = globalUiBaseline.layoutMode
    Object.assign(appConfig.ui.fontSize, globalUiBaseline.fontSize)
    Object.assign(appConfig.ui.tagsView, globalUiBaseline.tagsView)
    Object.assign(appConfig.ui.dialog, globalUiBaseline.dialog)
  }
  if (pref) {
    if (pref.layout?.mode) appConfig.ui.layout.mode = pref.layout.mode
    if (pref.fontSize) {
      for (const [k, v] of Object.entries(pref.fontSize)) {
        if (v) appConfig.ui.fontSize[k] = v
      }
    }
    if (pref.tagsView?.height) appConfig.ui.tagsView.height = pref.tagsView.height
    if (pref.dialog?.maxHeight) appConfig.ui.dialog.maxHeight = pref.dialog.maxHeight
  }
  applyAppConfig(appConfig)
}
function getElementPlusProviderProps(config = appConfig) {
  const ep = config.ui.elementPlus
  return {
    locale: elementPlusLocales[ep.locale] ?? zhCn,
    size: ep.size,
    zIndex: ep.zIndex,
    namespace: ep.namespace,
    button: ep.button,
    message: ep.message,
    dialog: ep.dialog,
  }
}
function applyFavicon(href) {
  const path = href.trim()
  if (!path) return
  let link = document.querySelector("link[rel='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = path.endsWith('.svg')
    ? 'image/svg+xml'
    : path.endsWith('.png')
      ? 'image/png'
      : 'image/x-icon'
  link.href = path
}
function applyAppConfig(config = appConfig) {
  document.title = config.app.name
  applyFavicon(config.app.favicon)
  const root = document.documentElement
  const { dialog, fontSize, tagsView } = config.ui
  root.style.setProperty('--app-dialog-max-height', dialog.maxHeight)
  root.style.setProperty('--app-font-size-sidebar', fontSize.sidebar)
  root.style.setProperty('--app-font-size-header', fontSize.header)
  root.style.setProperty('--app-font-size-tags-view', fontSize.tagsView)
  root.style.setProperty('--app-font-size-main', fontSize.main)
  root.style.setProperty('--app-tags-view-height', tagsView.height)
  if (config.app.logoWidth != null) {
    root.style.setProperty('--app-logo-width', `${config.app.logoWidth}px`)
  } else {
    root.style.removeProperty('--app-logo-width')
  }
  if (config.app.logoHeight != null) {
    root.style.setProperty('--app-logo-height', `${config.app.logoHeight}px`)
  } else {
    root.style.removeProperty('--app-logo-height')
  }
  let source = DEFAULT_THEME_SOURCE
  let themeId = DEFAULT_THEME_ID
  let appearance = 'light'
  let customParts = { ...DEFAULT_CUSTOM_PARTS }
  let mainBgImage = null
  try {
    const rawSource = localStorage.getItem('xn-theme-source')
    if (rawSource === 'appearance' || rawSource === 'custom' || rawSource === 'preset') {
      source = rawSource
    } else if (localStorage.getItem('xn-theme-id') === 'custom') {
      source = 'custom'
    }
    const rawId = localStorage.getItem('xn-theme-id') || DEFAULT_THEME_ID
    themeId = rawId === 'custom' ? DEFAULT_THEME_ID : rawId
    appearance = localStorage.getItem('xn-appearance') || 'light'
    const rawParts = localStorage.getItem('xn-theme-custom')
    if (rawParts) customParts = { ...DEFAULT_CUSTOM_PARTS, ...JSON.parse(rawParts) }
    mainBgImage = localStorage.getItem('xn-main-bg-image')
  } catch {
    // ignore invalid local theme cache
  }
  const active = resolveActiveTheme({ source, themeId, appearance, customParts })
  applyLayoutTheme(active.colors, {
    appearance: source === 'appearance' ? appearance : 'light',
    mainBgImage: source === 'custom' ? mainBgImage : null,
    source,
  })
}
function applyLayoutTheme(colors, options = {}) {
  const appearance = options.appearance ?? 'light'
  const mainBgImage = options.mainBgImage ?? null
  const root = document.documentElement
  const dark = appearance === 'dark'
  root.classList.toggle('dark', dark)
  root.style.colorScheme = dark ? 'dark' : 'light'
  const s = colors.sidebar
  root.style.setProperty('--app-sidebar-bg', s.bg)
  root.style.setProperty('--app-sidebar-bg-elevated', s.bgElevated)
  root.style.setProperty('--app-sidebar-text', s.text)
  root.style.setProperty('--app-sidebar-text-active', s.textActive)
  root.style.setProperty('--app-sidebar-active', s.active)
  root.style.setProperty('--app-sidebar-active-bg', s.activeBg)
  root.style.setProperty('--app-sidebar-hover-bg', s.hoverBg)
  root.style.setProperty('--app-sidebar-border', s.border)
  root.style.setProperty('--app-sidebar-rail-bg', s.railBg)
  const h = colors.header
  root.style.setProperty('--app-header-bg', h.bg)
  root.style.setProperty('--app-header-text', h.text)
  root.style.setProperty('--app-header-border', h.border)
  const scale = buildPrimaryScale(colors.primary)
  root.style.setProperty('--app-color-primary', scale.primary)
  root.style.setProperty('--app-color-primary-light-3', scale['light-3'])
  root.style.setProperty('--app-color-primary-light-5', scale['light-5'])
  root.style.setProperty('--app-color-primary-light-7', scale['light-7'])
  root.style.setProperty('--app-color-primary-light-8', scale['light-8'])
  root.style.setProperty('--app-color-primary-light-9', scale['light-9'])
  root.style.setProperty('--app-color-primary-dark-2', scale['dark-2'])
  root.style.setProperty('--app-color-primary-rgb', scale.rgb)
  root.style.setProperty('--el-color-primary', scale.primary)
  root.style.setProperty('--el-color-primary-light-3', scale['light-3'])
  root.style.setProperty('--el-color-primary-light-5', scale['light-5'])
  root.style.setProperty('--el-color-primary-light-7', scale['light-7'])
  root.style.setProperty('--el-color-primary-light-8', scale['light-8'])
  root.style.setProperty('--el-color-primary-light-9', scale['light-9'])
  root.style.setProperty('--el-color-primary-dark-2', scale['dark-2'])
  root.style.setProperty('--el-color-primary-rgb', scale.rgb)
  if (dark) {
    root.style.setProperty('--app-page-bg', '#0a0a0a')
    root.style.setProperty('--app-main-bg', '#141414')
    root.style.setProperty('--app-card-bg', '#1d1e1f')
    root.style.setProperty('--app-fill-color', '#262727')
    root.style.setProperty('--app-tags-bg', '#1d1e1f')
    root.style.setProperty('--app-tags-border', '#414243')
    root.style.setProperty('--app-tags-item-bg', '#1d1e1f')
    root.style.setProperty('--app-tags-item-text', '#a3a6ad')
    root.style.setProperty('--app-tags-item-hover-bg', mixHex(colors.primary, '#000000', 0.55))
    root.style.setProperty('--app-tags-item-active-bg', scale.primary)
    root.style.setProperty('--app-tags-item-active-text', '#ffffff')
    root.style.setProperty('--app-tags-scrollbar', '#4c4d4f')
    root.style.setProperty('--app-border-color', '#414243')
    root.style.setProperty('--app-text-muted', '#a3a6ad')
    root.style.setProperty('--app-text-primary', '#e5eaf3')
    root.style.setProperty('--app-surface-soft', mixHex(colors.primary, '#000000', 0.7))
    root.style.setProperty('--app-surface-soft-border', mixHex(colors.primary, '#000000', 0.4))
    root.style.setProperty('--app-card-hover-border', mixHex(colors.primary, '#000000', 0.25))
  } else {
    root.style.setProperty('--app-page-bg', '#f5f7fa')
    root.style.setProperty('--app-main-bg', '#f5f7fa')
    root.style.setProperty('--app-card-bg', '#ffffff')
    root.style.setProperty('--app-fill-color', '#fafbfc')
    root.style.setProperty('--app-tags-bg', '#ffffff')
    root.style.setProperty('--app-tags-border', '#ebeef5')
    root.style.setProperty('--app-tags-item-bg', '#ffffff')
    root.style.setProperty('--app-tags-item-text', '#606266')
    root.style.setProperty('--app-tags-item-hover-bg', scale['light-9'])
    root.style.setProperty('--app-tags-item-active-bg', scale.primary)
    root.style.setProperty('--app-tags-item-active-text', '#ffffff')
    root.style.setProperty('--app-tags-scrollbar', '#dcdfe6')
    root.style.setProperty('--app-border-color', '#ebeef5')
    root.style.setProperty('--app-text-muted', '#909399')
    root.style.setProperty('--app-text-primary', '#303133')
    root.style.setProperty('--app-surface-soft', scale['light-9'])
    root.style.setProperty('--app-surface-soft-border', scale['light-5'])
    root.style.setProperty('--app-card-hover-border', mixHex(colors.primary, '#ffffff', 0.45))
  }
  // 页签选中态：预设 / 个性化用实心主色；外观模式跟随侧栏强调色（更贴合亮 / 暗观感）
  if (options.source === 'appearance') {
    root.style.setProperty('--app-tags-item-active-bg', colors.sidebar.activeBg)
    root.style.setProperty('--app-tags-item-active-text', colors.sidebar.active)
    root.style.setProperty('--app-tags-item-active-border', colors.sidebar.active)
  } else {
    root.style.setProperty('--app-tags-item-active-border', scale.primary)
  }

  if (mainBgImage) {
    root.style.setProperty('--app-main-bg-image', `url("${mainBgImage}")`)
  } else {
    root.style.setProperty('--app-main-bg-image', 'none')
  }
}
export {
  appConfig,
  applyAppConfig,
  applyLayoutTheme,
  applyRemoteAppConfig,
  applyUserUiPreference,
  captureGlobalUiBaseline,
  deepMergeAppConfig,
  defaultAppConfig,
  getElementPlusProviderProps,
  resolveAttachmentUrl,
  resolveStorageBase,
  resolveStorageUrl,
}
