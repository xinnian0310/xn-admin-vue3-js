<template>
  <div class="page-card profile-page" v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">个人信息</h2>
      <el-button :icon="Refresh" @click="loadProfile">刷新</el-button>
    </div>

    <el-alert
      v-if="forcePwd"
      type="warning"
      :closable="false"
      show-icon
      class="profile-page__alert"
      title="按安全策略要求，请先修改密码后再继续使用系统"
    />

    <el-alert
      v-if="!canEditProfile"
      type="warning"
      :closable="false"
      show-icon
      class="profile-page__alert"
      title="超级管理员仅可修改密码，不可改用户名与基本资料"
    />

    <div class="profile-page__body">
      <aside class="profile-page__avatar">
        <el-avatar :size="88" :src="avatarUrl">{{ avatarText }}</el-avatar>
        <div class="profile-page__name">{{ form.nickname || form.username || '-' }}</div>
        <div class="profile-page__role">{{ roleText }}</div>
        <el-upload
          v-if="canEditProfile"
          :show-file-list="false"
          :http-request="handleAvatarUpload"
          accept="image/jpeg,image/png,image/gif,image/webp"
        >
          <el-button size="small" :loading="avatarUploading">更换头像</el-button>
        </el-upload>
      </aside>

      <div class="profile-page__main">
        <div class="profile-page__panels">
          <div class="profile-page__panel">
            <div class="profile-page__section-title">基本信息</div>
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="88px"
              :disabled="profileFormDisabled"
            >
              <el-form-item label="用户名">
                <el-input v-model="form.username" disabled />
              </el-form-item>
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="form.nickname" maxlength="50" placeholder="请输入昵称" />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="form.email" maxlength="100" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="手机" prop="phone">
                <el-input v-model="form.phone" maxlength="20" placeholder="请输入手机号" />
              </el-form-item>
              <div class="profile-page__meta-grid">
                <el-form-item label="单位">
                  <span>{{ user?.unitName || '—' }}</span>
                </el-form-item>
                <el-form-item label="岗位">
                  <span>{{ user?.postName || '—' }}</span>
                </el-form-item>
                <el-form-item label="状态">
                  <el-tag :type="user?.status === 1 ? 'success' : 'info'" size="small">
                    {{ user?.status === 1 ? '启用' : '停用' }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="角色">
                  <span>{{ roleText }}</span>
                </el-form-item>
              </div>
            </el-form>
          </div>

          <div class="profile-page__panel">
            <div class="profile-page__section-title">修改密码</div>
            <el-form
              ref="pwdFormRef"
              :model="pwdForm"
              :rules="pwdRules"
              label-width="88px"
              :disabled="passwordFormDisabled"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="pwdForm.oldPassword"
                  type="password"
                  show-password
                  autocomplete="current-password"
                  placeholder="请输入原密码"
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="pwdForm.newPassword"
                  type="password"
                  show-password
                  autocomplete="new-password"
                  :placeholder="pwdPlaceholder"
                />
                <div v-if="pwdRulesTip" class="form-tip">{{ pwdRulesTip }}</div>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="pwdForm.confirmPassword"
                  type="password"
                  show-password
                  autocomplete="new-password"
                  placeholder="再次输入新密码"
                />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <div class="profile-page__footer">
          <template v-if="canEdit">
            <template v-if="editing">
              <el-button :disabled="saving" @click="cancelEdit">取消</el-button>
              <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
            </template>
            <el-button v-else type="primary" @click="startEdit">
              {{ canEditProfile ? '修改' : '修改密码' }}
            </el-button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { changePassword, getPasswordRules, uploadAvatar } from '@/api/auth'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'Profile' })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { isSuperAdmin } = storeToRefs(permissionStore)

const loading = ref(false)
const saving = ref(false)
const editing = ref(false)
const avatarUploading = ref(false)
const formRef = ref()
const pwdFormRef = ref()
const passwordRules = ref(null)

const canEditProfile = computed(() => !isSuperAdmin.value)
const canEditPassword = computed(() => true)
const canEdit = computed(() => canEditProfile.value || canEditPassword.value)
const profileFormDisabled = computed(() => !canEditProfile.value || !editing.value)
const passwordFormDisabled = computed(() => !canEditPassword.value || !editing.value)
const user = computed(() => userStore.user)
const forcePwd = computed(() => route.query.forcePwd === '1' || !!user.value?.mustChangePassword)
const pwdRulesTip = computed(() => passwordRules.value?.tip || '')
const pwdPlaceholder = computed(() => {
  const min = passwordRules.value?.minLength ?? 6
  const max = passwordRules.value?.maxLength ?? 50
  return `${min}-${max} 位新密码`
})

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
})

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 50, message: '昵称不能超过50个字符', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
    { max: 100, message: '邮箱不能超过100个字符', trigger: 'blur' },
  ],
  phone: [{ max: 20, message: '手机号不能超过20个字符', trigger: 'blur' }],
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
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
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== pwdForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
}

const avatarText = computed(() => {
  const name = form.nickname || form.username || 'U'
  return name.charAt(0).toUpperCase()
})

const avatarUrl = computed(() => user.value?.avatar || undefined)

const roleText = computed(() => {
  if (user.value?.roleList?.length) {
    return user.value.roleList.map((r) => r.name || r.code).join('、')
  }
  if (user.value?.roles?.length) return user.value.roles.join('、')
  return user.value?.role || '-'
})

function syncForm() {
  form.username = user.value?.username || ''
  form.nickname = user.value?.nickname || ''
  form.email = user.value?.email || ''
  form.phone = user.value?.phone || ''
}

function resetPwdForm() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdFormRef.value?.clearValidate()
}

watch(user, syncForm, { immediate: true })

watch(
  forcePwd,
  (v) => {
    if (v && canEditPassword.value) editing.value = true
  },
  { immediate: true },
)

function startEdit() {
  syncForm()
  resetPwdForm()
  editing.value = true
}

function cancelEdit() {
  syncForm()
  resetPwdForm()
  editing.value = false
}

async function loadProfile() {
  loading.value = true
  try {
    await userStore.fetchProfile()
    syncForm()
  } catch {
    ElMessage.error('获取个人信息失败')
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  const hasPwdInput = Boolean(pwdForm.oldPassword || pwdForm.newPassword || pwdForm.confirmPassword)
  if (canEditProfile.value) {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
  }
  if (forcePwd.value || hasPwdInput || !canEditProfile.value) {
    const pwdValid = await pwdFormRef.value?.validate().catch(() => false)
    if (!pwdValid) return
  }

  saving.value = true
  try {
    if (canEditProfile.value) {
      await userStore.updateProfile({
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
      })
    }
    if (forcePwd.value || hasPwdInput || !canEditProfile.value) {
      await changePassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
      })
      resetPwdForm()
      await userStore.fetchProfile()
      ElMessage.success(
        forcePwd.value ? '密码已修改' : canEditProfile.value ? '资料与密码已保存' : '密码已修改',
      )
      if (route.query.forcePwd === '1') {
        editing.value = false
        router.replace('/dashboard')
        return
      }
    } else {
      ElMessage.success('保存成功')
    }
    editing.value = false
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : '保存失败'
    ElMessage.error(msg || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleAvatarUpload(options) {
  avatarUploading.value = true
  try {
    const res = await uploadAvatar(options.file)
    await userStore.fetchProfile()
    ElMessage.success('头像已更新')
    options.onSuccess?.(res)
  } catch (e) {
    const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : '上传失败'
    ElMessage.error(msg || '上传失败')
    options.onError?.(e)
  } finally {
    avatarUploading.value = false
  }
}

async function loadPasswordRules() {
  try {
    const res = await getPasswordRules()
    passwordRules.value = res.data
  } catch {
    passwordRules.value = null
  }
}

onMounted(() => {
  loadProfile()
  loadPasswordRules()
})
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
}

.profile-page__alert {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.profile-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 24px;
  overflow: hidden;
}

.profile-page__avatar {
  flex-shrink: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 16px;
  background: var(--app-fill-color, #f8fafc);
  border: 1px solid var(--app-border-color);
  border-radius: 12px;
  align-self: flex-start;
}

.profile-page__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
  text-align: center;
  word-break: break-all;
}

.profile-page__role {
  font-size: 13px;
  color: var(--app-text-muted, #909399);
  text-align: center;
}

.profile-page__main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.profile-page__panels {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.profile-page__panel {
  min-width: 0;
}

.profile-page__section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--app-text-primary, #303133);
}

.profile-page__meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
}

.profile-page__footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--app-text-muted, #909399);
}

@media (max-width: 900px) {
  .profile-page__body {
    flex-direction: column;
    overflow: auto;
  }

  .profile-page__avatar {
    width: 100%;
    align-self: stretch;
  }

  .profile-page__main {
    overflow: visible;
  }

  .profile-page__panels {
    grid-template-columns: 1fr;
    overflow: visible;
  }
}
</style>
