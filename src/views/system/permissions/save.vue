<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="560px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="编码" prop="code">
        <el-input v-model="form.code" :disabled="mode === 'view' || mode === 'edit'" />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-input model-value="菜单" disabled />
      </el-form-item>
      <el-form-item label="父节点" prop="parentId">
        <el-tree-select
          v-model="form.parentId"
          :data="parentOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          check-strictly
          clearable
          placeholder="无（顶级）"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="路径" prop="path">
        <el-input v-model="form.path" placeholder="菜单路由，如 /system/roles" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" />
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
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { create, list, update } from '@/api/permission'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'PermissionsSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const parentOptions = ref([])
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '权限'))
const form = reactive({
  code: '',
  name: '',
  type: 'MENU',
  parentId: undefined,
  path: '',
  sort: 0,
})
const rules = {
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
}
function filterMenuTree(nodes) {
  return nodes
    .filter((node) => node.type === 'MENU')
    .map((node) => ({
      ...node,
      children: node.children?.length ? filterMenuTree(node.children) : undefined,
    }))
}
function resetForm() {
  form.code = ''
  form.name = ''
  form.type = 'MENU'
  form.parentId = undefined
  form.path = ''
  form.sort = 0
  editingId.value = null
  formRef.value?.clearValidate()
}
function findPermission(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findPermission(node.children, id)
      if (found) return found
    }
  }
  return undefined
}
async function loadTree() {
  const res = await list()
  parentOptions.value = filterMenuTree(res.data)
  return res.data
}
async function open(openMode, id) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
  const tree = await loadTree()
  visible.value = true
  if (openMode !== 'add' && id) {
    const row = findPermission(tree, id)
    if (row) {
      form.code = row.code
      form.name = row.name
      form.type = row.type
      form.parentId = row.parentId ?? undefined
      form.path = row.path ?? ''
      form.sort = row.sort ?? 0
    }
  }
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...form, parentId: form.parentId || undefined }
      if (mode.value === 'edit' && editingId.value) {
        await update(editingId.value, payload)
        ElMessage.success('更新成功')
      } else {
        await create(payload)
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
