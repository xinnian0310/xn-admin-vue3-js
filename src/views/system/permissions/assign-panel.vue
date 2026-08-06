<template>
  <div class="assign-panel">
    <div class="assign-panel__toolbar">
      <el-button v-permission="'permission-content:create'" type="primary" @click="openForm()">
        新增
      </el-button>
    </div>

    <el-table :data="items" stripe max-height="360">
      <el-table-column
        v-if="!isButtonLike"
        prop="code"
        label="编码"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column prop="name" label="名称" min-width="120" />
      <el-table-column
        v-if="type === 'API'"
        prop="path"
        label="api"
        min-width="180"
        show-overflow-tooltip
      />
      <el-table-column v-if="type === 'API'" prop="method" label="方法" width="80" />
      <el-table-column prop="sort" label="排序" width="70" />
      <el-table-column prop="builtIn" label="内置" width="70">
        <template #default="{ row }">
          <el-tag :type="row.builtIn ? 'warning' : 'info'">
            {{ row.builtIn ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            v-permission="'permission-content:table-edit'"
            link
            type="primary"
            @click="openForm(row)"
          >
            编辑
          </el-button>
          <el-button
            v-permission="'permission-content:table-delete'"
            link
            type="danger"
            :disabled="row.builtIn"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="formVisible"
      :title="editingId ? `编辑${typeLabel}` : `新增${typeLabel}`"
      width="520px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item v-if="!isButtonLike" label="编码" prop="code">
          <el-input v-model="form.code" :disabled="editingId !== null" />
        </el-form-item>
        <el-form-item v-if="isButtonLike && !editingId" label="按钮" prop="buttonAction">
          <el-select
            v-model="buttonAction"
            placeholder="请选择按钮"
            style="width: 100%"
            @change="handleButtonActionChange"
          >
            <el-option
              v-for="opt in availableStandardButtons"
              :key="opt.action"
              :label="opt.label"
              :value="opt.action"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="!isButtonLike" label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item v-else label="名称" prop="name">
          <el-input v-model="form.name" :disabled="isStandardButtonName(form.name)" />
        </el-form-item>
        <el-form-item v-if="type === 'API'" label="api" prop="path">
          <el-input v-model="form.path" placeholder="/api/roles" />
        </el-form-item>
        <el-form-item v-if="type === 'API'" label="方法" prop="method">
          <el-select v-model="form.method" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="PATCH" value="PATCH" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { create, remove, update } from '@/api/permission'
defineOptions({ name: 'PermissionAssignPanel' })
const props = defineProps({
  items: { required: true },
  type: { required: true },
  menuId: { required: true },
  buttonPrefix: { required: false },
})
const emit = defineEmits(['changed'])
// 工具栏按钮（xnButton）：新增、编辑、查看、删除
const TOOLBAR_STANDARD_BUTTONS = [
  { label: '新增', action: 'create', sort: 1 },
  { label: '编辑', action: 'update', sort: 2 },
  { label: '查看', action: 'view', sort: 3 },
  { label: '删除', action: 'delete', sort: 4 },
]
// 表格操作列纯文本按钮（xnTableActions）：查看、编辑、删除 + 扩展
const TABLE_STANDARD_BUTTONS = [
  { label: '查看', action: 'table-view', sort: 1 },
  { label: '编辑', action: 'table-edit', sort: 2 },
  { label: '删除', action: 'table-delete', sort: 3 },
  { label: '分配权限', action: 'assign', sort: 4 },
  { label: '添加子级', action: 'add-child', sort: 5 },
]
const isButtonLike = computed(() => props.type === 'BUTTON' || props.type === 'TABLE_BUTTON')
const standardButtonPool = computed(() =>
  props.type === 'TABLE_BUTTON' ? TABLE_STANDARD_BUTTONS : TOOLBAR_STANDARD_BUTTONS,
)
const BUTTON_LABEL_ACTION = computed(() =>
  Object.fromEntries(standardButtonPool.value.map((item) => [item.label, item.action])),
)
const buttonAction = computed({
  get: () => form.buttonAction ?? '',
  set: (value) => {
    form.buttonAction = value
  },
})
const typeLabels = {
  MENU: '菜单',
  BUTTON: '按钮',
  API: '接口',
  TABLE_BUTTON: '表格操作列按钮',
}
const typeLabel = computed(() => typeLabels[props.type] ?? props.type)
const availableStandardButtons = computed(() => {
  const existingActions = new Set(
    props.items.map((item) => item.code.split(':').pop()).filter(Boolean),
  )
  return standardButtonPool.value.filter((item) => !existingActions.has(item.action))
})
const formVisible = ref(false)
const submitting = ref(false)
const editingId = ref(null)
const formRef = ref()
const form = reactive({
  code: '',
  name: '',
  type: props.type,
  parentId: props.menuId,
  path: '',
  method: 'GET',
  sort: 0,
  buttonAction: '',
})
const rules = computed(() => {
  const base = {}
  if (props.type === 'API') {
    base.path = [{ required: true, message: '请输入 api', trigger: 'blur' }]
  } else if (isButtonLike.value && !editingId.value) {
    base.buttonAction = [{ required: true, message: '请选择按钮', trigger: 'change' }]
  } else if (!isButtonLike.value) {
    base.code = [{ required: true, message: '请输入编码', trigger: 'blur' }]
  }
  if (!isButtonLike.value || editingId.value) {
    base.name = [{ required: true, message: '请输入名称', trigger: 'blur' }]
  }
  return base
})
function buildApiCode(method, path) {
  return `api:${method}:${path}`
}
function buildButtonCode(action) {
  return `${props.buttonPrefix}:${action}`
}
function isStandardButtonName(name) {
  return name in BUTTON_LABEL_ACTION.value
}
function handleButtonActionChange(action) {
  const option = standardButtonPool.value.find((item) => item.action === action)
  if (!option) return
  form.name = option.label
  form.sort = option.sort
  form.code = buildButtonCode(action)
}
function resetForm() {
  form.code = ''
  form.name = ''
  form.type = props.type
  form.parentId = props.menuId
  form.path = ''
  form.method = 'GET'
  form.sort = 0
  form.buttonAction = ''
  editingId.value = null
  formRef.value?.clearValidate()
}
function openForm(row) {
  resetForm()
  if (row) {
    editingId.value = row.id
    form.code = row.code
    form.name = row.name
    form.path = row.path ?? ''
    form.method = row.method ?? 'GET'
    form.sort = row.sort ?? 0
  }
  formVisible.value = true
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = {
        ...form,
        type: props.type,
        parentId: props.menuId,
      }
      if (props.type === 'API') {
        payload.code = buildApiCode(form.method ?? 'GET', form.path ?? '')
      }
      if (isButtonLike.value && props.buttonPrefix) {
        const action =
          form.buttonAction || form.code.split(':').pop() || BUTTON_LABEL_ACTION.value[form.name]
        if (action) {
          payload.code = buildButtonCode(action)
        }
      }
      if (props.type !== 'API') {
        delete payload.method
      }
      if (isButtonLike.value) {
        delete payload.path
        delete payload.method
      }
      if (editingId.value) {
        await update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await create(payload)
        ElMessage.success('创建成功')
      }
      formVisible.value = false
      emit('changed')
    } finally {
      submitting.value = false
    }
  })
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '提示', { type: 'warning' })
  await remove(row.id)
  ElMessage.success('删除成功')
  emit('changed')
}
</script>

<style scoped>
.assign-panel__toolbar {
  margin-bottom: 12px;
}
</style>
