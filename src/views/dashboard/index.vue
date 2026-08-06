<template>
  <div class="home">
    <!-- 上区：介绍 / 前端 / 后端 -->
    <el-row :gutter="16" class="home-top">
      <el-col :xs="24" :md="12" :lg="8">
        <div class="home-intro">
          <div class="home-intro__head">
            <div class="home-intro__title">
              {{ introTitle }}
              <el-tag type="primary" effect="plain" round size="small">{{
                home.intro.version
              }}</el-tag>
            </div>
            <p class="home-intro__desc">{{ introDescription }}</p>
          </div>
          <div class="home-intro__features">
            <div v-for="f in home.intro.features" :key="f.title" class="feature-chip">
              <div class="feature-chip__icon">
                <el-icon :size="16"><component :is="iconOf(f.icon)" /></el-icon>
              </div>
              <div class="feature-chip__body">
                <div class="feature-chip__title">{{ f.title }}</div>
                <div class="feature-chip__desc">{{ f.desc }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <el-card shadow="never" class="home-card home-tech">
          <template #header>
            <div class="home-card__header">
              <el-icon><Monitor /></el-icon>
              <span>前端技术选型</span>
              <span class="home-card__count">{{ home.frontendTech.length }}</span>
            </div>
          </template>
          <el-scrollbar class="tech-scroll" max-height="420px">
            <div class="tech-list">
              <div v-for="t in home.frontendTech" :key="t.name" class="tech-row">
                <div class="tech-row__main">
                  <span class="tech-row__name">{{ t.name }}</span>
                  <span class="tech-row__sep">·</span>
                  <span class="tech-row__desc">{{ t.desc }}</span>
                </div>
                <el-tag size="small" type="primary" effect="plain">{{ t.version }}</el-tag>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12" :lg="8">
        <el-card shadow="never" class="home-card home-tech">
          <template #header>
            <div class="home-card__header">
              <el-icon><Coin /></el-icon>
              <span>后端技术选型</span>
              <span class="home-card__count">{{ home.backendTech.length }}</span>
            </div>
          </template>
          <el-scrollbar class="tech-scroll" max-height="420px">
            <div class="tech-list">
              <div v-for="t in home.backendTech" :key="t.name" class="tech-row">
                <div class="tech-row__main">
                  <span class="tech-row__name">{{ t.name }}</span>
                  <span class="tech-row__sep">·</span>
                  <span class="tech-row__desc">{{ t.desc }}</span>
                </div>
                <el-tag size="small" type="success" effect="plain">{{ t.version }}</el-tag>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <!-- 更新日志 + 联系 / 捐赠：右侧定高，左侧等齐后滚动 -->
    <div class="home-bottom">
      <div class="home-bottom__log">
        <el-card shadow="never" class="home-card home-card--fill">
          <template #header>
            <div class="home-card__header">
              <el-icon><Clock /></el-icon>
              <span>更新日志</span>
              <span class="log-version-badge">{{ home.intro.version }}</span>
              <el-tag size="small" type="primary" effect="light" round>当前</el-tag>
              <span class="log-source">同步自 Git</span>
            </div>
          </template>
          <el-scrollbar class="log-scroll">
            <el-timeline v-if="gitChangelog.length" class="home-timeline">
              <el-timeline-item
                v-for="(item, idx) in gitChangelog"
                :key="item.hash"
                :timestamp="item.date"
                placement="top"
                :type="idx === 0 ? 'primary' : 'info'"
                :hollow="idx !== 0"
              >
                <div class="log-line">
                  <el-tag size="small" :type="changelogTypeMeta[item.type].tag" effect="light">
                    {{ changelogTypeMeta[item.type].label }}
                  </el-tag>
                  <span class="log-line__text">{{ item.text }}</span>
                  <span class="log-line__hash">{{ item.hash }}</span>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无可用的 Git 提交记录" :image-size="64" />
          </el-scrollbar>
        </el-card>
      </div>

      <div class="home-bottom__aside">
        <el-card shadow="never" class="home-card">
          <template #header>
            <div class="home-card__header">
              <el-icon><Phone /></el-icon><span>联系信息</span>
            </div>
          </template>
          <div class="contact-list">
            <div v-for="(c, ci) in siteContact.contacts" :key="ci" class="contact-item">
              <xnAppIcon v-if="c.icon" :name="c.icon" class="contact-item__icon" />
              <span class="contact-item__label">{{ c.label }}</span>
              <div
                v-if="resolveContactType(c) === 'qq' && c.groups?.length"
                class="contact-item__groups"
              >
                <button
                  v-for="(g, gi) in c.groups"
                  :key="gi"
                  type="button"
                  class="contact-item__qq"
                  :class="{ 'is-full': g.full }"
                  :title="g.full ? '群已满' : '点击复制群号'"
                  :disabled="!!g.full"
                  @click="copyQq(g.value, g.full)"
                >
                  <xnAppIcon name="ri:qq-fill" :size="14" class="contact-item__qq-icon" />
                  <span class="contact-item__qq-num">{{ g.value }}</span>
                  <span v-if="g.full" class="contact-item__qq-badge">已满</span>
                </button>
              </div>
              <a
                v-else-if="c.link"
                :href="c.link"
                target="_blank"
                class="contact-item__value contact-item__value--link"
              >
                {{ c.value }}
              </a>
              <span v-else class="contact-item__value">{{ c.value }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="home-card">
          <template #header>
            <div class="home-card__header">
              <el-icon><Coffee /></el-icon><span>捐赠情况</span>
            </div>
          </template>
          <p class="donation-tip">{{ siteContact.donation.tip }}</p>
          <div class="donation-body">
            <div
              v-for="(qr, idx) in siteContact.donation.qrcodes.filter((q) => q.src)"
              :key="idx"
              class="donation-qr"
            >
              <el-image :src="qr.src" fit="contain" class="donation-qr__img" />
              <span class="donation-qr__label">{{ qr.label }}</span>
            </div>
            <el-empty
              v-if="!siteContact.donation.qrcodes.some((q) => q.src)"
              description="暂未配置捐赠二维码"
              :image-size="56"
            />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Lock,
  Guide,
  Monitor,
  Bell,
  Brush,
  Grid,
  User,
  Message,
  Link,
  ChatDotRound,
  Coin,
  Clock,
  Phone,
  Coffee,
  Location,
  Connection,
} from '@element-plus/icons-vue'
import { appConfig } from '@/config/app'
import { homeConfig, changelogTypeMeta } from '@/config/home'
import { getPublicSiteContact } from '@/api/site-contact'
import { resolveContactType } from '@/types/site-contact'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import { gitChangelog } from 'virtual:git-changelog'
defineOptions({ name: 'Dashboard' })
const home = homeConfig
async function copyQq(value, full) {
  if (full || !value) return
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success(`已复制群号 ${value}`)
  } catch {
    ElMessage.error('复制失败，请手动选择')
  }
}
const introTitle = computed(() => appConfig.app.name?.trim() || homeConfig.intro.title)
const introDescription = computed(() => appConfig.app.intro?.trim() || homeConfig.intro.description)
const siteContact = reactive({
  contacts: [...homeConfig.contacts],
  donation: {
    tip: homeConfig.donation.tip,
    qrcodes: homeConfig.donation.qrcodes.map((q) => ({ ...q })),
  },
})
const iconMap = {
  Lock,
  Guide,
  Monitor,
  Bell,
  Brush,
  Grid,
  User,
  Message,
  Link,
  ChatDotRound,
  Coin,
  Clock,
  Phone,
  Coffee,
  Location,
  Connection,
}
function iconOf(name) {
  return iconMap[name] ?? Monitor
}
onMounted(async () => {
  try {
    const res = await getPublicSiteContact()
    const data = res.data
    if (data?.contacts?.length) {
      siteContact.contacts = data.contacts
    }
    if (data?.donation) {
      siteContact.donation.tip = data.donation.tip || siteContact.donation.tip
      if (data.donation.qrcodes?.length) {
        siteContact.donation.qrcodes = data.donation.qrcodes
      }
    }
  } catch {
    // 后端未就绪时沿用本地默认配置
  }
})
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  box-sizing: border-box;
}

.home-top {
  align-items: stretch;
}

.home-top :deep(> .el-col) {
  display: flex;
  min-width: 0;
}

/* 下区：右侧两个盒子决定高度，左侧绝对铺满后内部滚动 */
.home-bottom {
  display: flex;
  align-items: stretch;
  gap: 16px;
}

.home-bottom__log {
  position: relative;
  flex: 14 1 0;
  min-width: 0;
  /* 无文档流高度，高度完全由右侧 stretch 决定 */
}

.home-bottom__log > .home-card--fill {
  position: absolute;
  inset: 0;
  width: auto;
}

.home-bottom__aside {
  flex: 10 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-card--fill {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.home-card--fill :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 10px;
  padding-bottom: 12px;
}

/* 介绍区 */
.home-intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 10px;
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-border-color);
  box-sizing: border-box;
}

.home-intro__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--app-text-primary);
}

.home-intro__desc {
  margin: 10px 0 0;
  line-height: 1.7;
  color: var(--app-text-muted);
  font-size: 13px;
}

.home-intro__features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.feature-chip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--app-surface-soft);
  border: 1px solid var(--app-surface-soft-border);
}

.feature-chip__icon {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-color-primary);
  background: var(--app-card-bg, #fff);
  border: 1px solid var(--app-surface-soft-border);
}

.feature-chip__title {
  font-weight: 600;
  font-size: 13px;
  color: var(--app-text-primary);
  line-height: 1.3;
}

.feature-chip__desc {
  margin-top: 3px;
  font-size: 11px;
  line-height: 1.45;
  color: var(--app-text-muted);
}

/* 卡片通用 */
.home-card {
  border: 1px solid var(--app-border-color);
  width: 100%;
}

.home-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-weight: 600;
}

.home-card__count {
  margin-left: auto;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--app-text-muted);
  background: var(--app-surface-soft);
  border: 1px solid var(--app-surface-soft-border);
}

.log-version-badge {
  margin-left: 2px;
  font-size: 13px;
  font-weight: 700;
  color: var(--app-color-primary);
  font-variant-numeric: tabular-nums;
}

.log-source {
  margin-left: auto;
  font-size: 12px;
  font-weight: 400;
  color: var(--app-text-muted);
}

/* 技术选型 */
.home-tech {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.home-tech :deep(.el-card__body) {
  flex: 1;
  padding-top: 10px;
  padding-bottom: 12px;
  min-height: 0;
}

.tech-scroll :deep(.el-scrollbar__bar),
.log-scroll :deep(.el-scrollbar__bar) {
  z-index: 2;
}

.tech-scroll :deep(.el-scrollbar__bar.is-vertical),
.log-scroll :deep(.el-scrollbar__bar.is-vertical) {
  width: 4px;
  right: 2px;
}

.tech-scroll :deep(.el-scrollbar__bar.is-horizontal),
.log-scroll :deep(.el-scrollbar__bar.is-horizontal) {
  display: none;
}

.tech-scroll :deep(.el-scrollbar__thumb),
.log-scroll :deep(.el-scrollbar__thumb) {
  border-radius: 4px;
  background: color-mix(in srgb, var(--app-text-muted) 45%, transparent);
  opacity: 1;
}

.tech-scroll :deep(.el-scrollbar__thumb:hover),
.log-scroll :deep(.el-scrollbar__thumb:hover) {
  background: color-mix(in srgb, var(--app-text-muted) 70%, transparent);
}

.log-scroll {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.log-scroll :deep(.el-scrollbar__wrap) {
  max-height: 100%;
}

.tech-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 6px;
}

.tech-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 6px;
  background: var(--app-fill-color, #fafbfc);
  border: 1px solid var(--app-border-color);
}

.tech-row__main {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.tech-row__name {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--app-text-primary);
}

.tech-row__sep {
  flex-shrink: 0;
  color: var(--app-border-color);
  font-size: 12px;
}

.tech-row__desc {
  min-width: 0;
  font-size: 12px;
  color: var(--app-text-muted);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 更新日志 */
.home-timeline {
  padding: 4px 8px 0 4px;
}

.log-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.log-line__text {
  flex: 1;
  min-width: 0;
  color: var(--app-text-primary);
  line-height: 1.6;
}

.log-line__hash {
  flex-shrink: 0;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--app-text-muted);
  line-height: 1.6;
}

/* 联系信息 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 4px;
  border-bottom: 1px dashed var(--app-border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item__icon {
  margin-top: 2px;
  color: var(--app-color-primary);
}

.contact-item__label {
  width: 56px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.6;
}

.contact-item__value {
  color: var(--app-text-primary);
  line-height: 1.6;
}

.contact-item__value--link {
  color: var(--app-color-primary);
}

.contact-item__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.contact-item__qq {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 2px 10px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  background: var(--el-fill-color-light);
  color: var(--app-text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.6;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.contact-item__qq:hover:not(:disabled) {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.contact-item__qq:disabled {
  cursor: default;
}

.contact-item__qq-icon {
  color: #12b7f5;
  flex-shrink: 0;
}

.contact-item__qq-num {
  font-variant-numeric: tabular-nums;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0.02em;
}

.contact-item__qq.is-full {
  color: var(--app-text-muted);
  background: transparent;
  border-color: var(--el-border-color-extra-light);
}

.contact-item__qq.is-full .contact-item__qq-num {
  text-decoration: line-through;
  text-decoration-thickness: 1px;
}

.contact-item__qq.is-full .contact-item__qq-icon {
  opacity: 0.5;
}

.contact-item__qq-badge {
  padding: 0 5px;
  border-radius: 999px;
  background: var(--el-color-danger-light-9);
  color: var(--el-color-danger);
  font-size: 11px;
  line-height: 1.45;
  white-space: nowrap;
}

/* 捐赠 */
.donation-tip {
  margin: 0 0 12px;
  color: var(--app-text-muted);
  font-size: 13px;
}

.donation-body {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
}

.donation-qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.donation-qr__img {
  width: 160px;
  height: 220px;
  border-radius: 10px;
  border: 1px solid var(--app-border-color);
}

.donation-qr__label {
  font-size: 13px;
  color: var(--app-text-primary);
}

@media (max-width: 992px) {
  .home-intro__features {
    grid-template-columns: 1fr;
  }

  .home-bottom {
    flex-direction: column;
  }

  .home-bottom__log {
    position: static;
    flex: none;
  }

  .home-bottom__log > .home-card--fill {
    position: static;
    max-height: 360px;
  }
}

@media (max-width: 768px) {
  .tech-row__main {
    flex-wrap: wrap;
    gap: 2px 6px;
  }

  .tech-row__desc {
    white-space: normal;
  }

  .log-source {
    margin-left: 0;
    width: 100%;
  }
}
</style>
