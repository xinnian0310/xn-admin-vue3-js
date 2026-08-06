import dayjs from 'dayjs'
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DATE_FORMAT = 'YYYY-MM-DD'
const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
function isIsoDateTimeLike(value) {
  return typeof value === 'string' && ISO_DATETIME_RE.test(value.trim())
}
function formatDateTime(value, format = DATETIME_FORMAT) {
  if (value === null || value === void 0 || value === '') return '\u2014'
  const d = dayjs(value)
  return d.isValid() ? d.format(format) : String(value)
}
function formatDate(value, format = DATE_FORMAT) {
  return formatDateTime(value, format)
}
function normalizeDateTimes(input) {
  if (input === null || input === void 0) return input
  if (typeof input === 'string') {
    return isIsoDateTimeLike(input) ? formatDateTime(input) : input
  }
  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i += 1) {
      input[i] = normalizeDateTimes(input[i])
    }
    return input
  }
  if (typeof input === 'object') {
    const obj = input
    for (const key of Object.keys(obj)) {
      const value = obj[key]
      if (isIsoDateTimeLike(value)) {
        obj[key] = formatDateTime(value)
      } else if (value && typeof value === 'object') {
        normalizeDateTimes(value)
      }
    }
  }
  return input
}
export {
  DATETIME_FORMAT,
  DATE_FORMAT,
  formatDate,
  formatDateTime,
  isIsoDateTimeLike,
  normalizeDateTimes,
}
