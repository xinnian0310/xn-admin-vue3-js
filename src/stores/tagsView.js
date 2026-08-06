import { defineStore } from 'pinia'
import { getAffixTags } from '@/utils/menu'
import { useMenuStore } from '@/stores/menu'
const STORAGE_KEY = 'xn-tags-view'
const MAX_CACHE = 10
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
function saveToStorage(views) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(views))
}
function buildAffixTags() {
  const menuStore = useMenuStore()
  return getAffixTags(menuStore.menus).map((item) => ({
    path: item.path,
    title: item.title,
    affix: true,
  }))
}
function pruneCachedViews(state) {
  const keep = new Set(state.visitedViews.map((v) => v.name).filter((n) => !!n))
  state.cachedViews = state.cachedViews.filter((name) => keep.has(name))
}
const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: loadFromStorage(),
    cachedViews: [],
    /** 内容区全屏（隐藏侧栏 / 顶栏 / 标签栏） */
    isFullscreen: false,
  }),
  actions: {
    initTags() {
      const affixTags = buildAffixTags()
      for (const tag of affixTags) {
        if (!this.visitedViews.some((v) => v.path === tag.path)) {
          this.visitedViews.unshift(tag)
        }
      }
      saveToStorage(this.visitedViews)
    },
    addView(route) {
      if (route.meta.public || !route.meta.title) return
      const tag = {
        path: route.path,
        name: route.name,
        title: route.meta.title,
        affix: route.meta.affix,
      }
      if (!this.visitedViews.some((v) => v.path === tag.path)) {
        this.visitedViews.push(tag)
        saveToStorage(this.visitedViews)
      }
      if (route.name && !route.meta.noCache) {
        this.addCachedView(route.name)
      }
    },
    addCachedView(name) {
      if (this.cachedViews.includes(name)) return
      this.cachedViews.push(name)
      if (this.cachedViews.length > MAX_CACHE) {
        this.cachedViews.shift()
      }
    },
    delCachedView(name) {
      if (!name) return
      const idx = this.cachedViews.indexOf(name)
      if (idx > -1) this.cachedViews.splice(idx, 1)
    },
    delView(tag) {
      if (tag.affix) return
      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index === -1) return
      this.visitedViews.splice(index, 1)
      saveToStorage(this.visitedViews)
      if (tag.name) {
        this.delCachedView(tag.name)
      }
    },
    delLeftViews(tag) {
      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index <= 0) return
      this.visitedViews = this.visitedViews.filter((v, i) => i >= index || v.affix)
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },
    delRightViews(tag) {
      const index = this.visitedViews.findIndex((v) => v.path === tag.path)
      if (index === -1) return
      this.visitedViews = this.visitedViews.filter((v, i) => i <= index || v.affix)
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },
    delOthersViews(tag) {
      this.visitedViews = this.visitedViews.filter((v) => v.affix || v.path === tag.path)
      pruneCachedViews(this)
      saveToStorage(this.visitedViews)
    },
    delAllViews() {
      this.visitedViews = this.visitedViews.filter((v) => v.affix)
      this.cachedViews = []
      saveToStorage(this.visitedViews)
    },
    /** 退出/重新登录：清空标签、缓存与全屏状态 */
    resetViews() {
      this.visitedViews = []
      this.cachedViews = []
      this.isFullscreen = false
      localStorage.removeItem(STORAGE_KEY)
    },
    setFullscreen(value) {
      this.isFullscreen = value
    },
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
    },
  },
})
export { useTagsViewStore }
