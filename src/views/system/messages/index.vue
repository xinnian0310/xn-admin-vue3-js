<template>
  <xnPageLayout v-model:page="page" v-model:page-size="size" :total="total" @page-change="loadData">
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>
    <template #toolbar>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>
    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="system:messages"
        entity-name="站内信"
        name-field="title"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="loadData"
      >
        <template #readCount="{ row }">
          <span v-if="row.status === 'DRAFT'">—</span>
          <span v-else>{{ row.readCount ?? 0 }} / {{ row.totalCount ?? 0 }}</span>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableActionsFor(row)" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <MessageSave ref="saveRef" @success="loadData" />

  <el-dialog v-model="sendVisible" title="发送站内信" width="520px" destroy-on-close>
    <el-form label-width="100px">
      <el-form-item label="发送范围">
        <el-checkbox v-model="sendForm.sendToAll">全部启用用户</el-checkbox>
      </el-form-item>
      <el-form-item v-if="!sendForm.sendToAll" label="接收用户">
        <el-select
          v-model="sendForm.userIds"
          multiple
          filterable
          placeholder="选择用户"
          style="width: 100%"
        >
          <el-option
            v-for="u in userOptions"
            :key="u.id"
            :label="`${u.nickname || u.username} (${u.username})`"
            :value="u.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="sendVisible = false">取消</el-button>
      <el-button type="primary" :loading="sendLoading" @click="confirmSend">确定发送</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="readersVisible" title="已读明细" width="640px" destroy-on-close>
    <el-table :data="readerRows" stripe max-height="420" v-loading="readersLoading">
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column prop="readAt" label="阅读时间" min-width="170">
        <template #default="{ row }">{{ formatDateTime(row.readAt) }}</template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import MessageSave from './save.vue'
import { usePageUi } from '@/composables/usePageUi'
import { batchRemove, list, readers, remove, send } from '@/api/message'
import { list as listUsers } from '@/api/user'
import { formatDateTime } from '@/utils/datetime'
defineOptions({ name: 'SystemMessages' })
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/system/messages')
const saveRef = ref()
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const sendVisible = ref(false)
const sendLoading = ref(false)
const sendTargetId = ref(null)
const sendForm = reactive({ sendToAll: true, userIds: [] })
const userOptions = ref([])
const readersVisible = ref(false)
const readersLoading = ref(false)
const readerRows = ref([])
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'title', label: '标题', minWidth: 200, showOverflowTooltip: true },
  {
    prop: 'status',
    label: '状态',
    width: 110,
    type: 'tag',
    options: [
      { value: 'DRAFT', label: '草稿', type: 'warning' },
      { value: 'SENT', label: '已发送', type: 'success' },
    ],
  },
  { type: 'slot', slot: 'readCount', prop: 'readCount', label: '已读', width: 120 },
  { prop: 'senderName', label: '发送人', width: 120 },
  { prop: 'sentAt', label: '发送时间', minWidth: 170, type: 'datetime' },
  { prop: 'createdAt', label: '创建时间', minWidth: 170, type: 'datetime' },
  { type: 'slot', slot: 'actions', label: '操作', fixed: 'right' },
]
function tableActionsFor(row) {
  return (tableButtonItems.value || []).filter((item) => {
    if (item.action === 'edit' || item.action === 'delete' || item.action === 'send') {
      return row.status === 'DRAFT'
    }
    if (item.action === 'readers') return row.status === 'SENT'
    return true
  })
}
function openSave(mode, id) {
  saveRef.value?.open(mode, id)
}
function selectionChangeHandle(rows) {
  selected.value = rows
}
function onTableAction(payload) {
  const row = payload.row
  switch (payload.action) {
    case 'edit':
      openSave('edit', row.id)
      break
    case 'view':
      openSave('view', row.id)
      break
    case 'delete':
      handleDelete(row)
      break
    case 'send':
      openSend(row.id)
      break
    case 'readers':
      openReaders(row)
      break
  }
}
function buttonClick(action) {
  if (action === 'add') {
    openSave('add')
    return
  }
  if (action === 'edit' && selected.value.length === 1 && selected.value[0].status === 'DRAFT') {
    openSave('edit', selected.value[0].id)
    return
  }
  if (action === 'view' && selected.value.length === 1) {
    openSave('view', selected.value[0].id)
    return
  }
  if (action === 'delete') {
    handleBatchDelete()
    return
  }
  if (action === 'send' && selected.value.length === 1 && selected.value[0].status === 'DRAFT') {
    openSend(selected.value[0].id)
  }
}
async function loadData() {
  loading.value = true
  try {
    const res = await list({
      page: page.value - 1,
      size: size.value,
      keyword: String(queryForm.value.FuzzyWord ?? '').trim() || undefined,
      status: String(queryForm.value.status ?? '').trim() || undefined,
    })
    tableData.value = res.data.records
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}
function inquires(form) {
  queryForm.value = form
  page.value = 1
  loadData()
}
function reset() {
  queryForm.value = {}
  page.value = 1
  loadData()
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除「${row.title}」吗？`, '删除确认', { type: 'warning' })
  await remove(row.id)
  ElMessage.success('删除成功')
  loadData()
}
async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  if (selected.value.some((r) => r.status !== 'DRAFT')) {
    ElMessage.warning('仅草稿可删除')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条消息吗？`, '删除确认', {
    type: 'warning',
  })
  await batchRemove(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
async function openSend(id) {
  sendTargetId.value = id
  sendForm.sendToAll = true
  sendForm.userIds = []
  if (!userOptions.value.length) {
    const res = await listUsers({ page: 0, size: 500 })
    userOptions.value = res.data.records.filter((u) => u.status === 1)
  }
  sendVisible.value = true
}
async function confirmSend() {
  if (!sendTargetId.value) return
  if (!sendForm.sendToAll && !sendForm.userIds.length) {
    ElMessage.warning('请选择接收用户或勾选全部启用用户')
    return
  }
  sendLoading.value = true
  try {
    await send(sendTargetId.value, {
      sendToAll: sendForm.sendToAll,
      userIds: sendForm.sendToAll ? undefined : sendForm.userIds,
    })
    ElMessage.success('发送成功')
    sendVisible.value = false
    loadData()
  } finally {
    sendLoading.value = false
  }
}
async function openReaders(row) {
  readersVisible.value = true
  readersLoading.value = true
  try {
    const res = await readers(row.id)
    readerRows.value = res.data
  } finally {
    readersLoading.value = false
  }
}
onMounted(loadData)
</script>
