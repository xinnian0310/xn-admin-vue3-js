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
        table-key="system:logs:exception"
        entity-name="异常日志"
        name-field="exceptionName"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog v-model="detailVisible" title="异常日志详情" width="780px" destroy-on-close>
    <el-descriptions v-if="current" :column="1" border>
      <el-descriptions-item label="请求">
        {{ current.requestMethod || '—' }} {{ current.requestUrl || '' }}
      </el-descriptions-item>
      <el-descriptions-item label="方法">{{ current.method || '—' }}</el-descriptions-item>
      <el-descriptions-item label="类名">{{ current.className || '—' }}</el-descriptions-item>
      <el-descriptions-item label="异常">{{ current.exceptionName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="操作人">{{ current.operatorName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="IP">{{ current.ip || '—' }}</el-descriptions-item>
      <el-descriptions-item label="时间">{{ current.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="信息">
        <pre class="log-pre">{{ current.message || '—' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item label="堆栈">
        <pre class="log-pre">{{ current.stackTrace || '—' }}</pre>
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
import { batchRemove, clean, exportExceptionLogs, get, list, remove } from '@/api/exception-log'
import { rangeToBeginEnd } from '@/utils/download'

defineOptions({ name: 'SystemExceptionLogs' })

const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/logs/exception')

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
  { prop: 'exceptionName', label: '异常', minWidth: 180, showOverflowTooltip: true },
  { prop: 'requestUrl', label: 'URL', minWidth: 180, showOverflowTooltip: true },
  { prop: 'message', label: '信息', minWidth: 200, showOverflowTooltip: true },
  { prop: 'operatorName', label: '操作人', minWidth: 110 },
  { prop: 'ip', label: 'IP', minWidth: 120 },
  { prop: 'createdAt', label: '发生时间', minWidth: 170, type: 'datetime' },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]

function listParams() {
  return {
    page: page.value - 1,
    size: size.value,
    keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
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
  await ElMessageBox.confirm('确定删除这条异常日志吗？', '删除确认', { type: 'warning' })
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
    `确定删除选中的 ${selected.value.length} 条异常日志吗？`,
    '删除确认',
    { type: 'warning' },
  )
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('已删除')
  selected.value = []
  loadData()
}

async function handleClean() {
  await ElMessageBox.confirm('确定清空全部异常日志吗？此操作不可恢复。', '清空确认', {
    type: 'warning',
  })
  await clean()
  ElMessage.success('已清空')
  selected.value = []
  loadData()
}

async function handleExport() {
  await exportExceptionLogs(listParams())
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
  max-height: 240px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.5;
}
</style>
