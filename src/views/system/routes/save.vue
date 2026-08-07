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
      :title="tipTitle"
      :description="tipDescription"
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
        <el-cascader
          v-model="typePath"
          :options="typeOptions"
          :disabled="mode === 'view' || editingBuiltIn"
          :props="{ expandTrigger: 'hover' }"
          placeholder="请选择类型"
          style="width: 100%"
        />
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
      <el-form-item v-if="form.type === 'LINK'" label="外部链接" prop="linkUrl">
        <el-input v-model="form.linkUrl" placeholder="www.baidu.com 或 https://example.com" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <xnIconPicker
          v-model="form.icon"
          :disabled="mode === 'view'"
          placeholder="选择 Element / Iconify / SVG 图标"
        />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="0">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="隐藏菜单" prop="hidden">
            <el-switch v-model="form.hidden" />
          </el-form-item>
        </el-col>
        <el-col v-if="form.type === 'MENU'" :span="12">
          <el-form-item label="权限控制" prop="permissionControl">
            <el-switch v-model="form.permissionControl" />
            <span class="form-tip-inline">开启后需分配菜单权限</span>
          </el-form-item>
        </el-col>
        <el-col v-if="form.type === 'MENU' || form.type === 'LINK'" :span="12">
          <el-form-item label="固定标签" prop="affix">
            <el-switch v-model="form.affix" />
          </el-form-item>
        </el-col>
      </el-row>
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

/** 一级：本地页面 / 外部链接；二级仅本地页面下有目录、菜单 */
const typeOptions = [
  {
    value: 'local',
    label: '本地页面',
    children: [
      { value: 'DIR', label: '目录' },
      { value: 'MENU', label: '菜单' },
    ],
  },
  { value: 'LINK', label: '外部链接' },
]

const typePath = computed({
  get() {
    if (form.type === 'LINK') return ['LINK']
    if (form.type === 'DIR' || form.type === 'MENU') return ['local', form.type]
    return []
  },
  set(val) {
    if (!val?.length) return
    const leaf = val[val.length - 1]
    if (leaf === 'DIR' || leaf === 'MENU' || leaf === 'LINK') {
      form.type = leaf
    }
  },
})

const tipTitle = computed(() =>
  form.type === 'LINK' ? '外部链接内嵌规则' : '路径与视图对应规则',
)

const tipDescription = computed(() => {
  if (form.type === 'LINK') {
    return '填写外部网址后，将在主内容区以 iframe 内嵌打开。未写协议时默认补全为 https://。系统访问路径由后端自动生成。部分站点禁止被嵌套时页面可能空白。'
  }
  return '访问路径可写 system/roles 或 /system/roles（缺省会自动补 /），对应 views/system/roles/index.vue。视图目录随路径自动生成，不可编辑。菜单类型可带下级；目录仅作分组。权限标识由系统自动生成。'
})

const form = reactive({
  title: '',
  path: '',
  viewPath: '',
  linkUrl: '',
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
  linkUrl: [
    {
      validator: (_rule, value, callback) => {
        if (form.type === 'LINK' && !String(value ?? '').trim()) {
          callback(new Error('请填写外部链接'))
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
  if (form.type !== 'MENU') return
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
  if (form.type === 'MENU') {
    form.viewPath = autoViewPath(normalized)
  }
}

function normalizeLinkUrl(url) {
  const cleaned = url.trim()
  if (!cleaned) return ''
  if (cleaned.startsWith('//')) return `https:${cleaned}`
  if (!/^[a-z][a-z0-9+.-]*:/i.test(cleaned)) return `https://${cleaned}`
  return cleaned
}

watch(
  () => form.path,
  () => {
    if (form.type === 'MENU') {
      syncViewPath()
    }
  },
)

watch(
  () => form.type,
  (type) => {
    if (type === 'DIR') {
      form.path = ''
      form.viewPath = ''
      form.linkUrl = ''
    } else if (type === 'LINK') {
      // 新建时不展示路径；编辑时保留已有 path 供提交
      if (mode.value === 'add') {
        form.path = ''
      }
      form.viewPath = ''
      form.permissionControl = false
    } else if (type === 'MENU') {
      form.linkUrl = ''
      syncViewPath()
    }
  },
)

function resetForm() {
  form.title = ''
  form.path = ''
  form.viewPath = ''
  form.linkUrl = ''
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
  form.linkUrl = data.linkUrl ?? ''
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

    let normalizedPath
    if (form.type === 'MENU') {
      normalizedPath = normalizeRoutePath(form.path ?? '')
    } else if (form.type === 'LINK' && form.path?.trim()) {
      // 编辑时保留已有访问路径；新建由后端根据外链自动生成
      normalizedPath = normalizeRoutePath(form.path)
    }

    const viewPath =
      form.type === 'MENU' && normalizedPath ? autoViewPath(normalizedPath) : undefined
    const linkUrl = form.type === 'LINK' ? normalizeLinkUrl(form.linkUrl ?? '') : undefined

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
        linkUrl,
        permissionControl: form.type === 'MENU' ? form.permissionControl : false,
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

.form-tip-inline {
  margin-left: 8px;
  font-size: var(--app-font-size-main);
  color: #909399;
  white-space: nowrap;
}
</style>
