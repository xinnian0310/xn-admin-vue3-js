<template>
  <div class="page-card site-contact-page" v-loading="loading">
    <div class="page-header">
      <div class="site-contact-page__heading">
        <h2 class="page-title">联系与捐赠</h2>
        <p class="site-contact-page__hint">
          图标与标签固定；每项可选择分类（文本 / 链接 / 邮箱 /
          QQ群），内容表单随分类变化。QQ群支持多群号与已满状态。修改后立即同步。
        </p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="site-contact-page__tabs">
      <el-tab-pane label="联系我们" name="contacts">
        <xnPageLayout :show-pagination="false" :loading="false">
          <template #toolbar>
            <xnButton
              :list-item="crudButtons"
              :selected="contactSelected"
              @button-click="onContactToolbar"
            />
          </template>
          <template #table>
            <xnTable
              :data="contacts"
              :total="contacts.length"
              :loading="false"
              table-key="system:site-contact:contacts"
              entity-name="联系项"
              name-field="label"
              :columns="contactColumns"
              :action-items="tableActions"
              :show-pagination="false"
              stripe
              @selection-change="(rows) => (contactSelected = rows)"
            >
              <template #icon="{ row }">
                <span class="icon-cell">
                  <xnAppIcon v-if="row.icon" :name="row.icon" />
                  <span>{{ row.icon || '—' }}</span>
                </span>
              </template>
              <template #type="{ row }">
                {{ contactTypeLabel(resolveContactType(row)) }}
              </template>
              <template #value="{ row }">
                <template v-if="isQqContact(row) && row.groups?.length">
                  <span
                    v-for="(g, gi) in row.groups"
                    :key="gi"
                    class="qq-chip"
                    :class="{ 'is-full': g.full }"
                  >
                    <xnAppIcon name="ri:qq-fill" :size="14" class="qq-chip__icon" />
                    <span class="qq-chip__num">{{ g.value }}</span>
                    <em v-if="g.full">已满</em>
                  </span>
                </template>
                <span v-else>{{ row.value || '—' }}</span>
              </template>
              <template #link="{ row }">
                <template v-if="resolveContactType(row) === 'qq'">
                  <span class="muted">—</span>
                </template>
                <a
                  v-else-if="row.link"
                  :href="row.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="link-cell"
                >
                  {{ row.link }}
                </a>
                <span v-else class="muted">—</span>
              </template>
              <template #actions="{ row, $index }">
                <xnTableActions
                  :items="tableActions"
                  :row="{ ...row, __index: $index }"
                  @action-click="onContactTableAction"
                />
              </template>
            </xnTable>
          </template>
        </xnPageLayout>
      </el-tab-pane>

      <el-tab-pane label="捐赠二维码" name="donation">
        <div class="donation-tip-panel">
          <div class="donation-tip-panel__head">
            <span class="donation-tip-panel__title">捐赠说明</span>
            <span class="donation-tip-panel__sub"
              >展示在管理端首页与官网捐赠区域上方，失焦后自动保存</span
            >
          </div>
          <el-input
            v-model="donationTip"
            type="textarea"
            :rows="2"
            maxlength="200"
            show-word-limit
            placeholder="例如：如果这个项目对你有帮助，欢迎请作者喝杯咖啡"
            @blur="saveDonationTip"
          />
        </div>

        <xnPageLayout :show-pagination="false" :loading="false">
          <template #toolbar>
            <xnButton :list-item="crudButtons" :selected="qrSelected" @button-click="onQrToolbar" />
          </template>
          <template #table>
            <xnTable
              :data="qrcodes"
              :total="qrcodes.length"
              :loading="false"
              table-key="system:site-contact:qrcodes"
              entity-name="捐赠二维码"
              name-field="label"
              :columns="qrColumns"
              :action-items="tableActions"
              :show-pagination="false"
              stripe
              @selection-change="(rows) => (qrSelected = rows)"
            >
              <template #src="{ row }">
                <el-image
                  v-if="row.src"
                  :src="row.src"
                  :preview-src-list="[row.src]"
                  fit="contain"
                  class="qr-thumb"
                  preview-teleported
                />
                <span v-else class="muted">未上传</span>
              </template>
              <template #actions="{ row, $index }">
                <xnTableActions
                  :items="tableActions"
                  :row="{ ...row, __index: $index }"
                  @action-click="onQrTableAction"
                />
              </template>
            </xnTable>
          </template>
        </xnPageLayout>
      </el-tab-pane>
    </el-tabs>

    <ContactSave ref="contactSaveRef" @success="onContactSaved" />
    <QrcodeSave ref="qrSaveRef" @success="onQrSaved" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, View } from '@element-plus/icons-vue'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTableActions from '@/components/xnButton/xnTableActions.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import ContactSave from './contact-save.vue'
import QrcodeSave from './qrcode-save.vue'
import { getSiteContact, updateSiteContact } from '@/api/site-contact'
import { showCaughtError } from '@/utils/request'
import { contactTypeLabel, isQqContact, resolveContactType } from '@/types/site-contact'
defineOptions({ name: 'SystemSiteContact' })
/** 联系/捐赠项数量固定，仅支持编辑与查看 */
const crudButtons = [
  {
    name: '编辑',
    action: 'edit',
    type: 'button',
    icon: Edit,
    typeColor: 'primary',
    index: 0,
  },
  {
    name: '查看',
    action: 'view',
    type: 'button',
    icon: View,
    typeColor: 'primary',
    index: 0,
  },
]
const tableActions = [
  { name: '编辑', type: 'button', action: 'edit' },
  { name: '查看', type: 'button', action: 'view' },
]
const loading = ref(false)
const activeTab = ref('contacts')
const donationTip = ref('')
const tipSnapshot = ref('')
const contacts = ref([])
const qrcodes = ref([])
const contactSelected = ref([])
const qrSelected = ref([])
const contactSaveRef = ref()
const qrSaveRef = ref()
const contactColumns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'index', label: '序号', width: 60 },
  { type: 'slot', slot: 'icon', prop: 'icon', label: '图标', width: 140 },
  { prop: 'label', label: '标签', minWidth: 100 },
  { type: 'slot', slot: 'type', prop: 'type', label: '分类', width: 90 },
  { type: 'slot', slot: 'value', prop: 'value', label: '内容', minWidth: 220 },
  { type: 'slot', slot: 'link', prop: 'link', label: '链接', minWidth: 180 },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]
const qrColumns = [
  { type: 'selection', width: 50, fixed: true },
  { type: 'index', label: '序号', width: 60 },
  { prop: 'label', label: '名称', minWidth: 160 },
  { type: 'slot', slot: 'src', prop: 'src', label: '二维码', width: 120, align: 'center' },
  { type: 'slot', slot: 'actions', label: '操作', width: 140, fixed: 'right' },
]
function applyConfig(data) {
  contacts.value = (data.contacts ?? []).map((c) => {
    const item = {
      icon: c.icon || 'Link',
      label: c.label || '',
      type: resolveContactType(c),
      value: c.value || '',
      link: c.link || '',
    }
    if (item.type === 'qq') {
      const groups = (c.groups ?? [])
        .filter((g) => g.value?.trim())
        .map((g) => ({ value: g.value.trim(), full: Boolean(g.full) }))
      item.groups = groups.length ? groups : item.value ? [{ value: item.value, full: false }] : []
      if (item.groups.length) item.value = item.groups[0].value
      item.link = ''
    }
    return item
  })
  donationTip.value = data.donation?.tip || ''
  tipSnapshot.value = donationTip.value
  qrcodes.value = (data.donation?.qrcodes ?? []).map((q) => ({
    label: q.label || '',
    src: q.src || '',
  }))
}
function buildPayload(
  nextContacts = contacts.value,
  nextTip = donationTip.value,
  nextQrs = qrcodes.value,
) {
  return {
    contacts: nextContacts.map((c) => {
      const type = resolveContactType(c)
      if (type === 'qq') {
        const groups = (c.groups ?? [])
          .map((g) => ({ value: String(g.value || '').trim(), full: Boolean(g.full) }))
          .filter((g) => g.value)
        return {
          icon: c.icon || 'ChatDotRound',
          label: c.label.trim(),
          type,
          value: groups[0]?.value || '',
          link: null,
          groups,
        }
      }
      if (type === 'email') {
        const email = c.value.trim()
        return {
          icon: c.icon || 'Message',
          label: c.label.trim(),
          type,
          value: email,
          link: email ? `mailto:${email}` : null,
        }
      }
      if (type === 'link') {
        return {
          icon: c.icon || 'Link',
          label: c.label.trim(),
          type,
          value: c.value.trim(),
          link: c.link?.trim() || null,
        }
      }
      return {
        icon: c.icon || 'Link',
        label: c.label.trim(),
        type: 'text',
        value: c.value.trim(),
        link: null,
      }
    }),
    donation: {
      tip: nextTip.trim(),
      qrcodes: nextQrs.map((q) => ({
        label: q.label.trim(),
        src: q.src.trim(),
      })),
    },
  }
}
async function loadConfig() {
  loading.value = true
  try {
    const res = await getSiteContact()
    applyConfig(res.data)
  } catch (e) {
    showCaughtError(e, '加载失败')
  } finally {
    loading.value = false
  }
}
async function persist(payload, successMsg) {
  loading.value = true
  try {
    const res = await updateSiteContact(payload)
    applyConfig(res.data)
    ElMessage.success(successMsg)
  } catch (e) {
    showCaughtError(e, '操作失败')
    await loadConfig()
  } finally {
    loading.value = false
  }
}
async function saveDonationTip() {
  if (donationTip.value.trim() === tipSnapshot.value.trim()) return
  await persist(buildPayload(), '捐赠说明已保存')
}
function resolveRowIndex(row, listLen) {
  const idx = Number(row.__index)
  if (Number.isInteger(idx) && idx >= 0 && idx < listLen) return idx
  return -1
}
function onContactToolbar(action) {
  if (contactSelected.value.length !== 1) {
    ElMessage.warning('请选择一项操作')
    return
  }
  const row = contactSelected.value[0]
  const index = contacts.value.findIndex(
    (c) => c.label === row.label && c.value === row.value && c.link === row.link,
  )
  const resolved = index >= 0 ? index : resolveRowIndex(row, contacts.value.length)
  if (resolved < 0) {
    ElMessage.warning('未找到选中项')
    return
  }
  if (action === 'edit') contactSaveRef.value?.open('edit', contacts.value[resolved], resolved)
  if (action === 'view') contactSaveRef.value?.open('view', contacts.value[resolved], resolved)
}
function onQrToolbar(action) {
  if (qrSelected.value.length !== 1) {
    ElMessage.warning('请选择一项操作')
    return
  }
  const row = qrSelected.value[0]
  const index = qrcodes.value.findIndex((q) => q.label === row.label && q.src === row.src)
  const resolved = index >= 0 ? index : resolveRowIndex(row, qrcodes.value.length)
  if (resolved < 0) {
    ElMessage.warning('未找到选中项')
    return
  }
  if (action === 'edit') qrSaveRef.value?.open('edit', qrcodes.value[resolved], resolved)
  if (action === 'view') qrSaveRef.value?.open('view', qrcodes.value[resolved], resolved)
}
function onContactTableAction(payload) {
  const index = resolveRowIndex(payload.row, contacts.value.length)
  if (index < 0) return
  const row = contacts.value[index]
  if (payload.action === 'edit') contactSaveRef.value?.open('edit', row, index)
  if (payload.action === 'view') contactSaveRef.value?.open('view', row, index)
}
function onQrTableAction(payload) {
  const index = resolveRowIndex(payload.row, qrcodes.value.length)
  if (index < 0) return
  const row = qrcodes.value[index]
  if (payload.action === 'edit') qrSaveRef.value?.open('edit', row, index)
  if (payload.action === 'view') qrSaveRef.value?.open('view', row, index)
}
async function onContactSaved(payload) {
  if (payload.mode !== 'edit' || payload.index == null) return
  const next = [...contacts.value]
  next[payload.index] = payload.data
  await persist(buildPayload(next), '更新成功')
}
async function onQrSaved(payload) {
  if (payload.mode !== 'edit' || payload.index == null) return
  const next = [...qrcodes.value]
  next[payload.index] = payload.data
  await persist(buildPayload(contacts.value, donationTip.value, next), '更新成功')
}
loadConfig()
</script>

<style scoped>
.site-contact-page__heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.site-contact-page__hint {
  margin: 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.5;
}

.site-contact-page__tabs {
  margin-top: 4px;
}

.icon-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.link-cell {
  color: var(--el-color-primary);
  text-decoration: none;
}

.link-cell:hover {
  text-decoration: underline;
}

.muted {
  color: var(--el-text-color-placeholder);
}

.qq-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 10px;
  font-variant-numeric: tabular-nums;
}

.qq-chip__icon {
  color: #12b7f5;
  flex-shrink: 0;
}

.qq-chip.is-full {
  color: var(--el-text-color-placeholder);
}

.qq-chip.is-full .qq-chip__num {
  text-decoration: line-through;
}

.qq-chip.is-full .qq-chip__icon {
  opacity: 0.55;
}

.qq-chip em {
  font-style: normal;
  font-size: 12px;
  color: var(--el-color-danger);
}

.donation-tip-panel {
  margin-bottom: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}

.donation-tip-panel__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
  margin-bottom: 10px;
}

.donation-tip-panel__title {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.donation-tip-panel__sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.qr-thumb {
  width: 56px;
  height: 56px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.site-contact-page :deep(.page-layout) {
  min-height: auto;
}

.site-contact-page :deep(.page-layout__main) {
  padding-bottom: 0;
}
</style>
