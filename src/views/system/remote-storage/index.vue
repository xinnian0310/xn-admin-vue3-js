<template>
  <div class="remote-storage-page">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="remote-storage-page__alert"
      title="可新增多条「名字 / 路径」，新增 / 编辑 / 删除即时落库。保存结果组装为对象覆盖前端 appConfig.storage（如 { minio: 'http://127.0.0.1:9000/xn-admin/' }）。云端为空时使用本地 app.js 兜底。密钥勿写入前端。"
    />
    <xnPageLayout :show-pagination="false" :loading="loading || saving">
      <template #search>
        <xnSearch :search-item="resolvedSearchItems" @query-form="onQuery" @reset="onReset" />
      </template>
      <template #toolbar>
        <xnButton :list-item="resolvedButtons" :selected="selected" @button-click="onButton" />
      </template>
      <template #table>
        <xnTable
          :data="filteredItems"
          :total="filteredItems.length"
          :loading="loading || saving"
          :show-pagination="false"
          table-key="system:remote-storage"
          entity-name="远程连接"
          name-field="name"
          row-key="key"
          :columns="columns"
          :action-items="resolvedTableButtons"
          stripe
          @selection-change="onSelectionChange"
        >
          <template #actions="{ row }">
            <xnTableActions
              :items="resolvedTableButtons"
              :row="row"
              @action-click="onTableAction"
            />
          </template>
        </xnTable>
      </template>
    </xnPageLayout>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      append-to-body
      @closed="onDialogClosed"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名字" prop="name">
          <el-input
            v-model="form.name"
            :disabled="dialogMode === 'view'"
            maxlength="64"
            placeholder="如 minio"
          />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input
            v-model="form.path"
            :disabled="dialogMode === 'view'"
            maxlength="1000"
            placeholder="如 http://127.0.0.1:9000/xn-admin/"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="saving" @click="dialogVisible = false">
          {{ dialogMode === 'view' ? '关闭' : '取消' }}
        </el-button>
        <el-button
          v-if="dialogMode !== 'view'"
          type="primary"
          :loading="saving"
          @click="submitDialog"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import { usePageUi } from '@/composables/usePageUi'
import { applyRemoteAppConfig, defaultAppConfig } from '@/config/app'
import { getSystemConfigSection, updateSystemConfigSection } from '@/api/system-config'
import { APP_CLIENT_ID } from '@/config/client'
defineOptions({ name: 'RemoteStorage' })
const SEARCH_FALLBACK = [
  { label: '综合查询', prop: 'FuzzyWord', type: 'input', placeholder: '名字 / 路径' },
]
const BUTTON_FALLBACK = [
  {
    name: '新增',
    type: 'button',
    action: 'add',
    icon: 'Plus',
    typeColor: 'primary',
    permission: 'remote-storage:create',
  },
  {
    name: '编辑',
    type: 'button',
    action: 'edit',
    icon: 'Edit',
    typeColor: 'primary',
    index: 0,
    permission: 'remote-storage:update',
  },
  {
    name: '查看',
    type: 'button',
    action: 'view',
    icon: 'View',
    typeColor: 'primary',
    index: 0,
    permission: 'remote-storage:view',
  },
  {
    name: '删除',
    type: 'button',
    action: 'delete',
    icon: 'Delete',
    typeColor: 'danger',
    permission: 'remote-storage:delete',
  },
]
const TABLE_BUTTON_FALLBACK = [
  {
    name: '编辑',
    type: 'button',
    action: 'edit',
    typeColor: 'primary',
    permission: 'remote-storage:update',
  },
  {
    name: '查看',
    type: 'button',
    action: 'view',
    typeColor: 'primary',
    permission: 'remote-storage:view',
  },
  {
    name: '删除',
    type: 'button',
    action: 'delete',
    typeColor: 'danger',
    permission: 'remote-storage:delete',
  },
]
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'index', label: '#', width: 55 },
  { prop: 'name', label: '名字', width: 200, showOverflowTooltip: true },
  { prop: 'path', label: '路径', minWidth: 320, showOverflowTooltip: true },
  { type: 'slot', slot: 'actions', label: '操作', width: 180, fixed: 'right' },
]
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/remote-storage')
const loading = ref(false)
const saving = ref(false)
const items = ref([])
const keyword = ref('')
const selected = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('add')
const editingKey = ref(null)
const formRef = ref()
const form = reactive({ name: '', path: '' })
const rules = {
  name: [{ required: true, message: '请输入名字', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路径', trigger: 'blur' }],
}
const dialogTitle = computed(
  () => ({ add: '新增远程连接', edit: '编辑远程连接', view: '查看远程连接' })[dialogMode.value],
)
const resolvedSearchItems = computed(() =>
  searchItems.value.length ? searchItems.value : SEARCH_FALLBACK,
)
const resolvedButtons = computed(() =>
  buttonItems.value.length ? buttonItems.value : BUTTON_FALLBACK,
)
const resolvedTableButtons = computed(() =>
  tableButtonItems.value.length ? tableButtonItems.value : TABLE_BUTTON_FALLBACK,
)
const filteredItems = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return items.value
  return items.value.filter(
    (item) => item.name.toLowerCase().includes(kw) || item.path.toLowerCase().includes(kw),
  )
})
let keySeed = 0
function toRow(item) {
  return { key: ++keySeed, name: String(item?.name || ''), path: String(item?.path || '') }
}
function mapToRows(map) {
  const src = map && Object.keys(map).length ? map : defaultAppConfig.storage
  return Object.entries(src).map(([name, path]) => toRow({ name, path: String(path || '') }))
}
function applySection(data) {
  const sectionItems = data?.items
  items.value = Array.isArray(sectionItems) ? sectionItems.map(toRow) : mapToRows(data)
  selected.value = []
}
function withClientBrand(payload) {
  const clientName =
    payload.app?.clients?.[APP_CLIENT_ID]?.name || payload.app?.name || defaultAppConfig.app.name
  const clientIntro = payload.app?.clients?.[APP_CLIENT_ID]?.intro ?? payload.app?.intro ?? ''
  return { ...payload, app: { ...payload.app, name: clientName, intro: clientIntro } }
}
async function loadData() {
  loading.value = true
  try {
    const res = await getSystemConfigSection('storage')
    applySection(res.data)
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}
function onQuery(query) {
  keyword.value = String(query.FuzzyWord ?? '')
}
function onReset() {
  keyword.value = ''
}
function onSelectionChange(rows) {
  selected.value = rows
}
function openDialog(mode, row) {
  dialogMode.value = mode
  editingKey.value = row ? row.key : null
  form.name = row?.name ?? ''
  form.path = row?.path ?? ''
  dialogVisible.value = true
}
function onDialogClosed() {
  formRef.value?.clearValidate()
  editingKey.value = null
}
async function persist(rows, successText) {
  const duplicated = rows.find(
    (row, idx) => rows.findIndex((it) => it.name.trim() === row.name.trim()) !== idx,
  )
  if (duplicated) {
    ElMessage.warning(`名字「${duplicated.name}」重复`)
    return false
  }
  saving.value = true
  try {
    const res = await updateSystemConfigSection('storage', {
      items: rows.map((row) => ({ name: row.name.trim(), path: row.path.trim() })),
    })
    if (res.data) {
      applySection(res.data.storage)
      applyRemoteAppConfig(withClientBrand(res.data))
    } else {
      items.value = rows
    }
    selected.value = []
    ElMessage.success(successText)
    return true
  } catch (e) {
    ElMessage.error(e?.message || '保存失败')
    return false
  } finally {
    saving.value = false
  }
}
async function submitDialog() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  const name = form.name.trim()
  const path = form.path.trim()
  const key = editingKey.value
  const next = items.value.map((item) => ({ ...item }))
  if (key == null) {
    next.unshift(toRow({ name, path }))
  } else {
    const target = next.find((item) => item.key === key)
    if (!target) return
    target.name = name
    target.path = path
  }
  const ok = await persist(next, key == null ? '新增成功' : '修改成功')
  if (ok) dialogVisible.value = false
}
async function confirmRemove(rows) {
  if (!rows.length) {
    ElMessage.warning('请先选择要删除的数据')
    return
  }
  const label = rows.length === 1 ? rows[0].name || '该条' : `选中的 ${rows.length} 条`
  try {
    await ElMessageBox.confirm(`确认删除${label}远程连接配置？删除后即时生效`, '提示', {
      type: 'warning',
    })
  } catch {
    return
  }
  const keys = new Set(rows.map((row) => row.key))
  await persist(
    items.value.filter((item) => !keys.has(item.key)),
    '删除成功',
  )
}
function onButton(action) {
  if (action === 'add') openDialog('add')
  else if (action === 'edit' || action === 'view') {
    const row = selected.value[0]
    if (!row) {
      ElMessage.warning('请先选择一条数据')
      return
    }
    openDialog(action, row)
  } else if (action === 'delete') confirmRemove(selected.value)
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'edit') openDialog('edit', row)
  else if (payload.action === 'view') openDialog('view', row)
  else if (payload.action === 'delete') confirmRemove([row])
}
onMounted(loadData)
</script>

<style scoped>
.remote-storage-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.remote-storage-page__alert {
  flex-shrink: 0;
}
</style>
