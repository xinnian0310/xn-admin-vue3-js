import { hexToRgbCss, isLightColor, mixHex } from '@/utils/color'
const CUSTOM_THEME_ID = 'custom'
const DEFAULT_THEME_SOURCE = 'preset'
const DEFAULT_CUSTOM_PARTS = {
  primary: '#409eff',
  sidebarBg: '#409eff',
  headerBg: '#409eff',
}
const appearanceThemes = {
  light: {
    id: 'appearance-light',
    name: '\u4EAE\u8272',
    swatches: ['#ffffff', '#409eff'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#ffffff',
        bgElevated: '#f5f7fa',
        text: '#606266',
        textActive: '#303133',
        active: '#409eff',
        activeBg: 'rgba(64, 158, 255, 0.12)',
        hoverBg: 'rgba(0, 0, 0, 0.04)',
        border: '#ebeef5',
        railBg: '#f5f7fa',
      },
      header: {
        bg: '#ffffff',
        text: '#303133',
        border: '#ebeef5',
      },
    },
  },
  dark: {
    id: 'appearance-dark',
    name: '\u6697\u8272',
    swatches: ['#1d1e1f', '#409eff'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#141414',
        bgElevated: '#1d1e1f',
        text: 'rgba(255, 255, 255, 0.65)',
        textActive: '#ffffff',
        active: '#409eff',
        activeBg: 'rgba(64, 158, 255, 0.2)',
        hoverBg: 'rgba(255, 255, 255, 0.06)',
        border: '#414243',
        railBg: '#0a0a0a',
      },
      header: {
        bg: '#1d1e1f',
        text: 'rgba(255, 255, 255, 0.9)',
        border: '#414243',
      },
    },
  },
}
function buildThemeColorsFromParts(parts) {
  const { primary, sidebarBg, headerBg } = parts
  const sidebarLight = isLightColor(sidebarBg)
  const headerLight = isLightColor(headerBg)
  return {
    primary,
    sidebar: {
      bg: sidebarBg,
      bgElevated: mixHex(sidebarBg, sidebarLight ? '#000000' : '#ffffff', 0.08),
      text: sidebarLight ? '#64748b' : 'rgba(255, 255, 255, 0.75)',
      textActive: sidebarLight ? '#0f172a' : '#ffffff',
      active: sidebarLight ? primary : '#ffffff',
      activeBg: sidebarLight ? `rgba(${hexToRgbCss(primary)}, 0.12)` : 'rgba(255, 255, 255, 0.16)',
      hoverBg: sidebarLight ? 'rgba(15, 23, 42, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      border: sidebarLight ? mixHex(sidebarBg, '#000000', 0.12) : 'rgba(255, 255, 255, 0.12)',
      railBg: mixHex(sidebarBg, sidebarLight ? '#000000' : '#ffffff', 0.1),
    },
    header: {
      bg: headerBg,
      text: headerLight ? '#334155' : 'rgba(255, 255, 255, 0.95)',
      border: headerLight ? mixHex(headerBg, '#000000', 0.08) : 'rgba(255, 255, 255, 0.15)',
    },
  }
}
const builtinThemes = [
  {
    id: 'blue',
    name: '\u7ECF\u5178\u84DD',
    swatches: ['#409eff', '#409eff'],
    colors: {
      primary: '#409eff',
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
  },
  {
    id: 'indigo',
    name: '\u975B\u84DD',
    swatches: ['#312e81', '#4f46e5'],
    colors: {
      primary: '#4f46e5',
      sidebar: {
        bg: '#312e81',
        bgElevated: '#1e1b4b',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.16)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#1e1b4b',
      },
      header: {
        bg: '#4f46e5',
        text: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  {
    id: 'teal',
    name: '\u9752\u7EFF',
    swatches: ['#0f766e', '#14b8a6'],
    colors: {
      primary: '#0d9488',
      sidebar: {
        bg: '#0f766e',
        bgElevated: '#115e59',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.18)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#134e4a',
      },
      header: {
        bg: '#14b8a6',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  {
    id: 'emerald',
    name: '\u7FE0\u7EFF',
    swatches: ['#166534', '#22c55e'],
    colors: {
      primary: '#16a34a',
      sidebar: {
        bg: '#166534',
        bgElevated: '#14532d',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.18)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#14532d',
      },
      header: {
        bg: '#16a34a',
        text: 'rgba(255, 255, 255, 0.95)',
        border: 'rgba(255, 255, 255, 0.15)',
      },
    },
  },
  {
    id: 'slate',
    name: '\u6DF1\u7A7A\u7070',
    swatches: ['#334155', '#64748b'],
    colors: {
      primary: '#475569',
      sidebar: {
        bg: '#334155',
        bgElevated: '#1e293b',
        text: 'rgba(255, 255, 255, 0.75)',
        textActive: '#ffffff',
        active: '#ffffff',
        activeBg: 'rgba(255, 255, 255, 0.16)',
        hoverBg: 'rgba(255, 255, 255, 0.1)',
        border: 'rgba(255, 255, 255, 0.1)',
        railBg: '#1e293b',
      },
      header: {
        bg: '#475569',
        text: 'rgba(255, 255, 255, 0.9)',
        border: 'rgba(255, 255, 255, 0.12)',
      },
    },
  },
  {
    id: 'dawn',
    name: '\u62C2\u6653',
    swatches: ['#e8eef7', '#1e4d8c'],
    colors: {
      primary: '#1e4d8c',
      sidebar: {
        bg: '#e8eef7',
        bgElevated: '#dbe4f0',
        text: '#64748b',
        textActive: '#0f172a',
        active: '#1e4d8c',
        activeBg: 'rgba(30, 77, 140, 0.12)',
        hoverBg: 'rgba(15, 23, 42, 0.05)',
        border: '#d0d9e8',
        railBg: '#dbe4f0',
      },
      header: {
        bg: '#f1f5f9',
        text: '#334155',
        border: '#e2e8f0',
      },
    },
  },
]
const DEFAULT_THEME_ID = 'blue'
function findTheme(id) {
  return builtinThemes.find((t) => t.id === id) ?? builtinThemes[0]
}
function findAppearanceTheme(mode) {
  return appearanceThemes[mode]
}
function resolveActiveTheme(input) {
  if (input.source === 'appearance') {
    return findAppearanceTheme(input.appearance)
  }
  if (input.source === 'custom') {
    const colors = buildThemeColorsFromParts(input.customParts)
    return {
      id: CUSTOM_THEME_ID,
      name: '\u4E2A\u6027\u5316',
      swatches: [input.customParts.sidebarBg, input.customParts.primary],
      colors,
    }
  }
  return findTheme(input.themeId)
}
function resolveThemeColors(themeId, customParts) {
  if (themeId === CUSTOM_THEME_ID) {
    return buildThemeColorsFromParts(customParts)
  }
  return findTheme(themeId).colors
}
export {
  CUSTOM_THEME_ID,
  DEFAULT_CUSTOM_PARTS,
  DEFAULT_THEME_ID,
  DEFAULT_THEME_SOURCE,
  appearanceThemes,
  buildThemeColorsFromParts,
  builtinThemes,
  findAppearanceTheme,
  findTheme,
  resolveActiveTheme,
  resolveThemeColors,
}
