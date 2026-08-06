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
        table-key="system:recycle"
        entity-name="回收站"
        name-field="title"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #bizType="{ row }">
          <el-tag size="small" :type="row.bizType === 'USER' ? 'warning' : 'primary'">
            {{ bizTypeLabel(row.bizType) }}
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
import {
  batchPurgeRecycle,
  cleanRecycle,
  listRecycle,
  purgeRecycle,
  restoreRecycle,
} from '@/api/recycle'
defineOptions({ name: 'SystemRecycle' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/recycle')
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'slot', slot: 'bizType', prop: 'bizType', label: '类型', width: 100 },
  { prop: 'title', label: '标题', minWidth: 160 },
  { prop: 'summary', label: '摘要', minWidth: 200, showOverflowTooltip: true },
  { prop: 'deletedBy', label: '删除人', minWidth: 110 },
  { prop: 'deletedAt', label: '删除时间', minWidth: 170, type: 'datetime' },
  { type: 'slot', slot: 'actions', label: '操作', width: 160, fixed: 'right' },
]
function bizTypeLabel(type) {
  if (type === 'USER') return '用户'
  if (type === 'FILE') return '文件'
  return type || '-'
}
function selectionChangeHandle(rows) {
  selected.value = rows
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'restore') handleRestore(row)
  else if (payload.action === 'purge') handlePurge(row)
}
async function buttonClick(action) {
  if (action === 'restore') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一项恢复')
      return
    }
    await handleRestore(selected.value[0])
  } else if (action === 'purge') {
    await handleBatchPurge()
  } else if (action === 'clean') {
    await ElMessageBox.confirm('确定清空回收站并彻底删除全部内容吗？此操作不可恢复。', '清空确认', {
      type: 'warning',
    })
    await cleanRecycle()
    ElMessage.success('回收站已清空')
    loadData()
  }
}
async function handleRestore(row) {
  await ElMessageBox.confirm(`确定恢复「${row.title}」吗？`, '恢复确认', { type: 'info' })
  await restoreRecycle(row.id)
  ElMessage.success('已恢复')
  loadData()
}
async function handlePurge(row) {
  await ElMessageBox.confirm(`确定彻底删除「${row.title}」吗？此操作不可恢复。`, '彻底删除', {
    type: 'warning',
  })
  await purgeRecycle(row.id)
  ElMessage.success('已彻底删除')
  loadData()
}
async function handleBatchPurge() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(
    `确定彻底删除选中的 ${selected.value.length} 项吗？此操作不可恢复。`,
    '彻底删除',
    { type: 'warning' },
  )
  await batchPurgeRecycle(selected.value.map((r) => r.id))
  ElMessage.success('已彻底删除')
  loadData()
}
async function loadData() {
  loading.value = true
  try {
    const res = await listRecycle({
      page: page.value - 1,
      size: size.value,
      keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
      bizType: String(queryForm.value.bizType ?? '').trim() || undefined,
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
onMounted(loadData)
</script>
