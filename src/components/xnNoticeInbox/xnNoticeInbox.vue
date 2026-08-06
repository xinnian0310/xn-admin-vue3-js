<template>
  <el-drawer v-model="visible" title="消息中心" size="420px" destroy-on-close>
    <div v-loading="noticeStore.loading" class="notice-inbox">
      <el-empty v-if="!noticeStore.notices.length" description="暂无公告" />
      <div
        v-for="item in noticeStore.notices"
        :key="item.id"
        class="notice-inbox__item"
        :class="{ 'is-unread': !item.read }"
        @click="noticeStore.openNotice(item)"
      >
        <div class="notice-inbox__title">
          <span class="notice-inbox__title-text">{{ item.title }}</span>
          <el-tag :type="item.read ? 'success' : 'danger'" size="small">
            {{ item.read ? '已读' : '未读' }}
          </el-tag>
        </div>
        <div class="notice-inbox__meta-row">
          <span class="label">发送人</span>
          <span>{{ item.publisherName || '—' }}</span>
        </div>
        <div class="notice-inbox__meta-row">
          <span class="label">接收时间</span>
          <span>{{ formatDateTime(item.receivedAt || item.publishedAt) }}</span>
        </div>
        <div v-if="item.read && item.readAt" class="notice-inbox__meta-row">
          <span class="label">阅读时间</span>
          <span>{{ formatDateTime(item.readAt) }}</span>
        </div>
      </div>
    </div>
  </el-drawer>

  <el-dialog
    v-model="detailVisible"
    :title="noticeStore.activeNotice?.title || '公告详情'"
    width="760px"
    top="8vh"
    destroy-on-close
    append-to-body
    class="notice-detail-dialog"
    @closed="noticeStore.closeDetail()"
  >
    <div v-if="noticeStore.activeNotice" class="notice-detail">
      <div class="notice-detail__info">
        <div class="notice-detail__info-item">
          <span class="label">发送人</span>
          <span>{{ noticeStore.activeNotice.publisherName || '—' }}</span>
        </div>
        <div class="notice-detail__info-item">
          <span class="label">接收时间</span>
          <span>{{
            formatDateTime(
              noticeStore.activeNotice.receivedAt || noticeStore.activeNotice.publishedAt,
            )
          }}</span>
        </div>
        <div class="notice-detail__info-item">
          <span class="label">状态</span>
          <el-tag :type="noticeStore.activeNotice.read ? 'success' : 'danger'" size="small">
            {{ noticeStore.activeNotice.read ? '已读' : '未读' }}
          </el-tag>
        </div>
        <div
          v-if="noticeStore.activeNotice.read && noticeStore.activeNotice.readAt"
          class="notice-detail__info-item"
        >
          <span class="label">阅读时间</span>
          <span>{{ formatDateTime(noticeStore.activeNotice.readAt) }}</span>
        </div>
      </div>
      <div class="notice-detail__content" v-html="noticeStore.activeNotice.content" />
    </div>
    <template #footer>
      <el-button type="primary" @click="detailVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { useNoticeStore } from '@/stores/notice'
import { formatDateTime } from '@/utils/datetime'
const noticeStore = useNoticeStore()
const visible = computed({
  get: () => noticeStore.drawerVisible,
  set: (val) => {
    if (!val) noticeStore.closeDrawer()
    else noticeStore.openDrawer()
  },
})
const detailVisible = computed({
  get: () => !!noticeStore.activeNotice,
  set: (val) => {
    if (!val) noticeStore.closeDetail()
  },
})
</script>

<style scoped>
.notice-inbox {
  min-height: 200px;
}

.notice-inbox__item {
  padding: 12px;
  border: 1px solid var(--app-border-color, #ebeef5);
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.notice-inbox__item:hover {
  background: var(--app-surface-soft, #f5f7fa);
}

.notice-inbox__item.is-unread {
  border-color: var(--app-color-primary-light-5, #a0cfff);
  background: var(--app-color-primary-light-9, #ecf5ff);
}

.notice-inbox__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--app-text-primary, #303133);
}

.notice-inbox__title-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-inbox__meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  font-size: 12px;
  color: var(--app-text-primary, #606266);
  line-height: 1.5;
}

.notice-inbox__meta-row .label,
.notice-detail__info-item .label {
  flex-shrink: 0;
  color: var(--app-text-muted, #909399);
}

.notice-detail__info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  margin-bottom: 16px;
  padding: 12px 14px;
  background: var(--app-surface-soft, #f5f7fa);
  border-radius: 8px;
  border: 1px solid var(--app-border-color, #ebeef5);
}

.notice-detail__info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--app-text-primary, #303133);
}

.notice-detail__content {
  max-height: 55vh;
  overflow-y: auto;
  line-height: 1.7;
  word-break: break-word;
}

.notice-detail__content :deep(img) {
  max-width: 100%;
}
</style>
