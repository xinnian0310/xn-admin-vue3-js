<template>
  <xnPageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    @page-change="applyLocalPage"
    @refresh="loadData"
  >
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>
    <template #toolbar>
      <xnButton :list-item="toolbarButtons" :selected="selected" @button-click="buttonClick" />
    </template>
    <template #toolbar-extra>
      <el-tag :type="statusTag" effect="light" round>{{ statusLabel }}</el-tag>
      <el-tag v-if="monitor" effect="plain" round>
        {{ monitor.host }}:{{ monitor.port }} · Key {{ monitor.keyCount ?? 0 }}
      </el-tag>
    </template>
    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="monitor:redis"
        entity-name="缓存键"
        name-field="key"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
        @refresh="loadData"
      >
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog v-model="detailVisible" :title="detailTitle" width="640px" destroy-on-close>
    <el-descriptions v-if="currentKey" :column="1" border>
      <el-descriptions-item label="Key">
        <code class="redis-key">{{ currentKey }}</code>
      </el-descriptions-item>
      <el-descriptions-item label="状态">{{ monitor?.status || '—' }}</el-descriptions-item>
      <el-descriptions-item label="地址">
        {{ monitor ? `${monitor.host}:${monitor.port}` : '—' }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import { deleteRedisKey, flushRedis, getRedisMonitor } from '@/api/monitor'
defineOptions({ name: 'MonitorRedis' })
/** 权限内容：redis:view/delete/flush；table-view/table-delete */
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/monitor/redis')
const loading = ref(false)
const monitor = ref(null)
const allData = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const detailVisible = ref(false)
const currentKey = ref('')
const detailTitle = ref('缓存详情')
const toolbarButtons = computed(() =>
  buttonItems.value.map((item) => {
    if (
      (item.action === 'delete' || item.action === 'flush') &&
      monitor.value?.status !== 'ENABLED'
    ) {
      return { ...item, disabled: true }
    }
    return item
  }),
)
const statusLabel = computed(() => {
  if (monitor.value?.status === 'ENABLED') return '已连接'
  if (monitor.value?.status === 'ERROR') return '连接失败'
  return '未启用'
})
const statusTag = computed(() => {
  if (monitor.value?.status === 'ENABLED') return 'success'
  if (monitor.value?.status === 'ERROR') return 'danger'
  return 'info'
})
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'key', label: 'Key', minWidth: 280, showOverflowTooltip: true },
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
    rows = rows.filter((r) => r.key.toLowerCase().includes(kw))
  }
  total.value = rows.length
  const start = (page.value - 1) * size.value
  tableData.value = rows.slice(start, start + size.value)
}
async function loadData() {
  loading.value = true
  try {
    const res = await getRedisMonitor()
    monitor.value = res.data
    allData.value = (res.data.sampleKeys || []).map((key) => ({ key }))
    if (res.data.message && res.data.status !== 'ENABLED') {
      ElMessage[res.data.status === 'ERROR' ? 'error' : 'info'](res.data.message)
    }
    applyLocalPage()
  } finally {
    loading.value = false
  }
}
function openDetail(key, editable) {
  currentKey.value = key
  detailTitle.value = editable ? '编辑缓存键' : '查看缓存键'
  detailVisible.value = true
}
async function buttonClick(action) {
  if (action === 'view' || action === 'edit') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一个 Key')
      return
    }
    openDetail(selected.value[0].key, action === 'edit')
  } else if (action === 'delete') {
    if (!selected.value.length) {
      ElMessage.warning('请至少选择一个 Key')
      return
    }
    await ElMessageBox.confirm(
      `确定删除选中的 ${selected.value.length} 个 Key 吗？`,
      '删除确认',
      { type: 'warning' },
    )
    for (const row of selected.value) {
      await deleteRedisKey(row.key)
    }
    ElMessage.success('删除成功')
    selected.value = []
    loadData()
  } else if (action === 'flush') {
    await handleFlush()
  }
}
function onTableAction(payload) {
  const key = String(payload.row.key ?? '')
  if (payload.action === 'view') openDetail(key, false)
  else if (payload.action === 'edit') openDetail(key, true)
  else if (payload.action === 'delete') handleDeleteKey(key)
}
async function handleDeleteKey(key) {
  if (!key) return
  await ElMessageBox.confirm(`确定删除 Key「${key}」吗？`, '删除确认', { type: 'warning' })
  await deleteRedisKey(key)
  ElMessage.success('删除成功')
  loadData()
}
async function handleFlush() {
  await ElMessageBox.confirm('确定清空当前 Redis 数据库吗？此操作不可恢复！', '危险操作', {
    type: 'error',
  })
  await flushRedis()
  ElMessage.success('已清空')
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
onMounted(loadData)
</script>

<style scoped>
.redis-key {
  font-family: monospace;
  word-break: break-all;
}
</style>
