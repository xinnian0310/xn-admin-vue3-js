<template>
  <xnPageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    @page-change="applyLocalPage"
  >
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>
    <template #toolbar>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>
    <template #toolbar-extra>
      <el-tag effect="light" round>累计 {{ queryCount }} 条</el-tag>
    </template>
    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="monitor:sql"
        entity-name="SQL"
        name-field="sql"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
      >
        <template #executedAt="{ row }">
          {{ formatDateTime(row.executedAt) }}
        </template>
        <template #durationMs="{ row }">
          {{ row.durationMs ?? '—' }}
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog v-model="detailVisible" title="SQL 详情" width="780px" destroy-on-close>
    <el-descriptions v-if="current" :column="1" border>
      <el-descriptions-item label="执行时间">
        {{ formatDateTime(current.executedAt) }}
      </el-descriptions-item>
      <el-descriptions-item label="耗时(ms)">
        {{ current.durationMs ?? '—' }}
      </el-descriptions-item>
      <el-descriptions-item label="SQL">
        <pre class="sql-detail">{{ current.sql }}</pre>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import { cleanSqlMonitor, getSqlMonitor, removeSqlRecord } from '@/api/monitor'
import { formatDateTime } from '@/utils/datetime'
defineOptions({ name: 'MonitorSql' })
/** 权限内容：sql:view/update/delete；table-view/table-edit/table-delete */
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/monitor/sql')
const loading = ref(false)
const allData = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryCount = ref(0)
const queryForm = ref({})
const selected = ref([])
const detailVisible = ref(false)
const current = ref(null)
let timer = null
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'slot', slot: 'executedAt', prop: 'executedAt', label: '执行时间', width: 170 },
  { type: 'slot', slot: 'durationMs', prop: 'durationMs', label: '耗时(ms)', width: 100 },
  { type: 'longText', prop: 'sql', label: 'SQL', minWidth: 420, longTextMaxLength: 64 },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]
function selectionChangeHandle(rows) {
  selected.value = rows
}
function applyLocalPage() {
  const kw = String(queryForm.value.FuzzyWord ?? '')
    .trim()
    .toLowerCase()
  let rows = allData.value
  if (kw) {
    rows = rows.filter((r) =>
      String(r.sql || '')
        .toLowerCase()
        .includes(kw),
    )
  }
  total.value = rows.length
  const start = (page.value - 1) * size.value
  tableData.value = rows.slice(start, start + size.value)
}
async function loadData() {
  loading.value = true
  try {
    const res = await getSqlMonitor()
    allData.value = res.data.records || []
    queryCount.value = res.data.queryCount ?? allData.value.length
    applyLocalPage()
  } finally {
    loading.value = false
  }
}
function openDetail(row) {
  current.value = row
  detailVisible.value = true
}
async function buttonClick(action) {
  if (action === 'view' || action === 'edit') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一条 SQL 记录')
      return
    }
    openDetail(selected.value[0])
  } else if (action === 'delete') {
    if (selected.value.length) {
      await ElMessageBox.confirm(
        `确定删除选中的 ${selected.value.length} 条 SQL 记录吗？`,
        '删除确认',
        { type: 'warning' },
      )
      for (const row of selected.value) {
        if (row.id != null) await removeSqlRecord(row.id)
      }
      ElMessage.success('删除成功')
      loadData()
    } else {
      await ElMessageBox.confirm('确定清空全部 SQL 监控缓冲吗？', '清空确认', { type: 'warning' })
      await cleanSqlMonitor()
      ElMessage.success('已清空')
      loadData()
    }
  }
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'view' || payload.action === 'edit') openDetail(row)
  else if (payload.action === 'delete') handleDelete(row)
}
async function handleDelete(row) {
  if (row.id == null) {
    ElMessage.warning('无法删除该记录')
    return
  }
  await ElMessageBox.confirm('确定删除该条 SQL 记录吗？', '删除确认', { type: 'warning' })
  await removeSqlRecord(row.id)
  ElMessage.success('删除成功')
  loadData()
}
function inquires(form) {
  queryForm.value = form
  page.value = 1
  applyLocalPage()
}
function reset() {
  queryForm.value = {}
  page.value = 1
  applyLocalPage()
}
onMounted(() => {
  loadData()
  timer = setInterval(loadData, 10000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.sql-detail {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
