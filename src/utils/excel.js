import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs/dist/exceljs.min.js'
function headerTitle(col) {
  return col.required ? `${col.title}*` : col.title
}
function resolveOptionValue(raw, options) {
  if (!raw || !options?.length) return raw
  const text = raw.trim()
  if (!text) return ''
  const parts = text
    .split(/[,，;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts
    .map((part) => {
      const byLabel = options.find((o) => o.label === part)
      if (byLabel) return byLabel.value
      const byValue = options.find((o) => o.value === part)
      if (byValue) return byValue.value
      return part
    })
    .join(',')
}
function isExampleRow(row, columns) {
  return columns.every((c) => {
    const cell = row[c.key] ?? ''
    const rawExample = c.example ?? ''
    const mappedExample = resolveOptionValue(rawExample, c.options)
    return cell === rawExample || cell === mappedExample
  })
}
async function downloadExcelTemplate(columns, fileName) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = '\u5FC3\u5FF5\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF'
  const sheet = workbook.addWorksheet('\u5BFC\u5165\u6A21\u677F', {
    views: [{ state: 'frozen', ySplit: 1 }],
  })
  sheet.addRow(columns.map(headerTitle))
  sheet.addRow(columns.map((c) => c.example ?? ''))
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF409EFF' },
  }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 24
  columns.forEach((col, index) => {
    const colIndex = index + 1
    sheet.getColumn(colIndex).width = col.width ?? Math.max(14, col.title.length + 4)
    if (!col.options?.length) return
    const listName = `_opts_${col.key}`.slice(0, 31)
    let listSheet = workbook.getWorksheet(listName)
    if (!listSheet) {
      listSheet = workbook.addWorksheet(listName, { state: 'hidden' })
      col.options.forEach((opt, i) => {
        listSheet.getCell(i + 1, 1).value = opt.label
      })
    }
    const lastRow = Math.max(col.options.length, 1)
    const formulae = [`'${listName}'!$A$1:$A$${lastRow}`]
    for (let r = 2; r <= 2001; r++) {
      sheet.getCell(r, colIndex).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae,
        showErrorMessage: true,
        errorTitle: '\u65E0\u6548\u9009\u9879',
        error: `\u8BF7\u4ECE\u4E0B\u62C9\u5217\u8868\u4E2D\u9009\u62E9\u300C${col.title}\u300D`,
        showInputMessage: true,
        promptTitle: col.title,
        prompt: `\u8BF7\u9009\u62E9${col.title}`,
      }
    }
  })
  const tipSheet = workbook.addWorksheet('\u586B\u5199\u8BF4\u660E')
  tipSheet.getColumn(1).width = 18
  tipSheet.getColumn(2).width = 56
  tipSheet.addRow(['\u8BF4\u660E', '\u5185\u5BB9'])
  tipSheet.getRow(1).font = { bold: true }
  tipSheet.addRow(['\u5E26 * \u5217', '\u5FC5\u586B'])
  tipSheet.addRow([
    '\u89D2\u8272 / \u5355\u4F4D / \u72B6\u6001',
    '\u8BF7\u7528\u5355\u5143\u683C\u4E0B\u62C9\u9009\u62E9\u4E2D\u6587\u540D\u79F0',
  ])
  tipSheet.addRow([
    '\u591A\u4E2A\u89D2\u8272',
    '\u53EF\u5728\u5355\u5143\u683C\u5185\u7528\u4E2D\u6587\u9017\u53F7\u5206\u9694\u591A\u4E2A\u89D2\u8272\u540D\u79F0',
  ])
  tipSheet.addRow([
    '\u5BC6\u7801\u4E3A\u7A7A',
    '\u5BFC\u5165\u65F6\u4F7F\u7528\u9ED8\u8BA4\u5BC6\u7801 User123456',
  ])
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const name = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
async function exportRowsToExcel(rows, columns, fileName) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = '\u5FC3\u5FF5\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF'
  const sheet = workbook.addWorksheet('\u6570\u636E')
  sheet.addRow(columns.map((c) => c.title))
  const headerRow = sheet.getRow(1)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF409EFF' } }
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' }
  headerRow.height = 24
  columns.forEach((col, index) => {
    sheet.getColumn(index + 1).width = col.width ?? Math.max(14, col.title.length + 4)
  })
  rows.forEach((row) => {
    sheet.addRow(columns.map((c) => row[c.key] ?? ''))
  })
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const name = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
function parseExcelFile(file, columns) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result)
        const book = XLSX.read(data, { type: 'array' })
        const sheetName =
          book.SheetNames.find((n) => n === '\u5BFC\u5165\u6A21\u677F') || book.SheetNames[0]
        if (!sheetName) {
          reject(new Error('Excel \u4E2D\u6CA1\u6709\u5DE5\u4F5C\u8868'))
          return
        }
        const sheet = book.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          defval: '',
          raw: false,
        })
        const titleToKey = /* @__PURE__ */ new Map()
        for (const col of columns) {
          titleToKey.set(col.title, col.key)
          titleToKey.set(`${col.title}*`, col.key)
        }
        const mapped = rawRows.map((row) => {
          const item = {}
          for (const [header, value] of Object.entries(row)) {
            const key = titleToKey.get(String(header).trim())
            if (key) {
              item[key] = value == null ? '' : String(value).trim()
            }
          }
          return item
        })
        resolve(
          mapped.filter((row) => {
            const hasAny = columns.some((c) => !!row[c.key])
            return hasAny && !isExampleRow(row, columns)
          }),
        )
      } catch (err) {
        reject(err instanceof Error ? err : new Error('\u89E3\u6790 Excel \u5931\u8D25'))
      }
    }
    reader.onerror = () => reject(new Error('\u8BFB\u53D6\u6587\u4EF6\u5931\u8D25'))
    reader.readAsArrayBuffer(file)
  })
}
function mapImportRows(rows, columns) {
  return rows.map((row) => {
    const next = { ...row }
    for (const col of columns) {
      if (col.options?.length && next[col.key] != null) {
        next[col.key] = resolveOptionValue(next[col.key], col.options)
      }
    }
    return next
  })
}
function validateImportRows(rows, columns) {
  const required = columns.filter((c) => c.required)
  for (let i = 0; i < rows.length; i++) {
    for (const col of required) {
      if (!rows[i][col.key]) {
        return `\u7B2C ${i + 2} \u884C\u300C${col.title}\u300D\u4E0D\u80FD\u4E3A\u7A7A`
      }
    }
  }
  return null
}
export {
  downloadExcelTemplate,
  exportRowsToExcel,
  mapImportRows,
  parseExcelFile,
  resolveOptionValue,
  validateImportRows,
}
