<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-alert
      class="route-tip"
      type="info"
      :closable="false"
      show-icon
      title="路径与视图对应规则"
      description="访问路径可写 system/roles 或 /system/roles（缺省会自动补 /），对应 views/system/roles/index.vue。视图目录随路径自动生成，不可编辑。菜单类型可带下级；目录仅作分组。权限标识由系统自动生成。"
    />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-radio-group v-model="form.type" :disabled="mode === 'view' || editingBuiltIn">
          <el-radio value="DIR">目录</el-radio>
          <el-radio value="MENU">菜单</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="父节点" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentOptions"
          :props="{ label: 'title', value: 'id', children: 'children' }"
          check-strictly
          clearable
          placeholder="无（顶级）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item v-if="form.type === 'MENU'" label="访问路径" prop="path">
        <el-input
          v-model="form.path"
          placeholder="system/roles"
          @blur="normalizePathInput"
          @input="syncViewPath"
        >
          <template #prepend>/</template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="form.type === 'MENU'" label="视图目录" prop="viewPath">
        <el-input :model-value="form.viewPath" disabled placeholder="system/roles">
          <template #prepend>views/</template>
          <template #append>/index.vue</template>
        </el-input>
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <xnIconPicker
          v-model="form.icon"
          :disabled="mode === 'view'"
          placeholder="选择 Element / Iconify / SVG 图标"
        />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="隐藏菜单" prop="hidden">
        <el-switch v-model="form.hidden" />
      </el-form-item>
      <el-form-item v-if="form.type === 'MENU'" label="权限控制" prop="permissionControl">
        <div>
          <el-switch v-model="form.permissionControl" />
          <div class="form-tip">开启后，仅拥有对应菜单权限的用户可访问；关闭则登录用户均可访问</div>
        </div>
      </el-form-item>
      <el-form-item v-if="form.type === 'MENU'" label="固定标签" prop="affix">
        <el-switch v-model="form.affix" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" :loading="submitting" @click="handleSubmit"
        >保存</el-button
      >
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCrudApi } from '@/composables/useCrudApi'
import xnIconPicker from '@/components/xnIconPicker/xnIconPicker.vue'
import { autoViewPath, normalizeRoutePath } from '@/utils/route-path'
import { hasIndexView } from '@/utils/view-loader'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'RoutesSave' })
const emit = defineEmits(['success'])
const api = useCrudApi()
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const editingBuiltIn = ref(false)
const parentOptions = ref([])
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '路由'))
const form = reactive({
  title: '',
  path: '',
  viewPath: '',
  icon: '',
  permission: '',
  parentId: undefined,
  type: 'MENU',
  sort: 0,
  status: 1,
  hidden: false,
  affix: false,
  permissionControl: false,
})
const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  path: [
    {
      validator: (_rule, value, callback) => {
        if (form.type === 'MENU' && !String(value ?? '').trim()) {
          callback(new Error('菜单必须填写访问路径'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}
/** 输入框展示时去掉前导 /（已由 prepend 展示） */
function pathForInput(path) {
  return path.replace(/^\//, '')
}
function syncViewPath() {
  const normalized = normalizeRoutePath(form.path ?? '')
  form.viewPath = normalized ? autoViewPath(normalized) : ''
}
function normalizePathInput() {
  if (!form.path?.trim()) {
    form.path = ''
    form.viewPath = ''
    return
  }
  const normalized = normalizeRoutePath(form.path)
  form.path = pathForInput(normalized)
  form.viewPath = autoViewPath(normalized)
}
watch(
  () => form.path,
  () => {
    if (form.type === 'MENU') {
      syncViewPath()
    }
  },
)
function resetForm() {
  form.title = ''
  form.path = ''
  form.viewPath = ''
  form.icon = ''
  form.permission = ''
  form.parentId = undefined
  form.type = 'MENU'
  form.sort = 0
  form.status = 1
  form.hidden = false
  form.affix = false
  form.permissionControl = false
  editingId.value = null
  editingBuiltIn.value = false
  formRef.value?.clearValidate()
}
async function loadTree() {
  const res = await api.list()
  parentOptions.value = res.data
}
async function loadDetail(id) {
  const res = await api.get(id)
  const data = res.data
  editingBuiltIn.value = data.builtIn
  form.title = data.title
  form.path = pathForInput(data.path ?? '')
  form.viewPath = data.viewPath || autoViewPath(data.path ?? '')
  form.icon = data.icon ?? ''
  form.permission = data.permission ?? ''
  form.parentId = data.parentId ?? undefined
  form.type = data.type
  form.sort = data.sort
  form.status = data.status
  form.hidden = data.hidden
  form.affix = data.affix
  form.permissionControl = !!data.permissionControl
}
async function open(openMode, id, options) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
  await loadTree()
  visible.value = true
  if (openMode === 'add' && options?.parentId) {
    form.parentId = options.parentId
    form.type = 'MENU'
  } else if (openMode !== 'add' && id) {
    await loadDetail(id)
  }
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const normalizedPath = form.type === 'MENU' ? normalizeRoutePath(form.path ?? '') : undefined
    const viewPath = normalizedPath ? autoViewPath(normalizedPath) : undefined
    if (form.type === 'MENU' && normalizedPath && !hasIndexView(normalizedPath)) {
      ElMessage.warning(`views/${viewPath}/index.vue 尚未创建，请先创建对应页面文件`)
    }
    submitting.value = true
    try {
      const payload = {
        ...form,
        parentId: form.parentId || undefined,
        path: normalizedPath,
        viewPath,
      }
      if (mode.value === 'edit' && editingId.value) {
        await api.update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await api.create(payload)
        ElMessage.success('创建成功')
      }
      visible.value = false
      emit('success')
    } finally {
      submitting.value = false
    }
  })
}
function handleClosed() {
  resetForm()
}
defineExpose({ open })
</script>

<style scoped>
.route-tip {
  margin-bottom: 16px;
}

.form-tip {
  font-size: var(--app-font-size-main);
  color: #909399;
  line-height: 1.4;
  margin-top: 4px;
}
</style>
