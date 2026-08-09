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
      label-width="80px"
      :disabled="mode === 'view'"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          :disabled="mode === 'view' || (editingId !== null && (form.username === 'admin' || form.username === 'SuperAdmin'))"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          :placeholder="editingId ? '留空则不修改密码' : '请输入密码'"
        />
        <div class="form-tip">{{ editingId ? `修改时须符合策略：${pwdTip}` : pwdTip }}</div>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" :disabled="sensitiveFieldsLocked" />
        <div v-if="sensitiveFieldsLocked" class="form-tip">
          无「查看敏感信息」权限，已脱敏且不可修改
        </div>
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" :disabled="sensitiveFieldsLocked" />
      </el-form-item>
      <el-form-item label="角色" prop="roleIds">
        <el-select
          v-model="form.roleIds"
          multiple
          clearable
          style="width: 100%"
          placeholder="个人角色（可选，若单位已绑默认角色）"
        >
          <el-option v-for="r in availableRoles" :key="r.id" :label="r.name" :value="r.id" />
        </el-select>
        <div class="form-tip">可与单位默认角色叠加；二者至少其一有角色即可</div>
      </el-form-item>
      <el-form-item label="单位" prop="unitId">
        <el-tree-select
          v-model="form.unitId"
          :data="unitOptions"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          check-strictly
          clearable
          placeholder="请选择单位"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="岗位" prop="postId">
        <el-select
          v-model="form.postId"
          clearable
          filterable
          placeholder="请选择岗位"
          style="width: 100%"
        >
          <el-option v-for="p in postOptions" :key="p.id" :label="p.name" :value="p.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
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
import { getPasswordRules } from '@/api/auth'
import { getOptions as getRoleOptions } from '@/api/role'
import { getTree as getUnitTree } from '@/api/unit'
import { getOptions as getPostOptions } from '@/api/post'
import { create, get, update } from '@/api/user'
import { usePermission } from '@/directives/permission'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'UsersSave' })
const emit = defineEmits(['success'])
const { isSuperAdmin, hasPermission } = usePermission()
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const roleOptions = ref([])
const unitOptions = ref([])
const postOptions = ref([])
const passwordRules = ref(null)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '用户'))
const pwdTip = computed(() => passwordRules.value?.tip || '不少于 6 位')
/** 编辑/查看且无敏感权限时锁定邮箱、手机号，避免掩码被提交写回 */
const sensitiveFieldsLocked = computed(
  () => mode.value !== 'add' && editingId.value != null && !hasPermission('user:sensitive:view'),
)
const availableRoles = computed(() =>
  isSuperAdmin.value
    ? roleOptions.value
    : roleOptions.value.filter((r) => r.code !== 'SUPER_ADMIN'),
)
const form = reactive({
  username: '',
  password: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1,
  roleIds: [],
  unitId: undefined,
  postId: undefined,
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (mode.value === 'add' && !value) {
          callback(new Error('请输入密码'))
          return
        }
        if (!value) {
          callback()
          return
        }
        const min = passwordRules.value?.minLength ?? 6
        const max = passwordRules.value?.maxLength ?? 50
        if (value.length < min || value.length > max) {
          callback(new Error(`密码长度需在${min}-${max}之间`))
          return
        }
        if (passwordRules.value?.requireUpper && !/[A-Z]/.test(value)) {
          callback(new Error('密码须包含大写字母'))
          return
        }
        if (passwordRules.value?.requireLower && !/[a-z]/.test(value)) {
          callback(new Error('密码须包含小写字母'))
          return
        }
        if (passwordRules.value?.requireDigit && !/\d/.test(value)) {
          callback(new Error('密码须包含数字'))
          return
        }
        if (passwordRules.value?.requireSpecial && !/[^A-Za-z0-9]/.test(value)) {
          callback(new Error('密码须包含特殊字符'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}
function resetForm() {
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.email = ''
  form.phone = ''
  form.status = 1
  form.roleIds = []
  form.unitId = undefined
  form.postId = undefined
  editingId.value = null
  formRef.value?.clearValidate()
}
async function loadDetail(id) {
  const res = await get(id)
  form.username = res.data.username
  form.nickname = res.data.nickname
  form.email = res.data.email
  form.phone = res.data.phone
  form.status = res.data.status
  form.roleIds = (res.data.roleList || []).map((r) => r.id)
  form.unitId = res.data.unitId ?? undefined
  form.postId = res.data.postId ?? undefined
}
async function ensureOptions() {
  if (!roleOptions.value.length) {
    const res = await getRoleOptions()
    roleOptions.value = res.data
  }
  if (!unitOptions.value.length) {
    const res = await getUnitTree()
    unitOptions.value = res.data || []
  }
  if (!postOptions.value.length) {
    const res = await getPostOptions()
    postOptions.value = res.data || []
  }
  if (!passwordRules.value) {
    try {
      const res = await getPasswordRules()
      passwordRules.value = res.data
    } catch {
      passwordRules.value = null
    }
  }
}
async function open(openMode, id) {
  mode.value = openMode
  resetForm()
  editingId.value = id ?? null
  await ensureOptions()
  visible.value = true
  if (openMode !== 'add' && id) {
    await loadDetail(id)
  }
}
async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const payload = { ...form }
      if (mode.value === 'edit' && editingId.value) {
        if (!payload.password) delete payload.password
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

<style scoped>
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
}
</style>
