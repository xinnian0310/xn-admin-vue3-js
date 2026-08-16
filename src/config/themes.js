import { hexToRgbCss, isLightColor, mixHex } from '@/utils/color'

const CUSTOM_THEME_ID = 'custom'
const DEFAULT_THEME_SOURCE = 'appearance'
const DEFAULT_THEME_ID = 'blue'

const DEFAULT_CUSTOM_PARTS = {
  primary: '#409eff',
  sidebarBg: '#337ecc',
  headerBg: mixHex('#337ecc', '#ffffff', 0.14),
}

function themeToCustomParts(theme) {
  return {
    primary: theme.colors.primary,
    sidebarBg: theme.colors.sidebar.bg,
    headerBg: theme.colors.header.bg,
  }
}

function brandSider(bg) {
  return {
    bg,
    bgElevated: mixHex(bg, '#000000', 0.1),
    text: 'rgba(255, 255, 255, 0.85)',
    textActive: '#ffffff',
    active: '#ffffff',
    activeBg: 'rgba(255, 255, 255, 0.22)',
    hoverBg: 'rgba(255, 255, 255, 0.12)',
    border: 'rgba(255, 255, 255, 0.14)',
    railBg: mixHex(bg, '#000000', 0.2),
  }
}

function darkSider(primary, siderBg) {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.06),
    text: 'rgba(255, 255, 255, 0.75)',
    textActive: '#ffffff',
    active: '#ffffff',
    activeBg: primary,
    hoverBg: 'rgba(255, 255, 255, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    railBg: mixHex(siderBg, '#000000', 0.25),
  }
}

function softSider(primary, siderBg) {
  return {
    bg: siderBg,
    bgElevated: mixHex(siderBg, '#ffffff', 0.45),
    text: '#64748b',
    textActive: '#0f172a',
    active: primary,
    activeBg: `rgba(${hexToRgbCss(primary)}, 0.12)`,
    hoverBg: 'rgba(15, 23, 42, 0.05)',
    border: mixHex(siderBg, '#000000', 0.1),
    railBg: mixHex(siderBg, '#000000', 0.05),
  }
}

/** 顶栏：相对侧栏只略提亮，色差保持很小 */
function liftHeader(siderBg, whiteMix = 0.14) {
  const bg = mixHex(siderBg, '#ffffff', whiteMix)
  const light = isLightColor(bg)
  return {
    bg,
    text: light ? '#334155' : 'rgba(255, 255, 255, 0.92)',
    border: light ? mixHex(bg, '#000000', 0.08) : 'rgba(255, 255, 255, 0.12)',
  }
}

const appearanceThemes = {
  light: {
    id: 'appearance-light',
    name: '亮色',
    swatches: ['#ffffff', '#f5f5f5'],
    colors: {
      primary: '#409eff',
      sidebar: {
        bg: '#ffffff',
        bgElevated: '#fafafa',
        text: 'rgba(0, 0, 0, 0.65)',
        textActive: 'rgba(0, 0, 0, 0.88)',
        active: '#409eff',
        activeBg: '#ecf5ff',
        hoverBg: 'rgba(0, 0, 0, 0.04)',
        border: '#f0f0f0',
        railBg: '#fafafa',
      },
      header: {
        bg: '#ffffff',
        text: 'rgba(0, 0, 0, 0.88)',
        border: '#f0f0f0',
      },
    },
  },
  dark: {
    id: 'appearance-dark',
    name: '暗色',
    swatches: ['#141414', '#1d1e1f'],
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
      header: liftHeader('#141414', 0.12),
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
    name: '经典蓝',
    swatches: ['#337ecc', mixHex('#337ecc', '#ffffff', 0.14)],
    colors: {
      primary: '#409eff',
      sidebar: brandSider('#337ecc'),
      header: liftHeader('#337ecc'),
    },
  },
  {
    id: 'indigo',
    name: '靛蓝',
    swatches: ['#312e81', mixHex('#312e81', '#ffffff', 0.14)],
    colors: {
      primary: '#4f46e5',
      sidebar: darkSider('#4f46e5', '#312e81'),
      header: liftHeader('#312e81'),
    },
  },
  {
    id: 'teal',
    name: '青绿',
    swatches: ['#115e59', mixHex('#115e59', '#ffffff', 0.14)],
    colors: {
      primary: '#0d9488',
      sidebar: brandSider('#115e59'),
      header: liftHeader('#115e59'),
    },
  },
  {
    id: 'emerald',
    name: '翠绿',
    swatches: ['#14532d', mixHex('#14532d', '#ffffff', 0.14)],
    colors: {
      primary: '#16a34a',
      sidebar: brandSider('#14532d'),
      header: liftHeader('#14532d'),
    },
  },
  {
    id: 'orange',
    name: '日落橙',
    swatches: ['#9a3412', mixHex('#9a3412', '#ffffff', 0.14)],
    colors: {
      primary: '#ea580c',
      sidebar: brandSider('#9a3412'),
      header: liftHeader('#9a3412'),
    },
  },
  {
    id: 'rose',
    name: '玫红',
    swatches: ['#9f1239', mixHex('#9f1239', '#ffffff', 0.14)],
    colors: {
      primary: '#e11d48',
      sidebar: brandSider('#9f1239'),
      header: liftHeader('#9f1239'),
    },
  },
  {
    id: 'slate',
    name: '深空灰',
    swatches: ['#1e293b', mixHex('#1e293b', '#ffffff', 0.14)],
    colors: {
      primary: '#475569',
      sidebar: darkSider('#64748b', '#1e293b'),
      header: liftHeader('#1e293b'),
    },
  },
  {
    id: 'sky',
    name: '晴空',
    swatches: ['#93c5fd', mixHex('#93c5fd', '#ffffff', 0.14)],
    colors: {
      primary: '#2563eb',
      sidebar: softSider('#2563eb', '#93c5fd'),
      header: liftHeader('#93c5fd'),
    },
  },
  {
    id: 'dawn',
    name: '拂晓',
    swatches: ['#cbd5e1', mixHex('#cbd5e1', '#ffffff', 0.14)],
    colors: {
      primary: '#1e4d8c',
      sidebar: softSider('#1e4d8c', '#cbd5e1'),
      header: liftHeader('#cbd5e1'),
    },
  },
]

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
      name: '个性化',
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
  themeToCustomParts,
}
