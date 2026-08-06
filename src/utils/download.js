async function downloadWithAuth(url, filename) {
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) {
    let message = `\u5BFC\u51FA\u5931\u8D25\uFF08${res.status}\uFF09`
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      // response body may not be JSON
    }
    throw new Error(message)
  }
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(objectUrl)
}
function buildQueryString(params) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0 || value === null || value === '') continue
    qs.set(key, String(value))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}
function rangeToBeginEnd(range) {
  if (!Array.isArray(range) || range.length < 2) return {}
  const begin = String(range[0] ?? '').trim()
  const end = String(range[1] ?? '').trim()
  return {
    beginTime: begin ? `${begin}T00:00:00` : void 0,
    endTime: end ? `${end}T23:59:59` : void 0,
  }
}
export { buildQueryString, downloadWithAuth, rangeToBeginEnd }
