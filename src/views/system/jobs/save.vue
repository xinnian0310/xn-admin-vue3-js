<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="640px"
    destroy-on-close
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" :disabled="readonly">
      <el-form-item label="任务名称" prop="name">
        <el-input v-model="form.name" maxlength="100" />
      </el-form-item>
      <el-form-item label="任务标识" prop="jobKey">
        <el-input v-model="form.jobKey" maxlength="100" placeholder="唯一标识，如 demo-heartbeat" />
      </el-form-item>
      <el-form-item label="Cron" prop="cron">
        <el-input v-model="form.cron" placeholder="如 0 */5 * * * ?" />
      </el-form-item>
      <el-form-item label="调用目标" prop="invokeTarget">
        <el-input v-model="form.invokeTarget" placeholder="如 demoJob.heartbeat" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="允许并发">
        <el-switch v-model="form.concurrent" />
        <div class="form-tip">关闭后同一任务不会重叠执行（Quartz DisallowConcurrent）</div>
      </el-form-item>
      <el-form-item label="misfire策略" prop="misfirePolicy">
        <el-select v-model="form.misfirePolicy" style="width: 100%">
          <el-option
            v-for="opt in misfireOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
        <div class="form-tip">错过触发时间后的补偿策略（对标若依 Quartz）</div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">{{ readonly ? '关闭' : '取消' }}</el-button>
      <el-button v-if="!readonly" type="primary" :loading="submitting" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createJob, getJob, updateJob } from '@/api/file-job'
import { saveDialogTitle } from '@/types/save'
defineOptions({ name: 'JobsSave' })
const emit = defineEmits(['success'])
const visible = ref(false)
const mode = ref('add')
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref()
const readonly = computed(() => mode.value === 'view')
const dialogTitle = computed(() => saveDialogTitle(mode.value, '定时任务'))
const misfireOptions = [
  { value: '0', label: '默认（放弃本次）' },
  { value: '1', label: '忽略 misfire（尽快补齐）' },
  { value: '2', label: '立即补偿执行一次' },
  { value: '3', label: '不触发立即执行' },
]
const form = reactive({
  name: '',
  jobKey: '',
  cron: '0 */5 * * * ?',
  invokeTarget: 'demoJob.heartbeat',
  status: 0,
  remark: '',
  concurrent: false,
  misfirePolicy: '0',
})
const rules = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  jobKey: [{ required: true, message: '请输入任务标识', trigger: 'blur' }],
  cron: [{ required: true, message: '请输入 Cron 表达式', trigger: 'blur' }],
  invokeTarget: [{ required: true, message: '请输入调用目标', trigger: 'blur' }],
}
async function open(nextMode, id) {
  mode.value = nextMode
  editingId.value = id ?? null
  visible.value = true
  if (id) {
    const res = await getJob(id)
    Object.assign(form, {
      name: res.data.name,
      jobKey: res.data.jobKey,
      cron: res.data.cron,
      invokeTarget: res.data.invokeTarget,
      status: res.data.status,
      remark: res.data.remark || '',
      concurrent: res.data.concurrent ?? false,
      misfirePolicy: res.data.misfirePolicy || '0',
    })
  } else {
    Object.assign(form, {
      name: '',
      jobKey: '',
      cron: '0 */5 * * * ?',
      invokeTarget: 'demoJob.heartbeat',
      status: 0,
      remark: '',
      concurrent: false,
      misfirePolicy: '0',
    })
  }
}
async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateJob(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createJob(form)
      ElMessage.success('创建成功')
    }
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}
function handleClosed() {
  formRef.value?.resetFields()
}
defineExpose({ open })
</script>

<style scoped>
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}
</style>
