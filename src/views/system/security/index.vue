<template>
  <xnPageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    @page-change="applyLocalPage"
    @refresh="loadData"
  >
    <template #aside>
      <xnTreePanel title="安全策略" width="380px" :filterable="false">
        <el-form :model="form" label-width="140px" class="security-aside-form" @submit.prevent>
          <div class="section-title">登录防护</div>
          <el-form-item label="失败锁定阈值">
            <el-input-number
              v-model="form.maxFailures"
              :min="1"
              :max="50"
              controls-position="right"
            />
            <span class="hint">次</span>
          </el-form-item>
          <el-form-item label="锁定时长">
            <el-input-number
              v-model="form.lockMinutes"
              :min="1"
              :max="1440"
              controls-position="right"
            />
            <span class="hint">分钟</span>
          </el-form-item>
          <el-form-item label="IP 每分钟限流">
            <el-input-number
              v-model="form.rateLimitPerMinute"
              :min="1"
              :max="1000"
              controls-position="right"
            />
            <span class="hint">次</span>
          </el-form-item>
          <el-form-item label="验证码有效期">
            <el-input-number
              v-model="form.captchaTtlSeconds"
              :min="30"
              :max="600"
              controls-position="right"
            />
            <span class="hint">秒</span>
          </el-form-item>

          <div class="section-title">密码策略</div>
          <el-form-item label="最小长度">
            <el-input-number
              v-model="form.pwdMinLength"
              :min="6"
              :max="50"
              controls-position="right"
            />
            <span class="hint">位</span>
          </el-form-item>
          <el-form-item label="最大长度">
            <el-input-number
              v-model="form.pwdMaxLength"
              :min="6"
              :max="50"
              controls-position="right"
            />
            <span class="hint">位</span>
          </el-form-item>
          <el-form-item label="必须大写字母">
            <el-switch v-model="form.pwdRequireUpper" />
          </el-form-item>
          <el-form-item label="必须小写字母">
            <el-switch v-model="form.pwdRequireLower" />
          </el-form-item>
          <el-form-item label="必须数字">
            <el-switch v-model="form.pwdRequireDigit" />
          </el-form-item>
          <el-form-item label="必须特殊字符">
            <el-switch v-model="form.pwdRequireSpecial" />
          </el-form-item>
          <el-form-item label="密码有效期">
            <el-input-number
              v-model="form.pwdExpireDays"
              :min="0"
              :max="3650"
              controls-position="right"
            />
            <span class="hint">天（0=不过期）</span>
          </el-form-item>
          <el-form-item label="历史密码限制">
            <el-input-number
              v-model="form.pwdHistoryCount"
              :min="0"
              :max="20"
              controls-position="right"
            />
            <span class="hint">次（0=不限制）</span>
          </el-form-item>
          <el-form-item label="新建/重置强制改密">
            <el-switch v-model="form.pwdForceChangeFirst" />
          </el-form-item>

          <el-form-item v-if="form.updatedAt" label="最近更新">
            <span class="muted">{{ form.updatedAt }}</span>
          </el-form-item>
          <p class="security-aside-tip">
            保存后立即生效。验证码开关请在「登录页设置」中配置；超级管理员不受强制改密/过期约束。
          </p>
        </el-form>

        <template #footer>
          <xnButton
            class="security-aside-actions"
            :list-item="buttonItems"
            :selected="selected"
            @button-click="buttonClick"
          />
        </template>
      </xnTreePanel>
    </template>

    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:security-policy"
        entity-name="锁定账号"
        name-field="username"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
        @refresh="loadData"
      >
        <template #remainSeconds="{ row }">
          {{ formatRemain(row.remainSeconds) }}
        </template>
        <template #actions="{ row }">
          <xnTableActions
            :items="tableButtonItems"
            :row="row"
            :disabled="(action) => action === 'unlock' && unlocking === String(row.username)"
            @action-click="onTableAction"
          />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnTreePanel from '@/components/xnTreePanel/xnTreePanel.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import {
  getSecurityPolicy,
  listLockedAccounts,
  unlockAccount,
  updateSecurityPolicy,
} from '@/api/security-policy'
defineOptions({ name: 'SystemSecurity' })
/** 权限内容：security-policy:refresh / update（搜索位）；table-unlock（表格） */
const { buttonItems, tableButtonItems } = usePageUi('/system/security')
const loading = ref(false)
const unlocking = ref('')
const allData = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const selected = ref([])
const form = reactive({
  maxFailures: 5,
  lockMinutes: 15,
  rateLimitPerMinute: 30,
  captchaTtlSeconds: 120,
  pwdMinLength: 6,
  pwdMaxLength: 50,
  pwdRequireUpper: false,
  pwdRequireLower: false,
  pwdRequireDigit: false,
  pwdRequireSpecial: false,
  pwdExpireDays: 0,
  pwdForceChangeFirst: true,
  pwdHistoryCount: 0,
  updatedAt: '',
})
const columns = [
  { prop: 'username', label: '用户名', minWidth: 160 },
  { type: 'slot', slot: 'remainSeconds', prop: 'remainSeconds', label: '剩余时间', width: 120 },
  { type: 'slot', slot: 'actions', label: '操作', width: 100, fixed: 'right' },
]
function formatRemain(sec) {
  if (sec >= 60) return `${Math.ceil(sec / 60)} 分钟`
  return `${sec} 秒`
}
function selectionChangeHandle(rows) {
  selected.value = rows
}
function applyLocalPage() {
  total.value = allData.value.length
  const start = (page.value - 1) * size.value
  tableData.value = allData.value.slice(start, start + size.value)
}
async function loadPolicy() {
  const res = await getSecurityPolicy()
  const data = res.data
  form.maxFailures = data.maxFailures
  form.lockMinutes = data.lockMinutes
  form.rateLimitPerMinute = data.rateLimitPerMinute
  form.captchaTtlSeconds = data.captchaTtlSeconds
  form.pwdMinLength = data.pwdMinLength ?? 6
  form.pwdMaxLength = data.pwdMaxLength ?? 50
  form.pwdRequireUpper = !!data.pwdRequireUpper
  form.pwdRequireLower = !!data.pwdRequireLower
  form.pwdRequireDigit = !!data.pwdRequireDigit
  form.pwdRequireSpecial = !!data.pwdRequireSpecial
  form.pwdExpireDays = data.pwdExpireDays ?? 0
  form.pwdForceChangeFirst = data.pwdForceChangeFirst !== false
  form.pwdHistoryCount = data.pwdHistoryCount ?? 0
  form.updatedAt = data.updatedAt || ''
}
async function loadLocks() {
  const res = await listLockedAccounts()
  allData.value = res.data || []
  applyLocalPage()
}
async function loadData() {
  loading.value = true
  try {
    await Promise.all([loadPolicy(), loadLocks()])
  } finally {
    loading.value = false
  }
}
async function handleSave() {
  if (form.pwdMaxLength < form.pwdMinLength) {
    ElMessage.warning('密码最大长度不能小于最小长度')
    return
  }
  const res = await updateSecurityPolicy({
    maxFailures: form.maxFailures,
    lockMinutes: form.lockMinutes,
    rateLimitPerMinute: form.rateLimitPerMinute,
    captchaTtlSeconds: form.captchaTtlSeconds,
    pwdMinLength: form.pwdMinLength,
    pwdMaxLength: form.pwdMaxLength,
    pwdRequireUpper: form.pwdRequireUpper,
    pwdRequireLower: form.pwdRequireLower,
    pwdRequireDigit: form.pwdRequireDigit,
    pwdRequireSpecial: form.pwdRequireSpecial,
    pwdExpireDays: form.pwdExpireDays,
    pwdForceChangeFirst: form.pwdForceChangeFirst,
    pwdHistoryCount: form.pwdHistoryCount,
  })
  form.updatedAt = res.data.updatedAt || form.updatedAt
  ElMessage.success('保存成功，已立即生效')
}
async function buttonClick(action) {
  if (action === 'refresh' || action === 'view') await loadData()
  else if (action === 'edit' || action === 'update' || action === 'save') await handleSave()
}
function onTableAction(payload) {
  if (payload.action === 'unlock') handleUnlock(String(payload.row.username ?? ''))
}
async function handleUnlock(username) {
  if (!username) return
  await ElMessageBox.confirm(`确定解锁账号「${username}」？`, '解锁确认', { type: 'warning' })
  unlocking.value = username
  try {
    await unlockAccount(username)
    ElMessage.success('已解锁')
    await loadLocks()
  } finally {
    unlocking.value = ''
  }
}
onMounted(loadData)
</script>

<style scoped>
.security-aside-form {
  padding: 12px 8px 8px;
}

.security-aside-form :deep(.el-form-item) {
  margin-bottom: 14px;
}

.security-aside-form :deep(.el-input-number) {
  width: 120px;
}

.section-title {
  margin: 4px 0 12px;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
}

.section-title + .el-form-item {
  margin-top: 0;
}

.section-title:not(:first-child) {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--app-border-color, #ebeef5);
}

.hint {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.muted {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.security-aside-tip {
  margin: 8px 0 0;
  padding: 0 4px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--app-text-muted, #909399);
}

.security-aside-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
}
</style>
