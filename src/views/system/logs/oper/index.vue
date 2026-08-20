<template>
  <xnPageLayout v-model:page="page" v-model:page-size="size" :total="total" @page-change="loadData">
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>
    <template #toolbar>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>
    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:logs:oper"
        entity-name="操作日志"
        name-field="title"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #businessType="{ row }">
          {{ businessTypeLabel(row.businessType) }}
        </template>
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '成功' : '失败' }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog v-model="detailVisible" title="操作日志详情" width="720px" destroy-on-close>
    <el-descriptions v-if="current" :column="1" border>
      <el-descriptions-item label="模块">{{ current.title }}</el-descriptions-item>
      <el-descriptions-item label="业务类型">{{
        businessTypeLabel(current.businessType)
      }}</el-descriptions-item>
      <el-descriptions-item label="操作人">{{ current.operatorName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="请求">
        {{ current.requestMethod || '—' }} {{ current.requestUrl || '' }}
      </el-descriptions-item>
      <el-descriptions-item label="方法">{{ current.method || '—' }}</el-descriptions-item>
      <el-descriptions-item label="IP">{{ current.ip || '—' }}</el-descriptions-item>
      <el-descriptions-item label="耗时(ms)">{{ current.costTime ?? '—' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        {{ current.status === 1 ? '成功' : '失败' }}
      </el-descriptions-item>
      <el-descriptions-item label="时间">{{ current.operTime }}</el-descriptions-item>
      <el-descriptions-item label="参数">
        <pre class="log-pre">{{ current.params || '—' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item v-if="current.errorMsg" label="错误">
        <pre class="log-pre">{{ current.errorMsg }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import { batchRemove, clean, exportOperLogs, get, list, remove } from '@/api/oper-log'
import { rangeToBeginEnd } from '@/utils/download'

defineOptions({ name: 'SystemOperLogs' })

const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/logs/oper')

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const detailVisible = ref(false)
const current = ref(null)

const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'title', label: '模块', minWidth: 140 },
  { type: 'slot', slot: 'businessType', prop: 'businessType', label: '业务类型', width: 100 },
  { prop: 'operatorName', label: '操作人', minWidth: 110 },
  { prop: 'requestUrl', label: 'URL', minWidth: 180, showOverflowTooltip: true },
  { type: 'slot', slot: 'status', prop: 'status', label: '状态', width: 90 },
  { prop: 'costTime', label: '耗时(ms)', width: 100 },
  { prop: 'ip', label: 'IP', minWidth: 120 },
  { prop: 'operTime', label: '操作时间', minWidth: 170, type: 'datetime' },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]

function businessTypeLabel(type) {
  const map = {
    INSERT: '新增',
    UPDATE: '修改',
    DELETE: '删除',
    GRANT: '授权',
    IMPORT: '导入',
    EXPORT: '导出',
    CLEAN: '清空',
    OTHER: '其他',
  }
  return map[String(type || '')] || type || '—'
}

function listParams() {
  const statusRaw = queryForm.value.status
  return {
    page: page.value - 1,
    size: size.value,
    keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
    businessType: String(queryForm.value.businessType ?? '').trim() || undefined,
    status: statusRaw === '' || statusRaw == null ? undefined : Number(statusRaw),
    ...rangeToBeginEnd(queryForm.value.operTime),
  }
}

function selectionChangeHandle(rows) {
  selected.value = rows
}

async function openDetail(row) {
  const res = await get(row.id)
  current.value = res.data
  detailVisible.value = true
}

function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'view') openDetail(row)
  else if (payload.action === 'delete') handleDelete(row)
}

async function buttonClick(action) {
  if (action === 'view') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一条日志')
      return
    }
    await openDetail(selected.value[0])
  } else if (action === 'delete') await handleBatchDelete()
  else if (action === 'clean') await handleClean()
  else if (action === 'export') await handleExport()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.title}」这条操作日志吗？`, '删除确认', {
    type: 'warning',
  })
  await remove(row.id)
  ElMessage.success('已删除')
  loadData()
}

async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一条日志')
    return
  }
  await ElMessageBox.confirm(
    `确定删除选中的 ${selected.value.length} 条操作日志吗？`,
    '删除确认',
    { type: 'warning' },
  )
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('已删除')
  selected.value = []
  loadData()
}

async function handleClean() {
  await ElMessageBox.confirm('确定清空全部操作日志吗？此操作不可恢复。', '清空确认', {
    type: 'warning',
  })
  await clean()
  ElMessage.success('已清空')
  selected.value = []
  loadData()
}

async function handleExport() {
  await exportOperLogs(listParams())
  ElMessage.success('导出成功')
}

async function loadData() {
  loading.value = true
  try {
    const res = await list(listParams())
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function inquires(form) {
  queryForm.value = form
  page.value = 1
  loadData()
}

function reset() {
  queryForm.value = {}
  page.value = 1
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.log-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.55;
}
</style>
