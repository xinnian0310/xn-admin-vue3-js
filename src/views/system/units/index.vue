<template>
  <xnPageLayout
    v-model:view-mode="viewMode"
    v-model:page="page"
    v-model:page-size="size"
    :show-pagination="viewMode === 'card'"
    :total="cardTotal"
    :loading="viewMode === 'card' ? cardLoading : false"
  >
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>

    <template #toolbar>
      <xnButton
        :list-item="buttonItems"
        :selected="selected"
        @button-click="(action) => tableRef?.handleAction(action)"
      />
    </template>

    <template #table>
      <xnTable
        ref="tableRef"
        v-model:page="page"
        v-model:page-size="size"
        api="unit"
        table-key="system:units"
        :save-component="UnitSave"
        :query-params="queryForm"
        entity-name="单位"
        name-field="name"
        :action-items="tableButtonItems"
        :delete-check="(row) => (row.builtIn ? '内置单位不可删除' : true)"
        :columns="columns"
        row-key="id"
        stripe
        default-expand-all
        :tree-props="{ children: 'children' }"
        @selection-change="selectionChangeHandle"
        @data-change="onTableDataChange"
        @switch-change="onSwitchChange"
      >
        <template #roles="{ row }">
          <template v-if="row.roleList?.length">
            <el-tag
              v-for="r in row.roleList"
              :key="r.id"
              size="small"
              style="margin-right: 4px; margin-bottom: 2px"
            >
              {{ r.name }}
            </el-tag>
          </template>
          <span v-else class="text-muted">—</span>
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
        <el-card v-for="row in cardRows" :key="row.id" shadow="hover" class="unit-card">
          <div class="unit-card__header">
            <div>
              <div class="unit-card__name">{{ row.name }}</div>
              <div class="unit-card__code">{{ row.code }}</div>
            </div>
            <el-tag :type="row.builtIn ? 'warning' : 'info'">
              {{ row.builtIn ? '内置' : '自定义' }}
            </el-tag>
          </div>
          <div class="unit-card__body">
            <div class="unit-card__row">
              <span class="label">默认角色</span>
              <span>{{ (row.roleList || []).map((r) => r.name).join('、') || '—' }}</span>
            </div>
            <div class="unit-card__row">
              <span class="label">描述</span>
              <span>{{ row.description || '—' }}</span>
            </div>
            <div class="unit-card__row">
              <span class="label">状态</span>
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
          <div class="unit-card__footer">
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

  <UnitsAssignRoles ref="assignRef" @success="() => tableRef?.loadData(queryForm)" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import UnitSave from './save.vue'
import UnitsAssignRoles from './assign-roles.vue'
import { usePageUi } from '@/composables/usePageUi'
import { updateStatus } from '@/api/unit'
defineOptions({ name: 'Units' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/units')
const viewMode = ref('table')
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'name', label: '名称', minWidth: 160 },
  { prop: 'code', label: '编码', minWidth: 120 },
  { type: 'slot', slot: 'roles', prop: 'roleList', label: '默认角色', minWidth: 160 },
  { prop: 'description', label: '描述', minWidth: 180, showOverflowTooltip: true },
  { prop: 'sort', label: '排序', width: 80 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'switch',
    activeValue: 1,
    inactiveValue: 0,
    disabledProp: 'builtIn',
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
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
const tableRef = ref()
const assignRef = ref()
const queryForm = ref({})
const selected = ref([])
const page = ref(1)
const size = ref(10)
const tableRecords = ref([])
const cardTotal = ref(0)
const cardLoading = ref(false)
function flattenUnits(nodes) {
  const result = []
  const walk = (list) => {
    for (const node of list) {
      result.push(node)
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)
  return result
}
const cardRows = computed(() => flattenUnits(tableRecords.value))
function onTableDataChange(payload) {
  tableRecords.value = payload.records
  cardTotal.value = payload.total
  cardLoading.value = payload.loading
}
function normalizeQuery(form) {
  const result = {}
  for (const [key, value] of Object.entries(form)) {
    if (value === '' || value === undefined || value === null) continue
    result[key] = value
  }
  return result
}
async function inquires(form) {
  const params = normalizeQuery(form)
  queryForm.value = params
  page.value = 1
  await tableRef.value?.loadData(params)
}
async function reset() {
  queryForm.value = {}
  page.value = 1
  await tableRef.value?.loadData({})
}
function selectionChangeHandle(rows) {
  selected.value = rows
}
function tableActionDisabled(action, row) {
  if (action === 'delete' && row.builtIn) return '内置单位不可删除'
  return false
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
    case 'assign':
      assignRef.value?.open(row)
      break
    case 'add-child':
      tableRef.value?.openSave('add', undefined, { parentId: row.id })
      break
    case 'edit':
      tableRef.value?.openSave('edit', row.id)
      break
    case 'view':
      tableRef.value?.openSave('view', row.id)
      break
    case 'delete':
      tableRef.value?.handleDelete(row)
      break
  }
}
async function onSwitchChange(payload) {
  if (payload.prop !== 'status') return
  const row = payload.row
  const next = Number(payload.value)
  try {
    await updateStatus(row.id, next)
    row.status = next
    ElMessage.success('状态更新成功')
  } catch {
    row.status = next === 1 ? 0 : 1
  }
}
</script>

<style scoped>
.text-muted {
  color: var(--app-text-muted);
}

.unit-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.unit-card__name {
  font-weight: 600;
  font-size: var(--app-font-size-main);
}

.unit-card__code {
  margin-top: 4px;
  font-size: var(--app-font-size-main);
  color: var(--app-text-muted);
}

.unit-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.unit-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.unit-card__row .label {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.unit-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}
</style>
