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
        table-key="system:posts"
        entity-name="岗位"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #code="{ row }">
          <code class="post-code">{{ row.code }}</code>
        </template>
        <template #actions="{ row }">
          <xnTableActions
            :items="tableButtonItems"
            :row="row"
            :disabled="tableActionDisabled"
            @action-click="onTableAction"
          />
        </template>
      </xnTable>
    </template>
    <template #card>
      <div class="page-card-grid">
        <el-card v-for="row in tableData" :key="row.id" shadow="hover">
          <div class="post-card__name">{{ row.name }}</div>
          <code class="post-code">{{ row.code }}</code>
          <div class="post-card__meta">
            排序 {{ row.sort }} · {{ row.status === 1 ? '启用' : '停用' }}
          </div>
          <xnTableActions
            :items="tableButtonItems"
            :row="row"
            :disabled="tableActionDisabled"
            @action-click="onTableAction"
          />
        </el-card>
      </div>
    </template>
  </xnPageLayout>

  <PostSave ref="saveRef" @success="loadData" />
  <XnImportDialog
    ref="importRef"
    title="导入岗位"
    template-name="岗位导入模板"
    :columns="importColumns"
    :importer="handleImport"
    @success="loadData"
  />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import XnImportDialog from '@/components/xnImport/xnImportDialog.vue'
import PostSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { batchRemove, exportPosts, importPosts, list, remove } from '@/api/post'
defineOptions({ name: 'SystemPosts' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/posts')
const saveRef = ref()
const importRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const viewMode = ref('table')
const selected = ref([])
const importColumns = [
  { key: 'code', title: '岗位编码', required: true, example: 'engineer', width: 14 },
  { key: 'name', title: '岗位名称', required: true, example: '工程师', width: 14 },
  { key: 'sort', title: '排序', example: '10', width: 10 },
  {
    key: 'status',
    title: '状态',
    example: '启用',
    width: 10,
    options: [
      { label: '启用', value: '1' },
      { label: '停用', value: '0' },
    ],
  },
  { key: 'remark', title: '备注', example: '', width: 20 },
]
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'name', label: '岗位名称', minWidth: 140 },
  { type: 'slot', slot: 'code', prop: 'code', label: '岗位编码', minWidth: 140 },
  { prop: 'sort', label: '排序', width: 90 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'tag',
    options: [
      { value: 1, label: '启用', type: 'success' },
      { value: 0, label: '停用', type: 'info' },
    ],
  },
  {
    prop: 'builtIn',
    label: '类型',
    width: 100,
    type: 'tag',
    options: [
      { value: true, label: '内置', type: 'warning' },
      { value: false, label: '自定义', type: 'info' },
    ],
  },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { type: 'slot', slot: 'actions', label: '操作', width: 160, fixed: 'right' },
]
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
}
function tableActionDisabled(action, row) {
  if (action === 'delete' && row.builtIn) return '内置岗位不可删除'
  return false
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'edit') openSave('edit', row.id)
  else if (payload.action === 'view') openSave('view', row.id)
  else if (payload.action === 'delete') handleDelete(row)
}
async function buttonClick(action) {
  if (action === 'add') openSave('add')
  else if (action === 'import') importRef.value?.open()
  else if (action === 'export') {
    try {
      await exportPosts({
        keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
        status: queryForm.value.status,
      })
      ElMessage.success('导出成功')
    } catch (e) {
      ElMessage.error(e instanceof Error ? e.message : '导出失败')
    }
  } else if (action === 'edit' && selected.value.length === 1)
    openSave('edit', selected.value[0].id)
  else if (action === 'view' && selected.value.length === 1) openSave('view', selected.value[0].id)
  else if (action === 'delete') handleBatchDelete()
}
async function handleImport(rows) {
  const payload = rows.map((row) => ({
    code: row.code,
    name: row.name,
    sort: row.sort === '' || row.sort == null ? undefined : Number(row.sort),
    status: row.status === '' || row.status == null ? undefined : Number(row.status),
    remark: row.remark || undefined,
  }))
  const res = await importPosts(payload)
  return res.data
}
async function loadData() {
  loading.value = true
  try {
    const res = await list({
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
async function handleDelete(row) {
  if (row.builtIn) {
    ElMessage.warning('内置岗位不可删除')
    return
  }
  await ElMessageBox.confirm(`确定删除岗位「${row.name}」吗？`, '删除确认', { type: 'warning' })
  await remove(row.id)
  ElMessage.success('删除成功')
  loadData()
}
async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个岗位吗？`, '删除确认', {
    type: 'warning',
  })
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
onMounted(loadData)
</script>

<style scoped>
.post-code {
  font-size: 12px;
  color: var(--el-color-primary);
}
.post-card__name {
  font-weight: 600;
  margin-bottom: 6px;
}
.post-card__meta {
  margin: 8px 0 12px;
  color: var(--app-text-muted, #909399);
  font-size: 13px;
}
</style>
