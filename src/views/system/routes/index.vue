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
        api="route"
        table-key="system:routes"
        :save-component="RouteSave"
        :query-params="queryForm"
        entity-name="路由"
        name-field="title"
        :delete-check="(row) => (row.builtIn ? '内置路由不可删除' : true)"
        :columns="columns"
        :action-items="tableButtonItems"
        row-key="id"
        stripe
        default-expand-all
        :tree-props="{ children: 'children' }"
        @selection-change="selectionChangeHandle"
        @data-change="onTableDataChange"
      >
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
        <el-card v-for="row in cardRows" :key="row.id" shadow="hover" class="route-card">
          <div class="route-card__header">
            <div class="route-card__title-wrap">
              <xnAppIcon v-if="row.icon" :name="row.icon" />
              <span class="route-card__title">{{ row.title }}</span>
            </div>
            <el-tag :type="routeTypeTag(row.type)">
              {{ routeTypeLabel(row.type) }}
            </el-tag>
          </div>

          <div class="route-card__body">
            <div class="route-card__row">
              <span class="label">路径</span>
              <span>{{ row.path || '—' }}</span>
            </div>
            <div v-if="row.type === 'LINK'" class="route-card__row">
              <span class="label">外部链接</span>
              <span>{{ row.linkUrl || '—' }}</span>
            </div>
            <div class="route-card__row">
              <span class="label">状态</span>
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </div>
            <div class="route-card__row">
              <span class="label">权限控制</span>
              <el-tag :type="row.permissionControl ? 'warning' : 'info'">
                {{ row.permissionControl ? '开启' : '关闭' }}
              </el-tag>
            </div>
            <div class="route-card__row">
              <span class="label">内置</span>
              <el-tag :type="row.builtIn ? 'warning' : 'info'">
                {{ row.builtIn ? '是' : '否' }}
              </el-tag>
            </div>
          </div>

          <div class="route-card__footer">
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

  <RouteCodegen ref="codegenRef" />
</template>

<script setup>
import { computed, ref } from 'vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import RouteSave from './save.vue'
import RouteCodegen from './codegen.vue'
import { usePageUi } from '@/composables/usePageUi'
defineOptions({ name: 'Routes' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/routes')
const codegenRef = ref()
const viewMode = ref('table')
const columns = [
  { type: 'selection', width: 50, fixed: true },
  {
    prop: 'title',
    label: '标题',
    minWidth: 160,
    type: 'iconText',
    iconProp: 'icon',
  },
  {
    prop: 'type',
    label: '类型',
    width: 90,
    type: 'tag',
    options: [
      { value: 'DIR', label: '目录', type: 'primary' },
      { value: 'MENU', label: '菜单', type: 'success' },
      { value: 'LINK', label: '外部链接', type: 'warning' },
    ],
  },
  { prop: 'path', label: '访问路径', minWidth: 160, showOverflowTooltip: true },
  {
    prop: 'viewPath',
    label: '视图目录',
    minWidth: 160,
    prefix: 'views/',
    suffix: '/',
  },
  {
    prop: 'linkUrl',
    label: '外部链接',
    minWidth: 180,
    showOverflowTooltip: true,
  },
  { prop: 'sort', label: '排序', width: 70 },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'tag',
    options: [
      { value: 1, label: '启用', type: 'success' },
      { value: 0, label: '禁用', type: 'danger' },
    ],
  },
  {
    prop: 'permissionControl',
    label: '权限控制',
    width: 100,
    type: 'tag',
    options: [
      { value: true, label: '开启', type: 'warning' },
      { value: false, label: '关闭', type: 'info' },
    ],
  },
  {
    prop: 'builtIn',
    label: '内置',
    width: 70,
    type: 'tag',
    options: [
      { value: true, label: '是', type: 'warning' },
      { value: false, label: '否', type: 'info' },
    ],
  },
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
const tableRef = ref()
const queryForm = ref({})
const selected = ref([])
const page = ref(1)
const size = ref(10)
const tableRecords = ref([])
const cardTotal = ref(0)
const cardLoading = ref(false)
function flattenRoutes(nodes) {
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
const cardRows = computed(() => flattenRoutes(tableRecords.value))
function routeTypeLabel(type) {
  if (type === 'MENU') return '菜单'
  if (type === 'LINK') return '外部链接'
  return '目录'
}
function routeTypeTag(type) {
  if (type === 'MENU') return 'success'
  if (type === 'LINK') return 'warning'
  return 'primary'
}
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
  // 显式传入，避免仅依赖 props 更新时机导致漏参
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
  if (action === 'delete' && row.builtIn) return '内置路由不可删除'
  if (action === 'generate' && row.type !== 'MENU') return '仅菜单可代码生成'
  return false
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
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
    case 'generate':
      codegenRef.value?.open(row)
      break
  }
}
</script>

<style scoped>
.route-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.route-card__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.route-card__title {
  font-weight: 600;
  font-size: var(--app-font-size-main);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.route-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.route-card__row .label {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.route-card__row > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.route-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}

.route-card__title-wrap :deep(.app-icon) {
  color: var(--app-color-primary);
}
</style>
