<template>
  <xnPageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    @page-change="applyLocalPage"
    @refresh="loadData"
  >
    <template #aside>
      <xnTreePanel
        ref="menuTreeRef"
        title="菜单"
        v-model:filter="menuKeyword"
        filter-placeholder="搜索菜单名称"
        :data="menuTree"
        :tree-props="{ label: 'name', children: 'children', disabled: 'disabled' }"
        :current-key="selectedRouteId ?? undefined"
        @node-click="onMenuClick"
      >
        <template #node="{ data }">
          <span class="menu-node" :class="{ 'is-disabled': data.disabled }">
            <span class="menu-node__name">{{ data.name }}</span>
            <el-tag
              v-if="!data.permissionControl && data.type === 'MENU'"
              type="info"
              effect="plain"
            >
              未控权
            </el-tag>
            <el-tag v-else-if="data.childCount" type="info" effect="plain">
              {{ data.childCount }}
            </el-tag>
          </span>
        </template>
      </xnTreePanel>
    </template>

    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>

    <template #toolbar>
      <xnButton :list-item="toolbarButtons" :selected="selected" @button-click="buttonClick" />
    </template>

    <template #toolbar-extra>
      <el-radio-group v-if="selectedMenu" v-model="activeType">
        <el-radio-button v-for="tab in tabs" :key="tab.type" :value="tab.type">
          {{ tab.label }}
          <el-badge
            v-if="groups[tab.type].length"
            :value="groups[tab.type].length"
            type="info"
            class="perm-content__tab-badge"
          />
        </el-radio-button>
      </el-radio-group>
    </template>

    <template #table>
      <el-alert
        v-if="selectedRoute && !selectedMenu"
        type="warning"
        :closable="false"
        show-icon
        title="该路由尚未关联权限标识，请先在路由管理中保存以自动生成后再配置子权限。"
        class="perm-content__alert"
      />
      <el-empty
        v-else-if="!selectedRoute"
        class="perm-content__empty"
        description="请从左侧选择一个菜单，管理其接口 / 按钮权限"
        :image-size="120"
      />
      <xnTable
        v-else
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:permissions-content"
        entity-name="权限"
        name-field="name"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
        @refresh="loadData"
      >
        <template #icon="{ row }">
          <xnAppIcon v-if="row.icon" :name="row.icon" />
          <span v-else>-</span>
        </template>
        <template #action="{ row }">
          <code v-if="row.action" class="perm-content__mono">{{ row.action }}</code>
          <span v-else>-</span>
        </template>
        <template #buttonColor="{ row }">
          <el-button v-if="row.buttonColor" :type="buttonTypeOf(row.buttonColor)">
            {{ row.name || '示例' }}
          </el-button>
          <span v-else>-</span>
        </template>
        <template #code="{ row }">
          <code class="perm-content__mono">{{ row.code }}</code>
        </template>
        <template #method="{ row }">
          <el-tag :type="methodTagType(row.method)">{{ row.method || '-' }}</el-tag>
        </template>
        <template #path="{ row }">
          <code class="perm-content__mono">{{ row.path }}</code>
        </template>
        <template #builtIn="{ row }">
          <el-tag v-if="row.builtIn" type="warning">内置</el-tag>
          <span v-else>-</span>
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
  </xnPageLayout>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px" @closed="resetForm">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="归属菜单">
        <el-input :model-value="selectedRoute?.title" disabled />
      </el-form-item>
      <el-form-item label="权限类型">
        <el-radio-group v-if="!isEdit" v-model="form.type" @change="onTypeChange">
          <el-radio-button v-for="tab in tabs" :key="tab.type" :value="tab.type">
            {{ tab.label }}
          </el-radio-button>
        </el-radio-group>
        <el-tag v-else :type="typeTagType(form.type)">{{ typeLabel(form.type) }}</el-tag>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="如：新增、导出、用户列表接口"
          @change="onNameChange"
        />
      </el-form-item>
      <template v-if="isButtonType">
        <el-form-item label="动作标识" prop="action">
          <el-input
            v-model="form.action"
            placeholder="英文，如：add / edit / view / delete / assign"
            @input="syncCodeFromForm"
          />
          <div class="perm-content__form-tip">
            用英文动作生成权限编码，并匹配前端处理函数（如 buttonClick('edit')）
          </div>
        </el-form-item>
        <el-form-item label="图标">
          <xnIconPicker v-model="form.icon" placeholder="选择按钮图标(可留空)" />
        </el-form-item>
        <el-form-item label="按钮颜色">
          <el-select v-model="form.buttonColor" placeholder="选择颜色" style="width: 160px">
            <template #label>
              <el-button v-if="form.buttonColor" :type="buttonTypeOf(form.buttonColor)">
                {{ form.name || '示例' }}
              </el-button>
            </template>
            <el-option v-for="c in buttonColors" :key="c.value" :label="c.label" :value="c.value">
              <el-button :type="buttonTypeOf(c.value)">
                {{ form.name || '示例' }}
              </el-button>
            </el-option>
          </el-select>
        </el-form-item>
      </template>
      <template v-if="form.type === 'API'">
        <el-form-item label="请求方法" prop="method">
          <el-select
            v-model="form.method"
            placeholder="选择方法"
            :disabled="editingBuiltIn"
            @change="syncCodeFromForm"
          >
            <el-option v-for="m in methods" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口路径" prop="path">
          <el-input
            v-model="form.path"
            placeholder="如：/api/users/{id}"
            :disabled="editingBuiltIn"
            @input="syncCodeFromForm"
          />
        </el-form-item>
      </template>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" />
      </el-form-item>
      <div v-if="editingBuiltIn" class="perm-content__form-tip perm-content__form-tip--warn">
        内置权限的路径 / 方法不可修改，仅可调整名称与排序。
      </div>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnTreePanel from '@/components/xnTreePanel/xnTreePanel.vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import xnIconPicker from '@/components/xnIconPicker/xnIconPicker.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import { create, list as listPermissions, remove, update } from '@/api/permission'
import { list as listRoutes } from '@/api/route'
defineOptions({ name: 'PermissionContent' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/permissions-content')
/** 工具栏仅使用权限内容里的「新增」按钮：permission-content:create */
const toolbarButtons = computed(() =>
  buttonItems.value.filter((item) => item.action === 'add' || item.action === 'create'),
)
const tabs = [
  { type: 'BUTTON', label: '按钮权限' },
  { type: 'TABLE_BUTTON', label: '表格按钮' },
  { type: 'API', label: '接口权限' },
]
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const buttonColors = [
  { label: '主要', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
  { label: '信息', value: 'info' },
  { label: '默认', value: 'default' },
]
function buttonTypeOf(color) {
  if (!color || color === 'default') return undefined
  return color
}
const typeLabels = {
  MENU: '菜单',
  BUTTON: '按钮',
  TABLE_BUTTON: '表格按钮',
  API: '接口',
}
const loading = ref(false)
const menuKeyword = ref('')
const routeTree = ref([])
const selectedRouteId = ref(null)
const activeType = ref('BUTTON')
const menuTreeRef = ref()
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editingRow = ref(null)
const submitting = ref(false)
const formRef = ref()
const form = ref(emptyForm())
const permissionById = new Map()
const permissionByCode = new Map()
const routeById = new Map()
function emptyForm() {
  return {
    code: '',
    name: '',
    type: 'BUTTON',
    parentId: null,
    path: '',
    method: 'GET',
    action: '',
    icon: '',
    buttonColor: 'primary',
    sort: 0,
  }
}
const isButtonType = computed(
  () => form.value.type === 'BUTTON' || form.value.type === 'TABLE_BUTTON',
)
const menuTree = computed(() => toMenuNodes(routeTree.value))
const selectedRoute = computed(() =>
  selectedRouteId.value != null ? (routeById.get(selectedRouteId.value) ?? null) : null,
)
const selectedMenu = computed(() => {
  const code = selectedRoute.value?.permission
  return code ? (permissionByCode.get(code) ?? null) : null
})
const groups = computed(() => {
  const result = {
    BUTTON: [],
    TABLE_BUTTON: [],
    API: [],
  }
  for (const child of selectedMenu.value?.children ?? []) {
    if (child.type === 'BUTTON') result.BUTTON.push(child)
    else if (child.type === 'TABLE_BUTTON') result.TABLE_BUTTON.push(child)
    else if (child.type === 'API') result.API.push(child)
  }
  Object.keys(result).forEach((key) => {
    result[key].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
  })
  return result
})
const columns = computed(() => {
  const cols = [{ prop: 'name', label: '名称', minWidth: 150 }]
  if (activeType.value !== 'API') {
    cols.push(
      { type: 'slot', slot: 'icon', prop: 'icon', label: '图标', width: 70 },
      { type: 'slot', slot: 'action', prop: 'action', label: '动作', minWidth: 110 },
      { type: 'slot', slot: 'buttonColor', prop: 'buttonColor', label: '按钮颜色', minWidth: 100 },
    )
  }
  cols.push({ type: 'slot', slot: 'code', prop: 'code', label: '权限编码', minWidth: 240 })
  if (activeType.value === 'API') {
    cols.push(
      { type: 'slot', slot: 'method', prop: 'method', label: '方法', width: 90 },
      { type: 'slot', slot: 'path', prop: 'path', label: '接口路径', minWidth: 220 },
    )
  }
  cols.push(
    { prop: 'sort', label: '排序', width: 80 },
    { type: 'slot', slot: 'builtIn', prop: 'builtIn', label: '内置', width: 80 },
    { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
  )
  return cols
})
const editingBuiltIn = computed(() => isEdit.value && !!editingRow.value?.builtIn)
const dialogTitle = computed(() => `${isEdit.value ? '编辑' : '新增'}${typeLabel(form.value.type)}`)
const menuPrefix = computed(() => {
  const code = selectedMenu.value?.code
  if (!code) return ''
  const parts = code.split(':').filter(Boolean)
  return parts[parts.length - 1] || ''
})
function selectionChangeHandle(rows) {
  selected.value = rows
}
function applyLocalPage() {
  const kw = String(queryForm.value.FuzzyWord ?? '')
    .trim()
    .toLowerCase()
  let rows = groups.value[activeType.value] ?? []
  if (kw) {
    rows = rows.filter((r) =>
      [r.name, r.code, r.action, r.path]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(kw)),
    )
  }
  total.value = rows.length
  const start = (page.value - 1) * size.value
  tableData.value = rows.slice(start, start + size.value)
}
watch([activeType, selectedMenu], () => {
  page.value = 1
  applyLocalPage()
})
function normalizeActionEnglish(action) {
  return action
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
}
function normalizeApiPath(path) {
  const trimmed = path.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
function buildAutoCode() {
  if (form.value.type === 'API') {
    const method = (form.value.method || 'GET').toUpperCase()
    const path = normalizeApiPath(form.value.path || '')
    if (!path) return ''
    return `api:${method}:${path}`
  }
  const prefix = menuPrefix.value
  let action = normalizeActionEnglish(form.value.action || '')
  if (!prefix || !action) return ''
  if (form.value.type === 'TABLE_BUTTON') {
    if (action === 'edit' || action === 'update') action = 'table-edit'
    else if (action === 'view') action = 'table-view'
    else if (action === 'delete') action = 'table-delete'
    else if (action === 'add' || action === 'create') action = 'table-add'
  }
  return `${prefix}:${action}`
}
function syncCodeFromForm() {
  if (isEdit.value) return
  form.value.code = buildAutoCode()
}
/** 当前菜单下指定类型的下一个排序（max + 1，至少为 1） */
function nextSort(type) {
  const list = groups.value[type] ?? []
  if (!list.length) return 1
  return Math.max(...list.map((item) => item.sort ?? 0)) + 1
}

/** 切换类型后按钮/接口字段互斥，清掉上一类型残留的校验提示 */
function onTypeChange() {
  formRef.value?.clearValidate(['action', 'method', 'path'])
  if (!isEdit.value) form.value.sort = nextSort(form.value.type)
  syncCodeFromForm()
}
function onNameChange() {
  if (isEdit.value || !isButtonType.value || form.value.action) return
  const name = form.value.name.trim()
  const nameActionMap = {
    新增: 'add',
    编辑: 'edit',
    查看: 'view',
    删除: 'delete',
    分配权限: 'assign',
    分配: 'assign',
    添加子级: 'add-child',
  }
  const action = nameActionMap[name]
  if (action) {
    form.value.action = action
    if (name === '删除') form.value.buttonColor = 'danger'
    syncCodeFromForm()
  }
}
watch(
  () => [form.value.type, form.value.action, form.value.method, form.value.path, menuPrefix.value],
  () => {
    if (dialogVisible.value && !isEdit.value) syncCodeFromForm()
  },
)
const rules = computed(() => ({
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '权限编码将自动生成', trigger: 'change' }],
  action:
    form.value.type === 'BUTTON' || form.value.type === 'TABLE_BUTTON'
      ? [{ required: true, message: '请输入动作标识', trigger: 'blur' }]
      : [],
  method:
    form.value.type === 'API'
      ? [{ required: true, message: '请选择请求方法', trigger: 'change' }]
      : [],
  path:
    form.value.type === 'API'
      ? [{ required: true, message: '请输入接口路径', trigger: 'blur' }]
      : [],
}))
function toMenuNodes(nodes) {
  return [...nodes]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((node) => {
      const code = node.permission || undefined
      const linked = code ? permissionByCode.get(code) : undefined
      const childCount = (linked?.children ?? []).filter((c) => c.type !== 'MENU').length
      const permissionControl = !!node.permissionControl
      const disabled = !(node.type === 'MENU' && permissionControl)
      return {
        id: node.id,
        name: node.title,
        code,
        type: node.type,
        permissionControl,
        disabled,
        childCount,
        children: node.children?.length ? toMenuNodes(node.children) : [],
      }
    })
}
function indexPermissions(nodes) {
  for (const node of nodes) {
    permissionById.set(node.id, node)
    if (node.code) permissionByCode.set(node.code, node)
    if (node.children?.length) indexPermissions(node.children)
  }
}
function indexRoutes(nodes) {
  for (const node of nodes) {
    routeById.set(node.id, node)
    if (node.children?.length) indexRoutes(node.children)
  }
}
function typeLabel(type) {
  return typeLabels[type] ?? type
}
function typeTagType(type) {
  switch (type) {
    case 'API':
      return 'success'
    case 'BUTTON':
      return 'primary'
    case 'TABLE_BUTTON':
      return 'warning'
    default:
      return 'info'
  }
}
function methodTagType(method) {
  switch (method) {
    case 'GET':
      return 'success'
    case 'POST':
      return 'primary'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'info'
  }
}
function onMenuClick(data) {
  if (data.disabled) return
  selectedRouteId.value = Number(data.id)
  page.value = 1
  queryForm.value = {}
  nextTick(applyLocalPage)
}
function firstSelectableRouteId(nodes) {
  for (const node of nodes) {
    if (!node.disabled) return node.id
    const childMatch = firstSelectableRouteId(node.children)
    if (childMatch != null) return childMatch
  }
  return null
}
async function loadData(preserveSelection = false) {
  loading.value = true
  try {
    const [routeRes, permRes] = await Promise.all([listRoutes(), listPermissions()])
    routeTree.value = routeRes.data
    routeById.clear()
    indexRoutes(routeRes.data)
    permissionById.clear()
    permissionByCode.clear()
    indexPermissions(permRes.data)
    if (
      !preserveSelection ||
      selectedRouteId.value == null ||
      !routeById.has(selectedRouteId.value) ||
      !routeById.get(selectedRouteId.value)?.permissionControl
    ) {
      selectedRouteId.value = firstSelectableRouteId(menuTree.value)
    }
    await nextTick()
    if (selectedRouteId.value != null) menuTreeRef.value?.setCurrentKey(selectedRouteId.value)
    applyLocalPage()
  } finally {
    loading.value = false
  }
}
function openCreate(type) {
  if (!selectedMenu.value) return
  isEdit.value = false
  editingRow.value = null
  form.value = {
    ...emptyForm(),
    type,
    parentId: selectedMenu.value.id,
    sort: nextSort(type),
  }
  dialogVisible.value = true
  nextTick(() => syncCodeFromForm())
}
function openEdit(row) {
  isEdit.value = true
  editingRow.value = row
  form.value = {
    code: row.code,
    name: row.name,
    type: row.type,
    parentId: row.parentId ?? selectedMenu.value?.id ?? null,
    path: row.path ?? '',
    method: row.method ?? 'GET',
    action: row.action ?? '',
    icon: row.icon ?? '',
    buttonColor: row.buttonColor ?? 'primary',
    sort: row.sort ?? 0,
  }
  dialogVisible.value = true
}
function resetForm() {
  formRef.value?.clearValidate()
  form.value = emptyForm()
  isEdit.value = false
  editingRow.value = null
}
async function buttonClick(action) {
  if (action === 'add' || action === 'create') openCreate(activeType.value)
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'edit' || payload.action === 'view') openEdit(row)
  else if (payload.action === 'delete') handleDelete(row)
}
function tableActionDisabled(action, row) {
  if (action === 'delete' && row.builtIn) return true
  return false
}
async function handleSubmit() {
  if (!formRef.value) return
  if (!isEdit.value) {
    syncCodeFromForm()
    if (!form.value.code) {
      ElMessage.warning(
        form.value.type === 'API' ? '请填写接口路径以生成权限编码' : '请填写动作标识以生成权限编码',
      )
      return
    }
  }
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = { ...form.value }
    if (payload.type === 'API') {
      payload.path = normalizeApiPath(payload.path || '')
      payload.method = (payload.method || 'GET').toUpperCase()
    } else {
      payload.path = undefined
      payload.method = undefined
    }
    if (payload.type !== 'BUTTON' && payload.type !== 'TABLE_BUTTON') {
      payload.action = undefined
      payload.icon = undefined
      payload.buttonColor = undefined
    }
    if (isEdit.value && editingRow.value) {
      await update(editingRow.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await create(payload)
      ElMessage.success('新增成功')
      activeType.value = payload.type
    }
    dialogVisible.value = false
    await loadData(true)
  } finally {
    submitting.value = false
  }
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除权限「${row.name}」吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消',
  })
  await remove(row.id)
  ElMessage.success('删除成功')
  await loadData(true)
}
function inquires(formData) {
  queryForm.value = formData
  page.value = 1
  applyLocalPage()
}
function reset() {
  queryForm.value = {}
  page.value = 1
  applyLocalPage()
}
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.menu-node {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  overflow: hidden;
}

.menu-node.is-disabled .menu-node__name {
  color: #c0c4cc;
}

.menu-node__name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.perm-content__alert {
  margin: 16px;
}

.perm-content__tab-badge {
  margin-left: 4px;
}

.perm-content__mono {
  font-family: monospace;
  font-size: var(--app-font-size-main);
  color: #606266;
}

.perm-content__empty {
  margin: auto;
}

.perm-content__form-tip {
  font-size: var(--app-font-size-main);
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.perm-content__form-tip--warn {
  color: #e6a23c;
  padding-left: 90px;
}
</style>
