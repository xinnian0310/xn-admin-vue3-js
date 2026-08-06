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
        table-key="system:dicts"
        entity-name="字典类型"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #type="{ row }">
          <code class="dict-code">{{ row.type }}</code>
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
        <el-card v-for="row in tableData" :key="row.id" shadow="hover" class="dict-card">
          <div class="dict-card__header">
            <div>
              <div class="dict-card__name">{{ row.name }}</div>
              <code class="dict-code">{{ row.type }}</code>
            </div>
            <el-tag :type="row.builtIn ? 'warning' : 'info'">
              {{ row.builtIn ? '内置' : '自定义' }}
            </el-tag>
          </div>
          <div class="dict-card__body">
            <div class="dict-card__row">
              <span class="label">备注</span>
              <span>{{ row.remark || '—' }}</span>
            </div>
            <div class="dict-card__row">
              <span class="label">状态</span>
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
          <div class="dict-card__footer">
            <xnTableActions
              :items="tableButtonItems"
              :row="row"
              :disabled="tableActionDisabled"
              @action-click="onTableAction"
            />
          </div>
        </el-card>
      </div>
    </template>
  </xnPageLayout>

  <DictTypeSave ref="saveRef" @success="loadData" />
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
import DictTypeSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { list, batchRemove, remove } from '@/api/dict-type'
defineOptions({ name: 'Dicts' })
const router = useRouter()
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/dicts')
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
  { prop: 'name', label: '字典名称', minWidth: 160 },
  { type: 'slot', slot: 'type', prop: 'type', label: '字典编码', minWidth: 180 },
  { prop: 'remark', label: '备注', minWidth: 200, showOverflowTooltip: true },
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
  { type: 'slot', slot: 'actions', label: '操作', width: 200, fixed: 'right' },
]
function goDictData(row) {
  router.push({ path: '/system/dicts/data', query: { dictType: row.type, dictName: row.name } })
}
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
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
function tableActionDisabled(action, row) {
  if (action === 'delete' && row.builtIn) return '内置字典不可删除'
  return false
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
    case 'data':
      goDictData(row)
      break
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
  if (row.builtIn) {
    ElMessage.warning('内置字典不可删除')
    return
  }
  await ElMessageBox.confirm(`确定删除字典「${row.name}」吗？`, '删除确认', {
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
  if (selected.value.some((r) => r.builtIn)) {
    ElMessage.warning('内置字典不可删除，请取消勾选')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个字典吗？`, '删除确认', {
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
.dict-code {
  font-size: 12px;
  color: var(--app-text-muted);
  background: var(--app-fill-color-light, rgba(0, 0, 0, 0.04));
  padding: 2px 6px;
  border-radius: 4px;
}

.dict-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.dict-card__name {
  font-weight: 600;
  font-size: var(--app-font-size-main);
  margin-bottom: 4px;
}

.dict-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.dict-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.dict-card__row .label {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.dict-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}
</style>
