<template>
  <div class="xn-table">
    <div ref="bodyRef" class="xn-table__body">
      <el-table
        v-loading="displayLoading"
        v-bind="$attrs"
        :data="displayData"
        :height="tableHeight"
        @selection-change="onSelectionChange"
      >
        <template v-for="col in visibleColumns" :key="columnKey(col)">
          <el-table-column
            v-if="col.type === 'selection'"
            type="selection"
            :width="col.width ?? 50"
            :fixed="col.fixed"
            :align="col.align"
            :class-name="col.className"
          />

          <el-table-column
            v-else-if="col.type === 'index'"
            type="index"
            :label="col.label"
            :width="col.width ?? 60"
            :fixed="col.fixed"
            :align="col.align ?? 'center'"
            :index="col.index"
            :class-name="col.className"
          />

          <el-table-column
            v-else-if="col.type === 'slot'"
            :prop="col.prop"
            :label="col.label"
            :width="resolveColumnWidth(col)"
            :min-width="resolveColumnMinWidth(col)"
            :fixed="col.fixed"
            :align="resolveColumnAlign(col)"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip"
            :class-name="resolveColumnClassName(col)"
          >
            <template #default="scope">
              <slot :name="resolveSlotName(col)" v-bind="scope" />
            </template>
          </el-table-column>

          <el-table-column
            v-else-if="col.type === 'iconText'"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip"
            :class-name="col.className"
          >
            <template #default="{ row }">
              <span class="xn-table__icon-text">
                <xnAppIcon v-if="resolveIconName(row, col)" :name="resolveIconName(row, col)" />
                <span>{{ formatText(row, col) }}</span>
              </span>
            </template>
          </el-table-column>

          <el-table-column
            v-else-if="col.type === 'longText'"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align"
            :sortable="col.sortable"
            :class-name="col.className"
          >
            <template #default="{ row }">
              <xnLongText
                :text="formatLongTextRaw(row, col)"
                :title="col.label || '详细内容'"
                :empty-text="emptyOf(col)"
                :max-length="col.longTextMaxLength ?? 48"
              />
            </template>
          </el-table-column>

          <el-table-column
            v-else-if="col.type === 'tag'"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align"
            :sortable="col.sortable"
            :class-name="col.className"
          >
            <template #default="{ row }">
              <el-tag v-if="resolveOption(row, col)" :type="resolveOption(row, col)?.type">
                {{ resolveOption(row, col)?.label }}
              </el-tag>
              <span v-else>{{ emptyOf(col) }}</span>
            </template>
          </el-table-column>

          <el-table-column
            v-else-if="col.type === 'switch'"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align"
            :class-name="col.className"
          >
            <template #default="{ row }">
              <el-switch
                :model-value="getCellValue(row, col.prop)"
                :active-value="col.activeValue ?? 1"
                :inactive-value="col.inactiveValue ?? 0"
                :disabled="isSwitchDisabled(row, col)"
                @change="(val) => emitSwitchChange(row, col, val)"
              />
            </template>
          </el-table-column>

          <el-table-column
            v-else
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :min-width="col.minWidth"
            :fixed="col.fixed"
            :align="col.align"
            :sortable="col.sortable"
            :show-overflow-tooltip="col.showOverflowTooltip"
            :class-name="col.className"
          >
            <template #default="{ row }">
              {{ formatText(row, col) }}
            </template>
          </el-table-column>
        </template>

        <slot />
      </el-table>
    </div>

    <div v-if="showPagination" class="xn-table__pagination">
      <div class="xn-table__pagination-main">
        <slot name="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="currentPageSize"
            :total="displayTotal"
            :page-sizes="resolvedPageSizes"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handlePageChange"
            @current-change="handlePageChange"
          />
        </slot>
      </div>
      <div class="xn-table__pagination-actions">
        <el-tooltip content="刷新" placement="top">
          <el-button :icon="Refresh" circle @click="handleRefresh" />
        </el-tooltip>
        <el-tooltip v-if="tableKey" content="列设置" placement="top">
          <el-button :icon="Setting" circle @click="openColumnSetting" />
        </el-tooltip>
      </div>
    </div>

    <xnColumnSettingDialog
      v-if="tableKey"
      v-model="columnSettingVisible"
      :columns="settingRows"
      :saving="columnSaving"
      @save="handleSaveColumns"
      @reset="handleResetColumns"
    />

    <component
      :is="saveComponent"
      v-if="saveComponent"
      ref="saveRef"
      @success="handleSaveSuccess"
    />
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Setting } from '@element-plus/icons-vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import xnLongText from '@/components/xnLongText/xnLongText.vue'
import xnColumnSettingDialog from '@/components/xnTable/xnColumnSettingDialog.vue'
import { getTableColumns, saveTableColumns } from '@/api/table-column'
import { CRUD_API_KEY } from '@/composables/useCrudApi'
import { loadCrudApi } from '@/utils/api-loader'
import { formatDateTime, isIsoDateTimeLike } from '@/utils/datetime'
import { estimateTableActionsWidth } from '@/utils/table-actions'
import { usePermission } from '@/directives/permission'
defineOptions({ name: 'xnTable', inheritAttrs: false })
const props = defineProps({
  data: { required: false },
  columns: { type: Array, required: false, default: () => [] },
  loading: { type: Boolean, required: false, default: false },
  tableHeight: { type: String, required: false, default: '100%' },
  showPagination: { type: Boolean, required: false, default: true },
  page: { type: Number, required: false, default: 1 },
  pageSize: { type: Number, required: false, default: 10 },
  total: { type: Number, required: false, default: 0 },
  pageSizes: { type: Array, required: false, default: () => [10, 20, 50, 100] },
  api: { required: false },
  queryParams: { type: Object, required: false, default: () => ({}) },
  listFilter: { required: false },
  saveComponent: { required: false },
  entityName: { type: String, required: false, default: '数据' },
  nameField: { type: String, required: false, default: 'title' },
  idField: { type: String, required: false, default: 'id' },
  deleteCheck: { required: false },
  immediate: { type: Boolean, required: false, default: true },
  tableKey: { required: false },
  actionItems: { type: Array, required: false, default: () => [] },
  autoPageSize: { type: Boolean, required: false, default: true },
  autoPageSizeMin: { type: Number, required: false, default: 5 },
  autoPageSizeMax: { type: Number, required: false, default: 200 },
})
const emit = defineEmits([
  'update:page',
  'update:pageSize',
  'page-change',
  'selection-change',
  'switch-change',
  'data-change',
  'success',
])
const selected = ref([])
const saveRef = ref()
const crudApi = shallowRef(null)
const { hasPermission } = usePermission()
const visibleActionItems = computed(() =>
  (props.actionItems ?? []).filter((item) => !item.permission || hasPermission(item.permission)),
)
/** api 模式内部状态 */
const innerLoading = ref(false)
const innerAllData = ref([])
const innerRecords = ref([])
const innerTotal = ref(0)
/** list 返回分页对象时走服务端分页；返回数组时走前端分页 */
const serverPaging = ref(false)
const isApiMode = computed(() => Boolean(props.api))
const isDataMode = computed(() => props.data !== undefined)
function assertMode() {
  if (isApiMode.value && isDataMode.value) {
    throw new Error('[xnTable] api 与 data 只能传其中一个')
  }
  if (!isApiMode.value && !isDataMode.value) {
    throw new Error('[xnTable] 必须传 api 或 data 其中一个')
  }
}
watch(
  () => [props.api, props.data],
  () => {
    assertMode()
    crudApi.value = props.api ? loadCrudApi(props.api) : null
  },
  { immediate: true },
)
provide(CRUD_API_KEY, crudApi)
/** 后端保存的列偏好 */
const savedColumnSettings = ref([])
const columnSettingVisible = ref(false)
const columnSaving = ref(false)
function columnIdentity(col) {
  if (col.prop) return col.prop
  if (col.slot) return `slot:${col.slot}`
  if (col.type) return `type:${col.type}`
  return `label:${col.label ?? ''}`
}
function toSettingRow(col, index) {
  const widthNum = col.width == null || col.width === '' ? undefined : Number(col.width)
  const locked = col.type === 'selection'
  return {
    key: columnIdentity(col),
    prop: col.prop,
    label: locked ? '选择框' : col.label,
    width: Number.isFinite(widthNum) ? widthNum : undefined,
    visible: col.visible !== false,
    sort: index,
    locked,
  }
}
function applyColumnSettings(defaults, settings) {
  if (!settings.length) {
    return defaults.map((col) => ({ ...col }))
  }
  const defaultMap = new Map(defaults.map((col) => [columnIdentity(col), col]))
  const used = new Set()
  const result = []
  const sorted = [...settings].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  for (const setting of sorted) {
    const base = defaultMap.get(setting.key)
    if (!base) continue
    used.add(setting.key)
    result.push({
      ...base,
      label: base.type === 'selection' ? '选择框' : (setting.label ?? base.label),
      width: setting.width ?? base.width,
      visible: setting.visible !== false,
    })
  }
  for (const col of defaults) {
    const key = columnIdentity(col)
    if (!used.has(key)) {
      result.push({ ...col })
    }
  }
  return result
}
const resolvedColumns = computed(() =>
  applyColumnSettings(props.columns ?? [], savedColumnSettings.value),
)
const visibleColumns = computed(() => resolvedColumns.value.filter((col) => col.visible !== false))
const settingRows = computed(() =>
  resolvedColumns.value.map((col, index) => toSettingRow(col, index)),
)
const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val),
})
const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val),
})
const bodyRef = ref(null)
const fittedPageSize = ref(0)
/** 首次自动算高完成前不因尺寸变更触发翻页重载，避免与父级 onMounted 重复请求 */
let autoPageSizeReady = false
let resizeObserver = null
let resizeTimer
const DEFAULT_HEADER_HEIGHT = 40
const DEFAULT_ROW_HEIGHT = 48
const resolvedPageSizes = computed(() => {
  const set = new Set(props.pageSizes)
  if (props.autoPageSize && fittedPageSize.value > 0) {
    set.add(fittedPageSize.value)
  }
  return [...set].sort((a, b) => a - b)
})
function measureRowMetrics(bodyEl) {
  const header = bodyEl.querySelector('.el-table__header-wrapper')
  const row = bodyEl.querySelector('.el-table__body tr.el-table__row')
  return {
    headerH: header?.offsetHeight || DEFAULT_HEADER_HEIGHT,
    rowH: row?.offsetHeight || DEFAULT_ROW_HEIGHT,
  }
}
function calcFittedPageSize(bodyEl) {
  const bodyH = bodyEl.clientHeight
  if (bodyH <= 0) return props.autoPageSizeMin
  const { headerH, rowH } = measureRowMetrics(bodyEl)
  const usable = bodyH - headerH
  if (usable <= 0 || rowH <= 0) return props.autoPageSizeMin
  const raw = Math.floor(usable / rowH)
  return Math.min(props.autoPageSizeMax, Math.max(props.autoPageSizeMin, raw))
}
function applyFittedPageSize(next, opts) {
  fittedPageSize.value = next
  const sizeChanged = next !== props.pageSize
  if (sizeChanged) {
    emit('update:pageSize', next)
  }
  if (sizeChanged && props.page !== 1) {
    emit('update:page', 1)
  }
  if (opts?.emitReload && sizeChanged) {
    nextTick(() => {
      emit('page-change')
      if (isApiMode.value && serverPaging.value) {
        loadData()
      }
    })
  }
}
function updateAutoPageSize(opts) {
  if (!props.autoPageSize) return
  const el = bodyRef.value
  if (!el) return
  const next = calcFittedPageSize(el)
  applyFittedPageSize(next, opts)
}
function setupAutoPageSizeObserver() {
  const el = bodyRef.value
  if (!el || typeof ResizeObserver === 'undefined') return
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(() => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      updateAutoPageSize({ emitReload: autoPageSizeReady })
    }, 80)
  })
  resizeObserver.observe(el)
}
const filteredAllData = computed(() => {
  const rows = innerAllData.value
  return props.listFilter ? props.listFilter(rows) : rows
})
const displayData = computed(() => {
  if (isDataMode.value) return props.data ?? []
  if (serverPaging.value) return innerRecords.value
  const start = (currentPage.value - 1) * currentPageSize.value
  return filteredAllData.value.slice(start, start + currentPageSize.value)
})
const displayTotal = computed(() => {
  if (isDataMode.value) return props.total
  if (serverPaging.value) return innerTotal.value
  return filteredAllData.value.length
})
const displayLoading = computed(() => (isApiMode.value ? innerLoading.value : props.loading))
function isPageResult(payload) {
  return (
    !!payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.records) &&
    typeof payload.total === 'number'
  )
}
/** api 模式：请求列表 */
async function loadData(extraParams) {
  assertMode()
  if (!isApiMode.value) return
  const api = requireApi()
  innerLoading.value = true
  selected.value = []
  emit('selection-change', [])
  try {
    const params = sanitizeParams({
      ...props.queryParams,
      ...extraParams,
      page: currentPage.value - 1,
      size: currentPageSize.value,
    })
    const res = await api.list(params)
    const payload = res.data
    if (isPageResult(payload)) {
      serverPaging.value = true
      innerRecords.value = payload.records
      innerTotal.value = payload.total
      innerAllData.value = []
    } else if (Array.isArray(payload)) {
      serverPaging.value = false
      innerAllData.value = payload
      innerRecords.value = []
      innerTotal.value = payload.length
    } else {
      serverPaging.value = false
      innerAllData.value = []
      innerRecords.value = []
      innerTotal.value = 0
    }
  } finally {
    innerLoading.value = false
  }
}
/** 去掉空值，避免把空字符串传给后端导致绑定失败 */
function sanitizeParams(raw) {
  const result = {}
  for (const [key, value] of Object.entries(raw)) {
    if (value === '' || value === undefined || value === null) continue
    if (Array.isArray(value) && value.length === 0) continue
    result[key] = value
  }
  return result
}
function handlePageChange() {
  emit('page-change')
  if (isApiMode.value && serverPaging.value) {
    loadData()
  }
}
function onSelectionChange(rows) {
  selected.value = rows
  emit('selection-change', rows)
}
function requireApi() {
  if (!crudApi.value) {
    throw new Error('[xnTable] 当前为 data 模式或未配置 api，无法调用接口方法')
  }
  return crudApi.value
}
function rowId(row) {
  return Number(row[props.idField])
}
function rowName(row) {
  const name = row[props.nameField]
  return name == null || name === '' ? `#${rowId(row)}` : String(name)
}
function ensureSingleSelected() {
  if (selected.value.length !== 1) {
    ElMessage.warning('请选择一项操作')
    return null
  }
  return selected.value[0]
}
function openSave(mode, id, options) {
  if (!props.saveComponent) {
    ElMessage.warning('未配置 saveComponent，无法打开表单')
    return
  }
  if (!isApiMode.value) {
    ElMessage.warning('data 模式下请自行处理表单接口，或改用 api 模式')
    return
  }
  saveRef.value?.open(mode, id, options)
}
async function handleDelete(row) {
  const targets = row != null ? [row] : selected.value
  if (!targets.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  for (const target of targets) {
    if (!props.deleteCheck) continue
    const check = props.deleteCheck(target)
    if (check === false) {
      ElMessage.warning(`${props.entityName}不可删除：${rowName(target)}`)
      return
    }
    if (typeof check === 'string') {
      ElMessage.warning(check)
      return
    }
  }
  const api = requireApi()
  const message =
    targets.length === 1
      ? `确定删除${props.entityName}「${rowName(targets[0])}」吗？`
      : `确定删除选中的 ${targets.length} 条${props.entityName}吗？`
  await ElMessageBox.confirm(message, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  const ids = targets.map((t) => rowId(t))
  if (ids.length > 1 && typeof api.batchRemove === 'function') {
    await api.batchRemove(ids)
  } else if (ids.length > 1) {
    for (const id of ids) {
      await api.remove(id)
    }
  } else {
    await api.remove(ids[0])
  }
  ElMessage.success('删除成功')
  emit('success')
  if (isApiMode.value) await loadData()
}
function handleAction(action) {
  if (action === 'add') {
    openSave('add')
    return
  }
  if (action === 'edit' || action === 'view') {
    const row = ensureSingleSelected()
    if (!row) return
    openSave(action, rowId(row))
    return
  }
  if (action === 'delete') {
    handleDelete()
  }
}
async function handleSaveSuccess() {
  emit('success')
  if (isApiMode.value) await loadData()
}
watch(
  [displayData, displayTotal, displayLoading],
  () => {
    emit('data-change', {
      records: displayData.value,
      total: displayTotal.value,
      loading: displayLoading.value,
    })
  },
  { immediate: true },
)
watch(
  () => props.queryParams,
  () => {
    if (!isApiMode.value) return
    if (currentPage.value !== 1) {
      currentPage.value = 1
    }
  },
  { deep: true },
)
/** 有真实数据行后仅用实测行高校正一次，避免滚动条显隐导致条数震荡 */
let didRefineByRealRow = false
watch(
  () => displayData.value.length,
  async (len) => {
    if (!props.autoPageSize || !autoPageSizeReady || didRefineByRealRow || len <= 0) return
    didRefineByRealRow = true
    await nextTick()
    updateAutoPageSize({ emitReload: true })
  },
)
onMounted(async () => {
  if (props.tableKey) {
    await loadColumnSettings()
  }
  // 先按高度写入 pageSize，再拉数，避免首屏用 10 条造成留白
  await nextTick()
  updateAutoPageSize({ emitReload: false })
  await nextTick()
  setupAutoPageSizeObserver()
  autoPageSizeReady = true
  if (isApiMode.value && props.immediate) {
    loadData()
  }
})
onBeforeUnmount(() => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeObserver?.disconnect()
  resizeObserver = null
})
async function loadColumnSettings() {
  if (!props.tableKey) return
  try {
    const res = await getTableColumns(props.tableKey)
    savedColumnSettings.value = res.data.columns ?? []
  } catch {
    savedColumnSettings.value = []
  }
}
function handleRefresh() {
  if (isApiMode.value) {
    loadData()
    return
  }
  emit('page-change')
}
function openColumnSetting() {
  if (!props.tableKey) {
    ElMessage.warning('未配置 tableKey，无法使用列设置')
    return
  }
  columnSettingVisible.value = true
}
async function handleSaveColumns(columns) {
  if (!props.tableKey) return
  columnSaving.value = true
  try {
    const res = await saveTableColumns({
      tableKey: props.tableKey,
      columns,
    })
    savedColumnSettings.value = res.data.columns ?? columns
    columnSettingVisible.value = false
    ElMessage.success('列设置已保存')
  } finally {
    columnSaving.value = false
  }
}
async function handleResetColumns() {
  if (!props.tableKey) return
  const defaults = (props.columns ?? []).map((col, index) => toSettingRow(col, index))
  columnSaving.value = true
  try {
    const res = await saveTableColumns({
      tableKey: props.tableKey,
      columns: defaults,
    })
    savedColumnSettings.value = res.data.columns ?? defaults
    columnSettingVisible.value = false
    ElMessage.success('已恢复默认列设置')
  } finally {
    columnSaving.value = false
  }
}
function columnKey(col) {
  return `${col.type ?? 'text'}-${col.prop ?? ''}-${col.slot ?? ''}-${col.label ?? ''}`
}
function resolveSlotName(col) {
  return col.slot || col.prop || 'default'
}
/** 操作列：按全部按钮估算宽度，避免换行 */
function isActionsColumn(col) {
  return col.slot === 'actions' || col.label === '操作'
}
const actionsColumnWidth = computed(() => estimateTableActionsWidth(visibleActionItems.value))
function resolveColumnWidth(col) {
  // 操作列优先按全部按钮估算，避免列设置里过窄宽度导致换行
  if (isActionsColumn(col) && visibleActionItems.value.length) {
    return actionsColumnWidth.value
  }
  if (col.width != null && col.width !== '') return col.width
  return undefined
}
function resolveColumnMinWidth(col) {
  if (isActionsColumn(col) && visibleActionItems.value.length) {
    return actionsColumnWidth.value
  }
  if (col.minWidth != null && col.minWidth !== '') return col.minWidth
  if (isActionsColumn(col)) return 100
  return undefined
}
function resolveColumnClassName(col) {
  const parts = [col.className, isActionsColumn(col) ? 'xn-table-col-actions' : ''].filter(Boolean)
  return parts.join(' ') || undefined
}
function resolveColumnAlign(col) {
  if (col.align) return col.align
  // 操作列默认居中
  if (isActionsColumn(col)) return 'center'
  return undefined
}
function emptyOf(col) {
  return col.emptyText ?? '—'
}
function getCellValue(row, prop) {
  if (!row || typeof row !== 'object' || !prop) return undefined
  return row[prop]
}
function resolveOption(row, col) {
  if (!col.options?.length) return undefined
  const raw = getCellValue(row, col.prop)
  return col.options.find((opt) => String(opt.value) === String(raw))
}
function resolveIconName(row, col) {
  const name = getCellValue(row, col.iconProp ?? 'icon')
  return typeof name === 'string' && name ? name : undefined
}
function formatText(row, col) {
  const mapped = resolveOption(row, col)
  if (mapped) return `${col.prefix ?? ''}${mapped.label}${col.suffix ?? ''}`
  const raw = getCellValue(row, col.prop)
  if (raw === null || raw === undefined || raw === '') {
    return emptyOf(col)
  }
  if (col.type === 'datetime' || isIsoDateTimeLike(raw)) {
    return `${col.prefix ?? ''}${formatDateTime(raw)}${col.suffix ?? ''}`
  }
  return `${col.prefix ?? ''}${String(raw)}${col.suffix ?? ''}`
}
/** longText 列传给弹窗组件的原始字符串（空则交给 emptyText） */
function formatLongTextRaw(row, col) {
  const raw = getCellValue(row, col.prop)
  if (raw === null || raw === undefined || raw === '') return ''
  return String(raw)
}
function isSwitchDisabled(row, col) {
  if (!col.disabledProp) return false
  return Boolean(getCellValue(row, col.disabledProp))
}
function emitSwitchChange(row, col, value) {
  if (!col.prop || !row || typeof row !== 'object') return
  emit('switch-change', {
    row: row,
    prop: col.prop,
    value,
  })
}
defineExpose({
  openSave,
  handleDelete,
  handleAction,
  loadData,
  selected,
  displayData,
  displayTotal,
  displayLoading,
  getApi: () => crudApi.value,
})
</script>

<style scoped>
.xn-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.xn-table__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.xn-table__body :deep(.el-table) {
  height: 100% !important;
}

/* 操作列：单行展示、居中，宽度由全部按钮估算 */
.xn-table__body :deep(.xn-table-col-actions .cell) {
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.xn-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 16px;
  flex-shrink: 0;
  background: var(--app-card-bg, #fff);
  border-top: 1px solid var(--app-border-color);
}

.xn-table__pagination-main {
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-start;
}

.xn-table__pagination-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.xn-table__icon-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
