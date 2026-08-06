<template>
  <xnPageLayout
    v-model:view-mode="viewMode"
    v-model:page="page"
    v-model:page-size="size"
    :show-pagination="viewMode === 'card'"
    :total="total"
    :loading="viewMode === 'card' ? loading : false"
    @page-change="loadData"
  >
    <template #search>
      <div class="dict-data__header">
        <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
        <span class="dict-data__title">
          字典数据：<strong>{{ dictName }}</strong>
          <code class="dict-code">{{ dictType }}</code>
        </span>
      </div>
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
        table-key="system:dicts:data"
        entity-name="字典数据"
        name-field="label"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #preview="{ row }">
          <el-tag :type="tagType(row.listClass)">{{ row.label }}</el-tag>
        </template>
        <template #isDefault="{ row }">
          <el-tag v-if="row.isDefault" type="success">默认</el-tag>
          <span v-else class="text-muted">—</span>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <DictDataSave ref="saveRef" :dict-type="dictType" @success="loadData" />
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import DictDataSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { list, batchRemove, remove } from '@/api/dict-data'
defineOptions({ name: 'DictData' })
const route = useRoute()
const router = useRouter()
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/dicts/data')
const dictType = computed(() => String(route.query.dictType ?? ''))
const dictName = computed(() => String(route.query.dictName ?? dictType.value))
const saveRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const viewMode = ref('table')
const selected = ref([])
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'slot', slot: 'preview', prop: 'label', label: '字典标签', minWidth: 140 },
  { prop: 'value', label: '字典键值', minWidth: 140 },
  { prop: 'sort', label: '排序', width: 80 },
  { type: 'slot', slot: 'isDefault', prop: 'isDefault', label: '默认', width: 90 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'tag',
    options: [
      { value: 1, label: '启用', type: 'success' },
      { value: 0, label: '禁用', type: 'danger' },
    ],
  },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
function tagType(listClass) {
  const allowed = ['primary', 'success', 'info', 'warning', 'danger']
  return allowed.includes(listClass || '') ? listClass : ''
}
function goBack() {
  router.push('/system/dicts')
}
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
}
async function loadData() {
  if (!dictType.value) return
  loading.value = true
  try {
    const res = await list({
      dictType: dictType.value,
      page: page.value - 1,
      size: size.value,
      keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
      status: queryForm.value.status,
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
  }
}
function buttonClick(action) {
  if (action === 'add') {
    openSave('add')
    return
  }
  if (action === 'edit') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一项操作')
      return
    }
    openSave('edit', selected.value[0].id)
    return
  }
  if (action === 'view') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一项操作')
      return
    }
    openSave('view', selected.value[0].id)
    return
  }
  if (action === 'delete') {
    handleBatchDelete()
  }
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除字典数据「${row.label}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await remove(row.id)
  ElMessage.success('删除成功')
  loadData()
}
async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条字典数据吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
onMounted(loadData)
</script>

<style scoped>
.dict-data__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dict-data__title {
  font-size: var(--app-font-size-main);
}

.dict-code {
  font-size: 12px;
  color: var(--app-text-muted);
  background: var(--app-fill-color-light, rgba(0, 0, 0, 0.04));
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.text-muted {
  color: var(--app-text-muted);
}
</style>
