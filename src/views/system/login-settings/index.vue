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
        table-key="system:login-settings"
        entity-name="登录页配置"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #captcha="{ row }">
          <template v-if="row.captchaEnabled">
            <el-tag type="warning" size="small">{{ captchaLabel(row.captchaType) }}</el-tag>
          </template>
          <el-tag v-else type="info" size="small">关闭</el-tag>
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
        <el-card v-for="row in tableData" :key="row.id" shadow="hover" class="cfg-card">
          <div class="cfg-card__header">
            <div class="cfg-card__name">{{ row.name }}</div>
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用中' : '未启用' }}
            </el-tag>
          </div>
          <div class="cfg-card__body">
            <div class="cfg-card__row">
              <span class="label">登录验证</span>
              <span>{{ row.captchaEnabled ? captchaLabel(row.captchaType) : '关闭' }}</span>
            </div>
            <div v-if="row.remark" class="cfg-card__row">
              <span class="label">备注</span>
              <span class="remark">{{ row.remark }}</span>
            </div>
          </div>
          <div class="cfg-card__footer">
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

  <LoginPageSave ref="saveRef" @success="loadData" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import LoginPageSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { list, batchRemove, remove, updateStatus } from '@/api/login-page'
defineOptions({ name: 'LoginSettings' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/login-settings')
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
  { prop: 'name', label: '配置名称', minWidth: 140 },
  { type: 'slot', slot: 'captcha', prop: 'captchaEnabled', label: '登录验证', width: 140 },
  {
    prop: 'status',
    label: '状态',
    width: 100,
    type: 'tag',
    options: [
      { value: 1, label: '启用', type: 'success' },
      { value: 0, label: '未启用', type: 'info' },
    ],
  },
  { prop: 'remark', label: '备注', minWidth: 160, showOverflowTooltip: true },
  { type: 'slot', slot: 'actions', label: '操作', width: 240, fixed: 'right' },
]
function captchaLabel(type) {
  if (type === 'SLIDER') return '滑块验证'
  if (type === 'IMAGE') return '图形验证码'
  return '已开启'
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
  if (action === 'enable' && row.status === 1) return '已是启用状态'
  if (action === 'disable' && row.status === 0) return '已是未启用状态'
  return false
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
    case 'enable':
      handleStatus(row, 1)
      break
    case 'disable':
      handleStatus(row, 0)
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
async function handleStatus(row, status) {
  if (status === 1) {
    await ElMessageBox.confirm(
      `启用「${row.name}」后，其它登录页配置将自动停用，是否继续？`,
      '启用确认',
      { type: 'warning', confirmButtonText: '启用', cancelButtonText: '取消' },
    )
  }
  await updateStatus(row.id, status)
  ElMessage.success(status === 1 ? '已启用' : '已停用')
  loadData()
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除配置「${row.name}」吗？`, '删除确认', {
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
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条配置吗？`, '删除确认', {
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
.cfg-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.cfg-card__name {
  font-weight: 600;
}

.cfg-card__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.cfg-card__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: var(--app-font-size-main);
}

.cfg-card__row .label {
  color: var(--app-text-muted);
  flex-shrink: 0;
}

.cfg-card__row .remark {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cfg-card__footer {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 4px;
  border-top: 1px solid var(--app-border-color);
  padding-top: 12px;
}
</style>
