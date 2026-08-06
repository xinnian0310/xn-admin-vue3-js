function getFullscreenElement() {
  const doc = document
  return (
    document.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement ||
    null
  )
}
function isBrowserFullscreen() {
  return !!getFullscreenElement()
}
function isFullscreenEnabled() {
  const doc = document
  return !!(
    document.fullscreenEnabled ||
    doc.webkitFullscreenEnabled ||
    doc.mozFullScreenEnabled ||
    doc.msFullscreenEnabled
  )
}
function toggleBrowserFullscreen(target = document.documentElement) {
  if (isBrowserFullscreen()) {
    const doc = document
    const exit =
      document.exitFullscreen?.bind(document) ||
      doc.webkitExitFullscreen?.bind(doc) ||
      doc.mozCancelFullScreen?.bind(doc) ||
      doc.msExitFullscreen?.bind(doc)
    if (!exit) return Promise.reject(new Error('\u4E0D\u652F\u6301\u9000\u51FA\u5168\u5C4F'))
    return Promise.resolve(exit()).then(() => void 0)
  }
  const el = target
  const req =
    el.requestFullscreen?.bind(el) ||
    el.webkitRequestFullscreen?.bind(el) ||
    el.mozRequestFullScreen?.bind(el) ||
    el.msRequestFullscreen?.bind(el)
  if (!req) return Promise.reject(new Error('\u4E0D\u652F\u6301\u8FDB\u5165\u5168\u5C4F'))
  return Promise.resolve(req()).then(() => void 0)
}
const EVENTS = [
  'fullscreenchange',
  'webkitfullscreenchange',
  'mozfullscreenchange',
  'MSFullscreenChange',
]
function onBrowserFullscreenChange(handler) {
  for (const evt of EVENTS) {
    document.addEventListener(evt, handler)
  }
  return () => {
    for (const evt of EVENTS) {
      document.removeEventListener(evt, handler)
    }
  }
}
export {
  getFullscreenElement,
  isBrowserFullscreen,
  isFullscreenEnabled,
  onBrowserFullscreenChange,
  toggleBrowserFullscreen,
}
