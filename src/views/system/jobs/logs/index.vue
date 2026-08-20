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
        table-key="system:jobs:logs"
        entity-name="任务日志"
        name-field="jobName"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #status="{ row }">
          <el-tag :type="jobStatusType(row.status)" size="small">{{
            jobStatusLabel(row.status)
          }}</el-tag>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog v-model="detailVisible" title="任务日志详情" width="720px" destroy-on-close>
    <el-descriptions v-if="current" :column="1" border>
      <el-descriptions-item label="任务">{{ current.jobName || '—' }}</el-descriptions-item>
      <el-descriptions-item label="标识">{{ current.jobKey || '—' }}</el-descriptions-item>
      <el-descriptions-item label="调用目标">{{ current.invokeTarget || '—' }}</el-descriptions-item>
      <el-descriptions-item label="状态">{{ jobStatusLabel(current.status) }}</el-descriptions-item>
      <el-descriptions-item label="开始">{{ current.startTime || '—' }}</el-descriptions-item>
      <el-descriptions-item label="结束">{{ current.endTime || '—' }}</el-descriptions-item>
      <el-descriptions-item label="耗时(ms)">{{ current.costMs ?? '—' }}</el-descriptions-item>
      <el-descriptions-item label="信息">
        <pre class="log-pre">{{ current.message || '—' }}</pre>
      </el-descriptions-item>
      <el-descriptions-item v-if="current.exceptionInfo" label="异常">
        <pre class="log-pre">{{ current.exceptionInfo }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import {
  batchRemoveJobLogs,
  cleanJobLogs,
  exportJobLogs,
  getJobLog,
  listJobLogs,
  removeJobLog,
} from '@/api/job-log'
import { rangeToBeginEnd } from '@/utils/download'

defineOptions({ name: 'SystemJobLogs' })

const route = useRoute()
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/jobs/logs')

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const detailVisible = ref(false)
const current = ref(null)

const jobIdFromQuery = computed(() => {
  const raw = route.query.jobId
  const n = Number(Array.isArray(raw) ? raw[0] : raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
})

const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'jobName', label: '任务名称', minWidth: 140 },
  { prop: 'jobKey', label: '标识', minWidth: 140 },
  { type: 'slot', slot: 'status', prop: 'status', label: '状态', width: 90 },
  { prop: 'message', label: '信息', minWidth: 180, showOverflowTooltip: true },
  { prop: 'startTime', label: '开始时间', minWidth: 170, type: 'datetime' },
  { prop: 'costMs', label: '耗时(ms)', width: 100 },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]

function jobStatusLabel(status) {
  if (status === 'SUCCESS') return '成功'
  if (status === 'FAIL') return '失败'
  if (status === 'SKIP') return '跳过'
  return status || '—'
}

function jobStatusType(status) {
  if (status === 'SUCCESS') return 'success'
  if (status === 'FAIL') return 'danger'
  if (status === 'SKIP') return 'info'
  return 'info'
}

function listParams() {
  return {
    page: page.value - 1,
    size: size.value,
    keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
    jobId: jobIdFromQuery.value,
    status: String(queryForm.value.status ?? '').trim() || undefined,
    ...rangeToBeginEnd(queryForm.value.range),
  }
}

function selectionChangeHandle(rows) {
  selected.value = rows
}

async function openDetail(row) {
  const res = await getJobLog(row.id)
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
  await ElMessageBox.confirm(`确定删除任务「${row.jobName || row.id}」的这条日志吗？`, '删除确认', {
    type: 'warning',
  })
  await removeJobLog(row.id)
  ElMessage.success('已删除')
  loadData()
}

async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一条日志')
    return
  }
  await ElMessageBox.confirm(
    `确定删除选中的 ${selected.value.length} 条任务日志吗？`,
    '删除确认',
    { type: 'warning' },
  )
  await batchRemoveJobLogs(selected.value.map((r) => r.id))
  ElMessage.success('已删除')
  selected.value = []
  loadData()
}

async function handleClean() {
  await ElMessageBox.confirm('确定清空全部任务日志吗？此操作不可恢复。', '清空确认', {
    type: 'warning',
  })
  await cleanJobLogs()
  ElMessage.success('已清空')
  selected.value = []
  loadData()
}

async function handleExport() {
  await exportJobLogs(listParams())
  ElMessage.success('导出成功')
}

async function loadData() {
  loading.value = true
  try {
    const res = await listJobLogs(listParams())
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

watch(jobIdFromQuery, () => {
  page.value = 1
  loadData()
})

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
