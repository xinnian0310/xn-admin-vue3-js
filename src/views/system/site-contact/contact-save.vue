<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="580px"
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
      <el-form-item label="图标">
        <div class="locked-field">
          <xnAppIcon v-if="form.icon" :name="form.icon" />
          <span>{{ form.icon || '—' }}</span>
          <span class="locked-tip">固定项，不可修改</span>
        </div>
      </el-form-item>
      <el-form-item label="标签">
        <el-input :model-value="form.label" disabled />
      </el-form-item>
      <el-form-item label="分类" prop="type">
        <el-select v-model="form.type" placeholder="选择内容分类" style="width: 100%">
          <el-option
            v-for="opt in SITE_CONTACT_TYPE_OPTIONS"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>

      <!-- 文本：仅内容 -->
      <template v-if="form.type === 'text'">
        <el-form-item label="内容" prop="value">
          <el-input v-model="form.value" maxlength="200" placeholder="展示文案" />
        </el-form-item>
      </template>

      <!-- 链接：展示文案 + URL -->
      <template v-else-if="form.type === 'link'">
        <el-form-item label="文案" prop="value">
          <el-input v-model="form.value" maxlength="200" placeholder="链接展示文字" />
        </el-form-item>
        <el-form-item label="链接" prop="link">
          <el-input v-model="form.link" maxlength="300" placeholder="https://..." />
          <div class="form-tip">前台点击文案后跳转到该地址</div>
        </el-form-item>
      </template>

      <!-- 邮箱：地址，自动生成 mailto -->
      <template v-else-if="form.type === 'email'">
        <el-form-item label="邮箱" prop="value">
          <el-input v-model="form.value" maxlength="200" placeholder="name@example.com" />
          <div class="form-tip">保存后自动生成 mailto: 链接，前台可点击发信</div>
        </el-form-item>
      </template>

      <!-- QQ群：多群号 + 已满 -->
      <template v-else-if="form.type === 'qq'">
        <el-form-item label="群号" required>
          <div class="group-list">
            <div v-for="(g, idx) in form.groups" :key="idx" class="group-row">
              <xnAppIcon name="ri:qq-fill" :size="18" class="qq-icon" />
              <el-input
                v-model="g.value"
                maxlength="30"
                placeholder="QQ 群号"
                :disabled="mode === 'view'"
              />
              <el-switch
                v-model="g.full"
                inline-prompt
                active-text="已满"
                inactive-text="可加"
                :disabled="mode === 'view'"
              />
              <el-button
                v-if="mode !== 'view'"
                type="danger"
                link
                :disabled="form.groups.length <= 1"
                @click="removeGroup(idx)"
              >
                删除
              </el-button>
            </div>
            <el-button v-if="mode !== 'view'" type="primary" link @click="addGroup">
              + 添加群号
            </el-button>
            <div class="form-tip">打开「已满」后，前台对该群号显示删除线并标注已满</div>
          </div>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">{{ mode === 'view' ? '关闭' : '取消' }}</el-button>
      <el-button v-if="mode !== 'view'" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import { saveDialogTitle } from '@/types/save'
import { SITE_CONTACT_TYPE_OPTIONS, resolveContactType } from '@/types/site-contact'
defineOptions({ name: 'SiteContactItemSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingIndex = ref(null)
const formRef = ref()
const dialogTitle = computed(() => saveDialogTitle(mode.value, '联系项'))
const form = reactive({
  icon: 'Link',
  label: '',
  type: 'text',
  value: '',
  link: '',
  groups: [{ value: '', full: false }],
})
const rules = computed(() => {
  if (form.type === 'text') {
    return { value: [{ required: true, message: '请输入内容', trigger: 'blur' }] }
  }
  if (form.type === 'link') {
    return {
      value: [{ required: true, message: '请输入展示文案', trigger: 'blur' }],
      link: [
        { required: true, message: '请输入链接地址', trigger: 'blur' },
        {
          validator: (_r, v, cb) => {
            const s = String(v || '').trim()
            if (!/^https?:\/\//i.test(s)) cb(new Error('链接需以 http:// 或 https:// 开头'))
            else cb()
          },
          trigger: 'blur',
        },
      ],
    }
  }
  if (form.type === 'email') {
    return {
      value: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        {
          type: 'email',
          message: '邮箱格式不正确',
          trigger: 'blur',
        },
      ],
    }
  }
  return { type: [{ required: true, message: '请选择分类', trigger: 'change' }] }
})
function resetForm() {
  form.icon = 'Link'
  form.label = ''
  form.type = 'text'
  form.value = ''
  form.link = ''
  form.groups = [{ value: '', full: false }]
  editingIndex.value = null
  formRef.value?.clearValidate()
}
function open(openMode, row, index) {
  mode.value = openMode
  resetForm()
  if (row) {
    form.icon = row.icon || 'Link'
    form.label = row.label || ''
    form.type = resolveContactType(row)
    form.value = row.value || ''
    form.link = row.link || ''
    editingIndex.value = index ?? null
    if (form.type === 'qq') {
      const fromGroups = (row.groups ?? [])
        .filter((g) => g.value?.trim())
        .map((g) => ({ value: g.value.trim(), full: Boolean(g.full) }))
      form.groups = fromGroups.length
        ? fromGroups
        : row.value?.trim()
          ? [{ value: row.value.trim(), full: false }]
          : [{ value: '', full: false }]
    }
  }
  visible.value = true
}
function addGroup() {
  form.groups.push({ value: '', full: false })
}
function removeGroup(idx) {
  if (form.groups.length <= 1) return
  form.groups.splice(idx, 1)
}
function buildData() {
  const type = form.type
  const base = {
    icon: form.icon || 'Link',
    label: form.label,
    type,
  }
  if (type === 'qq') {
    const cleaned = form.groups
      .map((g) => ({ value: g.value.trim(), full: Boolean(g.full) }))
      .filter((g) => g.value)
    if (!cleaned.length) {
      ElMessage.warning('请至少填写一个群号')
      return null
    }
    return {
      ...base,
      value: cleaned[0].value,
      link: null,
      groups: cleaned,
    }
  }
  if (type === 'email') {
    const email = form.value.trim()
    return {
      ...base,
      value: email,
      link: `mailto:${email}`,
      groups: undefined,
    }
  }
  if (type === 'link') {
    return {
      ...base,
      value: form.value.trim(),
      link: form.link.trim(),
      groups: undefined,
    }
  }
  return {
    ...base,
    value: form.value.trim(),
    link: null,
    groups: undefined,
  }
}
async function handleSubmit() {
  if (form.type === 'qq') {
    const data = buildData()
    if (!data) return
    emit('success', { mode: mode.value, index: editingIndex.value, data })
    visible.value = false
    return
  }
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    const data = buildData()
    if (!data) return
    emit('success', { mode: mode.value, index: editingIndex.value, data })
    visible.value = false
  })
}
function handleClosed() {
  resetForm()
}
defineExpose({ open })
</script>

<style scoped>
.locked-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  color: var(--el-text-color-regular);
}

.locked-tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.group-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-row .el-input {
  flex: 1;
}

.qq-icon {
  flex-shrink: 0;
  color: #12b7f5;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
  width: 100%;
}
</style>
