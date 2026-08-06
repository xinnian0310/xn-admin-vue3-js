<template>
  <el-dialog
    v-model="visible"
    title="代码生成"
    width="720px"
    destroy-on-close
    @closed="handleClosed"
  >
    <template v-if="!result">
      <el-alert
        class="codegen-tip"
        type="info"
        :closable="false"
        show-icon
        title="生成标准 CRUD 脚手架（编码/名称/排序/状态/备注）"
      >
        <ol class="codegen-steps">
          <li>生成后下载 ZIP（不会自动写入工程目录）</li>
          <li>按包内路径拷到前后端对应目录（见 README.md）</li>
          <li>重启 xn-system（开发环境 Entity 会自动建表）</li>
          <li>刷新浏览器打开本菜单即可试用；再按业务改字段</li>
        </ol>
        <div>默认会将权限写入数据库并授予超管/管理员。</div>
      </el-alert>

      <el-descriptions v-if="route" :column="1" border class="codegen-meta" size="small">
        <el-descriptions-item label="菜单">{{ route.title }}</el-descriptions-item>
        <el-descriptions-item label="路径">{{ route.path }}</el-descriptions-item>
        <el-descriptions-item label="视图"
          >views/{{ route.viewPath }}/index.vue</el-descriptions-item
        >
      </el-descriptions>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="codegen-form">
        <el-form-item label="模块前缀" prop="modulePrefix">
          <el-input
            v-model="form.modulePrefix"
            placeholder="如 order、dict-type"
            @blur="syncApiFromPrefix"
          />
          <div class="form-tip">权限码前缀，如 order:create、order:table-edit</div>
        </el-form-item>
        <el-form-item label="API 路径" prop="apiBasePath">
          <el-input
            v-model="form.apiBasePath"
            placeholder="/api/orders"
            @input="apiTouched = true"
          />
        </el-form-item>
        <el-form-item label="权限落库">
          <el-switch v-model="form.persistPermissions" />
          <div class="form-tip">默认开启：写入 BUTTON / TABLE_BUTTON / API 并挂到当前菜单下</div>
        </el-form-item>
        <el-form-item label="PageUi 搜索">
          <el-switch v-model="form.generatePageUi" />
          <div class="form-tip">写入综合查询占位配置（已有配置不会覆盖）</div>
        </el-form-item>
      </el-form>
    </template>

    <template v-else>
      <el-alert
        type="success"
        :closable="false"
        show-icon
        :title="`生成完成：新写入 ${result.persistedPermissionCount} 条权限${result.pageUiPersisted ? '，已写入 PageUi' : ''}`"
      />
      <div class="codegen-codes">
        <el-tag
          v-for="code in result.permissionCodes"
          :key="code"
          size="small"
          class="codegen-code-tag"
        >
          {{ code }}
        </el-tag>
      </div>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="SQL" name="sql">
          <el-input :model-value="result.sql" type="textarea" :rows="14" readonly />
        </el-tab-pane>
        <el-tab-pane
          v-for="file in result.files"
          :key="file.path"
          :label="fileLabel(file.path)"
          :name="file.path"
        >
          <div class="file-path">{{ file.path }}</div>
          <el-input :model-value="file.content" type="textarea" :rows="14" readonly />
        </el-tab-pane>
      </el-tabs>
    </template>

    <template #footer>
      <template v-if="!result">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">生成</el-button>
      </template>
      <template v-else>
        <el-button @click="visible = false">关闭</el-button>
        <el-button @click="copyCurrent">复制当前</el-button>
        <el-button type="primary" @click="downloadZip">下载 ZIP</el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generate } from '@/api/route'
defineOptions({ name: 'RoutesCodegen' })
const visible = ref(false)
const submitting = ref(false)
const route = ref(null)
const result = ref(null)
const activeTab = ref('sql')
const formRef = ref()
const apiTouched = ref(false)
const form = reactive({
  modulePrefix: '',
  apiBasePath: '',
  persistPermissions: true,
  generatePageUi: true,
})
const rules = {
  modulePrefix: [{ required: true, message: '请填写模块前缀', trigger: 'blur' }],
  apiBasePath: [{ required: true, message: '请填写 API 路径', trigger: 'blur' }],
}
function defaultPrefix(path) {
  if (!path) return 'module'
  const cleaned = path.replace(/^\//, '')
  const last = cleaned.split('/').filter(Boolean).pop() || 'module'
  return last.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
}
function syncApiFromPrefix() {
  if (apiTouched.value) return
  const prefix = form.modulePrefix.trim()
  if (prefix) form.apiBasePath = `/api/${prefix}`
}
function fileLabel(path) {
  const name = path.split('/').pop() || path
  return name.length > 18 ? `${name.slice(0, 16)}…` : name
}
function open(row) {
  route.value = row
  result.value = null
  activeTab.value = 'sql'
  apiTouched.value = false
  form.modulePrefix = defaultPrefix(row.path)
  form.apiBasePath = `/api/${form.modulePrefix}`
  form.persistPermissions = true
  form.generatePageUi = true
  visible.value = true
}
async function handleSubmit() {
  if (!formRef.value || !route.value?.id) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const res = await generate(route.value.id, {
        modulePrefix: form.modulePrefix.trim(),
        apiBasePath: form.apiBasePath.trim(),
        persistPermissions: form.persistPermissions,
        generatePageUi: form.generatePageUi,
      })
      result.value = res.data
      activeTab.value = 'sql'
      ElMessage.success('生成成功')
    } finally {
      submitting.value = false
    }
  })
}
function currentContent() {
  if (!result.value) return ''
  if (activeTab.value === 'sql') return result.value.sql
  return result.value.files.find((f) => f.path === activeTab.value)?.content ?? ''
}
async function copyCurrent() {
  const text = currentContent()
  if (!text) {
    ElMessage.warning('无可复制内容')
    return
  }
  await navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}
function downloadZip() {
  if (!result.value?.zipBase64) {
    ElMessage.warning('无可下载内容')
    return
  }
  const binary = atob(result.value.zipBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `codegen-${result.value.modulePrefix}.zip`
  a.click()
  URL.revokeObjectURL(url)
}
function handleClosed() {
  route.value = null
  result.value = null
  formRef.value?.clearValidate()
}
defineExpose({ open })
</script>

<style scoped>
.codegen-tip {
  margin-bottom: 16px;
}

.codegen-steps {
  margin: 8px 0;
  padding-left: 18px;
  line-height: 1.7;
}

.codegen-meta {
  margin-bottom: 16px;
}

.codegen-form {
  margin-top: 8px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
}

.codegen-codes {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}

.codegen-code-tag {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.file-path {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--app-text-muted);
  word-break: break-all;
}
</style>
