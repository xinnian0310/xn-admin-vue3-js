import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { applyLayoutTheme } from '@/config/app'
import {
  DEFAULT_CUSTOM_PARTS,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_SOURCE,
  builtinThemes,
  resolveActiveTheme,
} from '@/config/themes'
const STORAGE_SOURCE = 'xn-theme-source'
const STORAGE_THEME_ID = 'xn-theme-id'
const STORAGE_APPEARANCE = 'xn-appearance'
const STORAGE_CUSTOM = 'xn-theme-custom'
const STORAGE_MAIN_BG = 'xn-main-bg-image'
const MAIN_BG_MAX_BYTES = 800 * 1024
function loadSource() {
  try {
    const v = localStorage.getItem(STORAGE_SOURCE)
    if (v === 'appearance' || v === 'custom' || v === 'preset') return v
    if (localStorage.getItem(STORAGE_THEME_ID) === 'custom') return 'custom'
    return DEFAULT_THEME_SOURCE
  } catch {
    return DEFAULT_THEME_SOURCE
  }
}
function loadThemeId() {
  try {
    const id = localStorage.getItem(STORAGE_THEME_ID) || DEFAULT_THEME_ID
    return id === 'custom' ? DEFAULT_THEME_ID : id
  } catch {
    return DEFAULT_THEME_ID
  }
}
function loadAppearance() {
  try {
    const v = localStorage.getItem(STORAGE_APPEARANCE)
    return v === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}
function loadCustomParts() {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM)
    if (!raw) return { ...DEFAULT_CUSTOM_PARTS }
    return { ...DEFAULT_CUSTOM_PARTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CUSTOM_PARTS }
  }
}
function loadMainBgImage() {
  try {
    return localStorage.getItem(STORAGE_MAIN_BG)
  } catch {
    return null
  }
}
const useThemeStore = defineStore('theme', () => {
  const source = ref(loadSource())
  const themeId = ref(loadThemeId())
  const appearance = ref(loadAppearance())
  const customParts = ref(loadCustomParts())
  const mainBgImage = ref(loadMainBgImage())
  const dialogVisible = ref(false)
  const themes = computed(() => builtinThemes)
  const currentTheme = computed(() =>
    resolveActiveTheme({
      source: source.value,
      themeId: themeId.value,
      appearance: appearance.value,
      customParts: customParts.value,
    }),
  )
  const effectiveAppearance = computed(() =>
    source.value === 'appearance' ? appearance.value : 'light',
  )
  function persistSource(next) {
    source.value = next
    localStorage.setItem(STORAGE_SOURCE, next)
  }
  function applyCurrent() {
    applyLayoutTheme(currentTheme.value.colors, {
      appearance: effectiveAppearance.value,
      // 底图只在个性化下生效
      mainBgImage: source.value === 'custom' ? mainBgImage.value : null,
    })
  }
  function setTheme(id) {
    themeId.value = id
    localStorage.setItem(STORAGE_THEME_ID, id)
    persistSource('preset')
    applyCurrent()
  }
  function setAppearance(mode) {
    appearance.value = mode
    localStorage.setItem(STORAGE_APPEARANCE, mode)
    persistSource('appearance')
    applyCurrent()
  }
  function setCustomParts(partial) {
    customParts.value = { ...customParts.value, ...partial }
    localStorage.setItem(STORAGE_CUSTOM, JSON.stringify(customParts.value))
    persistSource('custom')
    applyCurrent()
  }
  function setMainBgImage(dataUrl) {
    mainBgImage.value = dataUrl
    try {
      if (dataUrl) localStorage.setItem(STORAGE_MAIN_BG, dataUrl)
      else localStorage.removeItem(STORAGE_MAIN_BG)
    } catch {
      mainBgImage.value = null
      throw new Error(
        '\u5E95\u56FE\u8FC7\u5927\u6216\u5B58\u50A8\u7A7A\u95F4\u4E0D\u8DB3\uFF0C\u8BF7\u538B\u7F29\u540E\u91CD\u8BD5',
      )
    }
    persistSource('custom')
    applyCurrent()
  }
  function applyCustom() {
    persistSource('custom')
    applyCurrent()
  }
  function openDialog() {
    dialogVisible.value = true
  }
  function closeDialog() {
    dialogVisible.value = false
  }
  return {
    source,
    themeId,
    appearance,
    customParts,
    mainBgImage,
    dialogVisible,
    currentTheme,
    themes,
    effectiveAppearance,
    applyCurrent,
    setTheme,
    setAppearance,
    setCustomParts,
    setMainBgImage,
    applyCustom,
    openDialog,
    closeDialog,
  }
})
export { MAIN_BG_MAX_BYTES, useThemeStore }
