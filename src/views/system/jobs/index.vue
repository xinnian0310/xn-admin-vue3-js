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
        table-key="system:jobs"
        entity-name="定时任务"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #misfirePolicy="{ row }">
          {{ misfireLabel(row.misfirePolicy) }}
        </template>
        <template #status="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <JobSave ref="saveRef" @success="loadData" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import JobSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { batchRemoveJobs, listJobs, removeJob, runJob } from '@/api/file-job'
defineOptions({ name: 'SystemJobs' })
const router = useRouter()
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/jobs')
const saveRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
function misfireLabel(policy) {
  switch (policy) {
    case '1':
      return '忽略补齐'
    case '2':
      return '补偿一次'
    case '3':
      return '不触发'
    default:
      return '默认'
  }
}
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'name', label: '任务名称', minWidth: 140 },
  { prop: 'jobKey', label: '任务标识', minWidth: 140 },
  { prop: 'cron', label: 'Cron', minWidth: 140 },
  { type: 'longText', prop: 'invokeTarget', label: '调用目标', minWidth: 180 },
  { type: 'slot', slot: 'misfirePolicy', prop: 'misfirePolicy', label: 'misfire', width: 120 },
  { type: 'slot', slot: 'status', prop: 'status', label: '状态', width: 90 },
  { prop: 'lastRunAt', label: '上次执行', minWidth: 170, type: 'datetime' },
  { prop: 'lastStatus', label: '执行结果', width: 100 },
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
}
function selectionChangeHandle(rows) {
  selected.value = rows
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
    case 'edit':
      openSave('edit', row.id)
      break
    case 'view':
      openSave('view', row.id)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'run':
      handleRun(row)
      break
    case 'logs':
      router.push({ path: '/system/jobs/logs', query: { jobId: String(row.id) } })
      break
  }
}
function buttonClick(action) {
  if (action === 'add') openSave('add')
  else if (action === 'edit' && selected.value.length === 1) openSave('edit', selected.value[0].id)
  else if (action === 'view' && selected.value.length === 1) openSave('view', selected.value[0].id)
  else if (action === 'delete') handleBatchDelete()
  else if (action === 'run' && selected.value.length === 1) handleRun(selected.value[0])
  else if (action === 'logs') {
    const query = selected.value.length === 1 ? { jobId: String(selected.value[0].id) } : undefined
    router.push({ path: '/system/jobs/logs', query })
  }
}
async function loadData() {
  loading.value = true
  try {
    const statusRaw = queryForm.value.status
    const res = await listJobs({
      page: page.value - 1,
      size: size.value,
      keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
      status: statusRaw === '' || statusRaw == null ? undefined : Number(statusRaw),
    })
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
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除任务「${row.name}」吗？`, '删除确认', { type: 'warning' })
  await removeJob(row.id)
  ElMessage.success('删除成功')
  loadData()
}
async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个任务吗？`, '删除确认', {
    type: 'warning',
  })
  await batchRemoveJobs(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
async function handleRun(row) {
  await runJob(row.id)
  ElMessage.success('已触发执行')
  loadData()
}
onMounted(loadData)
</script>
