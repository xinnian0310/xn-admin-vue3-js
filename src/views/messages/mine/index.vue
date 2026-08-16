<template>
  <xnPageLayout
    v-model:page="page"
    v-model:page-size="size"
    :total="total"
    @page-change="applyLocalPage"
    @refresh="loadData"
  >
    <template #search>
      <xnSearch :search-item="searchItems" @query-form="inquires" @reset="reset" />
    </template>
    <template #toolbar>
      <xnButton :list-item="buttonItems" :selected="selected" @button-click="buttonClick" />
    </template>
    <template #toolbar-extra>
      <el-tag v-if="unread > 0" type="danger" effect="light" round>未读 {{ unread }}</el-tag>
    </template>
    <template #table>
      <xnTable
        v-model:page="page"
        v-model:page-size="size"
        :data="tableData"
        :total="total"
        :loading="loading"
        table-key="messages:mine"
        entity-name="消息"
        name-field="title"
        :columns="columns"
        :action-items="tableButtonItems"
        stripe
        @selection-change="selectionChangeHandle"
        @page-change="applyLocalPage"
        @refresh="loadData"
      >
        <template #sentAt="{ row }">
          {{ formatDateTime(row.sentAt) }}
        </template>
        <template #read="{ row }">
          <el-tag :type="row.read ? 'info' : 'danger'" size="small">
            {{ row.read ? '已读' : '未读' }}
          </el-tag>
        </template>
        <template #actions="{ row }">
          <xnTableActions :items="tableButtonItems" :row="row" @action-click="onTableAction" />
        </template>
      </xnTable>
    </template>
  </xnPageLayout>

  <el-dialog
    v-model="detailVisible"
    :title="current?.title || '消息详情'"
    width="720px"
    destroy-on-close
  >
    <div v-if="current" class="message-detail">
      <div class="message-detail__meta">
        <span>发送人：{{ current.senderName || '—' }}</span>
        <span>发送时间：{{ formatDateTime(current.sentAt) }}</span>
      </div>
      <div v-if="currentAttachments.length" class="message-detail__attachment">
        <span>附件：</span>
        <div class="message-detail__attachment-list">
          <div
            v-for="item in currentAttachments"
            :key="item.path"
            class="message-detail__attachment-row"
          >
            <el-link
              type="primary"
              :href="resolveAttachmentUrl(item.path)"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.name }}
            </el-link>
            <el-button link type="primary" @click="openKkFileViewPreview(item.path, item.name)">
              查看
            </el-button>
          </div>
        </div>
      </div>
      <div class="message-detail__content xn-rich-html" v-html="contentHtml" />
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import { usePageUi } from '@/composables/usePageUi'
import { batchRemoveMine, listMine, markRead, removeMine, unreadCount } from '@/api/message'
import { resolveAttachmentUrl } from '@/config/app'
import { openKkFileViewPreview } from '@/utils/kk-file-view'
import { resolveAttachments } from '@/utils/attachment'
import { decorateRichHtml } from '@/utils/rich-editor'
import { formatDateTime } from '@/utils/datetime'
defineOptions({ name: 'MessagesMine' })
/** 权限内容：personal-message:view/delete；table-view/table-delete */
const { searchItems, buttonItems, tableButtonItems } = usePageUi('/messages/mine')
const loading = ref(false)
const allData = ref([])
const tableData = ref([])
const total = ref(0)
const page = ref(1)
const size = ref(10)
const queryForm = ref({})
const selected = ref([])
const unread = ref(0)
const detailVisible = ref(false)
const current = ref(null)
const currentAttachments = computed(() => resolveAttachments(current.value))
const contentHtml = computed(() => decorateRichHtml(current.value?.content))
const columns = [
  { type: 'selection', width: 50, fixed: true },
  { prop: 'title', label: '标题', minWidth: 200, showOverflowTooltip: true },
  { prop: 'senderName', label: '发送人', width: 120 },
  { type: 'slot', slot: 'sentAt', prop: 'sentAt', label: '发送时间', minWidth: 170 },
  { type: 'slot', slot: 'read', prop: 'read', label: '状态', width: 90 },
  { type: 'slot', slot: 'actions', label: '操作', width: 120, fixed: 'right' },
]
function selectionChangeHandle(rows) {
  selected.value = rows
}
function applyLocalPage() {
  const kw = String(queryForm.value.FuzzyWord ?? '')
    .trim()
    .toLowerCase()
  const readFilter = queryForm.value.read
  let rows = allData.value
  if (kw) {
    rows = rows.filter((r) =>
      [r.title, r.senderName].filter(Boolean).some((v) => String(v).toLowerCase().includes(kw)),
    )
  }
  if (
    readFilter === true ||
    readFilter === false ||
    readFilter === 'true' ||
    readFilter === 'false'
  ) {
    const wantRead = readFilter === true || readFilter === 'true'
    rows = rows.filter((r) => r.read === wantRead)
  }
  total.value = rows.length
  const start = (page.value - 1) * size.value
  tableData.value = rows.slice(start, start + size.value)
}
async function loadUnread() {
  const res = await unreadCount()
  unread.value = res.data.count
}
async function loadData() {
  loading.value = true
  try {
    const res = await listMine()
    allData.value = res.data
    await loadUnread()
    applyLocalPage()
  } finally {
    loading.value = false
  }
}
async function buttonClick(action) {
  if (action === 'view') {
    if (selected.value.length !== 1) {
      ElMessage.warning('请选择一条消息')
      return
    }
    await openDetail(selected.value[0])
  } else if (action === 'delete') {
    await handleBatchDelete()
  }
}
function onTableAction(payload) {
  const row = payload.row
  if (payload.action === 'view') openDetail(row)
  else if (payload.action === 'delete') handleDelete(row)
}
async function openDetail(row) {
  current.value = row
  detailVisible.value = true
  if (!row.read) {
    await markRead(row.id)
    row.read = true
    unread.value = Math.max(0, unread.value - 1)
    applyLocalPage()
  }
}
async function handleDelete(row) {
  await ElMessageBox.confirm(`确定删除消息「${row.title}」吗？`, '删除确认', { type: 'warning' })
  await removeMine(row.id)
  ElMessage.success('删除成功')
  loadData()
}
async function handleBatchDelete() {
  if (!selected.value.length) {
    ElMessage.warning('请至少选择一项')
    return
  }
  await ElMessageBox.confirm(`确定删除选中的 ${selected.value.length} 条消息吗？`, '删除确认', {
    type: 'warning',
  })
  await batchRemoveMine(selected.value.map((r) => r.id))
  ElMessage.success('删除成功')
  loadData()
}
function inquires(form) {
  queryForm.value = form
  page.value = 1
  applyLocalPage()
}
function reset() {
  queryForm.value = {}
  page.value = 1
  applyLocalPage()
}
onMounted(loadData)
</script>

<style scoped>
.message-detail__meta {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.message-detail__attachment {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.message-detail__attachment-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.message-detail__attachment-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.message-detail__content {
  line-height: 1.7;
  min-height: 120px;
}
</style>
