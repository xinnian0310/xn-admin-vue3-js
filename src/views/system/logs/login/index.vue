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
        table-key="system:logs:login"
        entity-name="登录日志"
        name-field="username"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
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
import { batchRemove, clean, exportLoginLogs, list, remove } from '@/api/login-log'
import { rangeToBeginEnd } from '@/utils/download'

defineOptions({ name: 'SystemLoginLogs' })

const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/logs/login')

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])

const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'username', label: '用户名', minWidth: 120 },
  { prop: 'ip', label: 'IP', minWidth: 130 },
  { type: 'slot', slot: 'status', prop: 'status', label: '状态', width: 90 },
  { prop: 'message', label: '说明', minWidth: 180, showOverflowTooltip: true },
  { prop: 'userAgent', label: 'User-Agent', minWidth: 220, showOverflowTooltip: true },
  { prop: 'loginTime', label: '登录时间', minWidth: 170, type: 'datetime' },
  { type: 'slot', slot: 'actions', label: '操作', width: 100, fixed: 'right' },
]

function listParams() {
  const statusRaw = queryForm.value.status
  return {
    page: page.value - 1,
    size: size.value,
    keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
    status: statusRaw === '' || statusRaw == null ? undefined : Number(statusRaw),
    ...rangeToBeginEnd(queryForm.value.loginTime),
  }
}

function selectionChangeHandle(rows) {
  selected.value = rows
}

function onTableAction(payload) {
  if (payload.action === 'delete') handleDelete(payload.row)
}

async function buttonClick(action) {
  if (action === 'delete') await handleBatchDelete()
  else if (action === 'clean') await handleClean()
  else if (action === 'export') await handleExport()
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除用户「${row.username}」的这条登录日志吗？`, '删除确认', {
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
    `确定删除选中的 ${selected.value.length} 条登录日志吗？`,
    '删除确认',
    { type: 'warning' },
  )
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('已删除')
  selected.value = []
  loadData()
}

async function handleClean() {
  await ElMessageBox.confirm('确定清空全部登录日志吗？此操作不可恢复。', '清空确认', {
    type: 'warning',
  })
  await clean()
  ElMessage.success('已清空')
  selected.value = []
  loadData()
}

async function handleExport() {
  await exportLoginLogs(listParams())
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
