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
        table-key="system:roles"
        entity-name="角色"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #status="{ row }">
          <el-switch
            v-permission="'role:update'"
            :model-value="row.status === 1"
            :disabled="!!row.builtIn && row.code === 'SUPER_ADMIN'"
            @change="(val) => handleStatusChange(row, val)"
          />
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
        <el-card v-for="row in tableData" :key="row.id" shadow="hover" class="role-card">
          <div class="role-card__header">
            <div>
              <div class="role-card__name">{{ row.name }}</div>
              <div class="role-card__code">{{ row.code }}</div>
            </div>
            <el-tag :type="row.builtIn ? 'warning' : 'info'">
              {{ row.builtIn ? '内置' : '自定义' }}
            </el-tag>
          </div>
          <div class="role-card__body">
            <div class="role-card__row">
              <span class="label">数据权限</span>
              <span>{{ dataScopeLabel(row.dataScope) }}</span>
            </div>
            <div class="role-card__row">
              <span class="label">描述</span>
              <span>{{ row.description || '—' }}</span>
            </div>
            <div class="role-card__row">
              <span class="label">状态</span>
              <el-switch
                v-permission="'role:update'"
                :model-value="row.status === 1"
                :disabled="row.builtIn && row.code === 'SUPER_ADMIN'"
                @change="(val) => handleStatusChange(row, val)"
              />
            </div>
          </div>
          <div class="role-card__footer">
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

  <RoleSave ref="saveRef" @success="loadData" />
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
import RoleSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { list, batchRemove, remove, updateStatus } from '@/api/role'
defineOptions({ name: 'Roles' })
const router = useRouter()
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/roles')
const saveRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const viewMode = ref('table')
const selected = ref([])
function dataScopeLabel(scope) {
  switch (scope) {
    case 'ALL':
      return '全部数据'
    case 'UNIT':
      return '仅本单位'
    case 'SELF':
      return '仅本人'
    case 'UNIT_AND_CHILDREN':
    default:
      return '本单位及下级'
  }
}
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'name', label: '名称', minWidth: 140 },
  { prop: 'code', label: '编码', minWidth: 140 },
  {
    prop: 'dataScope',
    label: '数据权限',
    minWidth: 140,
    type: 'tag',
    options: [
      { value: 'ALL', label: '全部数据', type: 'danger' },
      { value: 'UNIT_AND_CHILDREN', label: '本单位及下级', type: 'success' },
      { value: 'UNIT', label: '仅本单位', type: 'warning' },
      { value: 'SELF', label: '仅本人', type: 'info' },
    ],
  },
  { prop: 'description', label: '描述', minWidth: 200, showOverflowTooltip: true },
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
  { type: 'slot', slot: 'status', prop: 'status', label: '状态', width: 100 },
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
function goAssignPermissions(row) {
  router.push({ path: '/system/permissions', query: { roleId: String(row.id) } })
}
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
}
function resolveKeyword(form) {
  const fuzzy = String(form.FuzzyWord ?? '').trim()
  const name = String(form.name ?? '').trim()
  const code = String(form.code ?? '').trim()
  return fuzzy || name || code || undefined
}
async function loadData() {
  loading.value = true
  try {
    const res = await list({
      page: page.value - 1,
      size: size.value,
      keyword: resolveKeyword(queryForm.value),
    })
    let records = res.data.records
    const status = queryForm.value.status
    const builtIn = queryForm.value.builtIn
    if (status !== '' && status !== undefined && status !== null) {
      records = records.filter((row) => row.status === Number(status))
    }
    if (builtIn !== '' && builtIn !== undefined && builtIn !== null) {
      records = records.filter((row) => row.builtIn === builtIn)
    }
    tableData.value = records
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
  if (action === 'delete' && row.builtIn) return '内置角色不可删除'
  return false
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
    case 'assign':
      goAssignPermissions(row)
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
    ElMessage.warning('内置角色不可删除')
    return
  }
  await ElMessageBox.confirm(`确定删除角色「${row.name}」吗？`, '删除确认', {
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
    ElMessage.warning('内置角色不可删除，请取消勾选')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 个角色吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
async function handleStatusChange(row, enabled) {
  try {
    await updateStatus(row.id, enabled ? 1 : 0)
    row.status = enabled ? 1 : 0
    ElMessage.success('状态更新成功')
  } catch {
    row.status = enabled ? 0 : 1
  }
}
onMounted(loadData)
</script>

<style scoped>
.role-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.role-card__name {
  font-weight: 600;
  font-size: var(--app-font-size-main);
}

.role-card__code {
  margin-top: 4px;
  font-size: var(--app-font-size-main);
  color: var(--app-text-muted);
}

.role-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.role-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.role-card__row .label {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.role-card__row > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.role-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}
</style>
