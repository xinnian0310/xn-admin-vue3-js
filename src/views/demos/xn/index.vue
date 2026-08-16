<template>
  <div class="demo-page">
    <div class="demo-page__header">
      <div>
        <h2 class="demo-page__title">系统组件</h2>
        <p class="demo-page__desc">
          展示本项目封装的 xn* 业务组件。说明文案为静态介绍，示例数据均为本地写死，不请求后端。
        </p>
      </div>
      <el-tag type="warning" effect="plain">xn*</el-tag>
    </div>

    <el-tabs v-model="activeTab" tab-position="left" class="demo-page__tabs">
      <el-tab-pane label="页面布局" name="layout">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>页面布局</span>
              <el-tag size="small" type="primary" effect="plain">xnPageLayout</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="列表页标准壳：左侧树 / 搜索区 / 工具栏 / 表格或卡片 / 分页。业务页应优先使用该布局保持风格一致。"
            class="demo-intro"
          />
          <div class="demo-layout-box">
            <xnPageLayout
              v-model:page="page"
              v-model:page-size="pageSize"
              :show-pagination="true"
              :total="tableRows.length"
            >
              <template #aside>
                <xnTreePanel
                  title="组织树"
                  :data="treeData"
                  :current-key="treeKey"
                  @node-click="onTreeClick"
                />
              </template>
              <template #search>
                <xnSearch
                  :search-item="searchItems"
                  @query-form="(form) => ElMessage.info(`查询：${JSON.stringify(form)}`)"
                  @reset="() => ElMessage.success('已重置')"
                />
              </template>
              <template #toolbar>
                <xnButton
                  :list-item="buttonItems"
                  :selected="selected"
                  @button-click="(action) => ElMessage.info(`工具栏：${action}`)"
                />
              </template>
              <template #table>
                <xnTable
                  :data="tableRows"
                  :columns="tableColumns"
                  :show-pagination="false"
                  @selection-change="(rows) => (selected = rows)"
                />
              </template>
            </xnPageLayout>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="搜索表单" name="search">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>搜索表单</span>
              <el-tag size="small" type="primary" effect="plain">xnSearch</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="根据 SearchItem[] 配置驱动的查询表单，支持 input / number / select / date / daterange / datetime，字段过多时可折叠。"
            class="demo-intro"
          />
          <xnSearch
            :search-item="searchItems"
            :collapse-count="2"
            @query-form="(form) => ElMessage.info(`查询：${JSON.stringify(form)}`)"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="工具栏" name="button">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>工具栏按钮</span>
              <el-tag size="small" type="primary" effect="plain">xnButton</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="配置化工具栏：支持权限过滤、按选中行数禁用、下拉分组。动作通过 buttonClick 回调交给页面处理。"
            class="demo-intro"
          />
          <xnButton
            :list-item="buttonItems"
            :selected="selected"
            @button-click="(action) => ElMessage.info(`点击：${action}`)"
          />
          <p class="demo-hint">当前选中 {{ selected.length }} 项（可在「页面布局」表格中勾选）。</p>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="数据表格" name="table">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>数据表格</span>
              <el-tag size="small" type="primary" effect="plain">xnTable</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="统一列表表格：内置序号/多选/标签/开关/长文本等列类型，可对接 CRUD API 或直接传入本地 data。"
            class="demo-intro"
          />
          <xnTable :data="tableRows" :columns="tableColumns" :show-pagination="false" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="树面板" name="tree">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>左侧树面板</span>
              <el-tag size="small" type="primary" effect="plain">xnTreePanel</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="带标题与关键字过滤的树面板，常与 xnPageLayout 的 aside 插槽搭配，用于单位/菜单等树形筛选。"
            class="demo-intro"
          />
          <xnTreePanel
            title="示例树"
            :width="280"
            :data="treeData"
            :current-key="treeKey"
            @node-click="onTreeClick"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="图标选择" name="icon">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>图标选择器</span>
              <el-tag size="small" type="primary" effect="plain">xnIconPicker</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="支持 Element / Iconify / SVG 图标选择，用于路由、菜单、按钮等图标配置。"
            class="demo-intro"
          />
          <div style="max-width: 420px">
            <xnIconPicker v-model="icon" />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="富文本" name="rich">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>富文本编辑器</span>
              <el-tag size="small" type="primary" effect="plain">xnRichEditor</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="富文本编辑器，图片/视频/附件走 XnUpload；支持公式、@提及、Markdown、链接卡片。"
            class="demo-intro"
          />
          <xnRichEditor v-model="richHtml" height="220px" />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="长文本" name="longText">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>长文本</span>
              <el-tag size="small" type="primary" effect="plain">xnLongText</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="表格或详情中展示长文本：超出时可点击弹窗查看全文，并支持复制。"
            class="demo-intro"
          />
          <xnLongText
            text="这是一段用于演示的超长文本内容，点击后可以在弹窗中查看完整信息，并便于复制或阅读。"
            :max-length="20"
            title="备注详情"
          />
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="大文件上传" name="upload">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>大文件分片上传</span>
              <el-tag size="small" type="primary" effect="plain">xnUpload</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="小文件单请求直传，大文件自动分片：Worker 算指纹 → 秒传探测 → 并发上传（失败指数退避重试）→ 服务端合并。可暂停 / 继续 / 取消；刷新页面后重新选择同一文件即可续传。"
            class="demo-intro"
          />
          <el-form :inline="true" size="small" class="demo-upload__form">
            <el-form-item label="分片大小">
              <el-select v-model="uploadChunkSize" style="width: 100px">
                <el-option label="5 MB" :value="5 * 1024 * 1024" />
                <el-option label="8 MB" :value="8 * 1024 * 1024" />
                <el-option label="10 MB" :value="10 * 1024 * 1024" />
                <el-option label="20 MB" :value="20 * 1024 * 1024" />
              </el-select>
            </el-form-item>
            <el-form-item label="并发数">
              <el-input-number v-model="uploadConcurrency" :min="1" :max="8" style="width: 110px" />
            </el-form-item>
            <el-form-item label="重试次数">
              <el-input-number v-model="uploadMaxRetries" :min="0" :max="6" style="width: 110px" />
            </el-form-item>
            <el-form-item label="指纹算法">
              <el-select v-model="uploadHashAlgo" style="width: 170px">
                <el-option label="分片树摘要（原生，快）" value="sha256-tree" />
                <el-option label="全量 SHA-256（较慢）" value="sha256" />
              </el-select>
            </el-form-item>
            <el-form-item label="秒传">
              <el-switch v-model="uploadInstant" />
            </el-form-item>
            <el-form-item label="断点续传">
              <el-switch v-model="uploadResume" />
            </el-form-item>
            <el-form-item label="计算指纹">
              <el-switch v-model="uploadHash" />
            </el-form-item>
          </el-form>
          <xnUpload
            :chunk-size="uploadChunkSize"
            :concurrency="uploadConcurrency"
            :max-retries="uploadMaxRetries"
            :hash-algo="uploadHashAlgo"
            :enable-instant="uploadInstant"
            :enable-resume="uploadResume"
            :enable-hash="uploadHash"
            :max-size="10 * 1024 * 1024 * 1024"
            @success="onUploadSuccess"
            @error="onUploadError"
          />
          <div v-if="uploadLogs.length" class="demo-upload__logs">
            <div v-for="(log, index) in uploadLogs" :key="index">{{ log }}</div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="图标品牌" name="brand">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>图标 / 品牌</span>
              <el-tag size="small" type="primary" effect="plain">xnAppIcon · xnAppBrandLogo</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="xnAppIcon 统一解析 Element / Iconify / SVG；xnAppBrandLogo 展示系统品牌 Logo。"
            class="demo-intro"
          />
          <el-space :size="24" wrap>
            <el-space>
              <xnAppIcon name="HomeFilled" :size="20" />
              <xnAppIcon name="Setting" :size="20" />
              <xnAppIcon :name="icon" :size="20" />
              <el-text type="info">{{ icon }}</el-text>
            </el-space>
            <xnAppBrandLogo />
          </el-space>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="权限指令" name="auth">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>权限指令</span>
              <el-tag size="small" type="primary" effect="plain">v-permission</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="无权限时移除 DOM 节点。按钮级权限控制的标准写法。"
            class="demo-intro"
          />
          <el-space>
            <el-tag v-permission="'menu:dashboard'" type="success">你拥有 menu:dashboard</el-tag>
            <el-tag v-permission="'demo:never-exist-permission'" type="danger">不应出现</el-tag>
            <el-text type="info">第二条使用不存在的权限码，无权限时会被指令隐藏。</el-text>
          </el-space>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="其它说明" name="other">
        <el-card shadow="never" class="demo-section">
          <template #header>
            <div class="demo-section__head">
              <span>其它组件说明</span>
              <el-tag size="small" type="info" effect="plain">xnImport / xnTagsView / …</el-tag>
            </div>
          </template>
          <el-alert
            type="info"
            show-icon
            :closable="false"
            title="部分组件依赖布局或业务流程，此处仅作说明，不单独挂载。"
            class="demo-intro"
          />
          <ul class="demo-note-list">
            <li>
              <strong>xnImport</strong>：Excel
              模板下载、预览与导入对话框，多用于用户/字典等批量导入。
            </li>
            <li><strong>xnTagsView</strong>：多标签页访问记录，位于顶栏布局中。</li>
            <li><strong>xnNoticeInbox</strong>：公告/消息铃铛与抽屉，位于顶栏。</li>
            <li><strong>xnThemePicker / xnUiPreferenceFab</strong>：主题与界面偏好设置入口。</li>
            <li><strong>xnErrorPage</strong>：403 / 404 / 503 错误页壳。</li>
            <li><strong>xnSidebarMenu</strong>：侧栏菜单（含搜索高亮），由布局使用。</li>
          </ul>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Delete, Download, Edit, Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import xnPageLayout from '@/components/xnPageLayout/xnPageLayout.vue'
import xnSearch from '@/components/xnSearch/xnSearch.vue'
import xnButton from '@/components/xnButton/xnButton.vue'
import xnTable from '@/components/xnTable/xnTable.vue'
import xnTreePanel from '@/components/xnTreePanel/xnTreePanel.vue'
import xnIconPicker from '@/components/xnIconPicker/xnIconPicker.vue'
import xnRichEditor from '@/components/xnRichEditor/xnRichEditor.vue'
import xnLongText from '@/components/xnLongText/xnLongText.vue'
import xnAppIcon from '@/components/xnAppIcon/xnAppIcon.vue'
import xnAppBrandLogo from '@/components/xnAppBrandLogo/xnAppBrandLogo.vue'
import xnUpload from '@/components/xnUpload/xnUpload.vue'

defineOptions({ name: 'DemoXnPage' })

const activeTab = ref('layout')

const uploadChunkSize = ref(8 * 1024 * 1024)
const uploadConcurrency = ref(3)
const uploadMaxRetries = ref(3)
const uploadHashAlgo = ref('sha256-tree')
const uploadInstant = ref(true)
const uploadResume = ref(true)
const uploadHash = ref(true)
const uploadLogs = ref([])
const treeKey = ref('1')
const icon = ref('HomeFilled')
const richHtml = ref('<p>欢迎使用 <strong>xnRichEditor</strong></p>')
const selected = ref([])
const page = ref(1)
const pageSize = ref(10)

const treeData = [
  {
    id: '1',
    name: '总公司',
    children: [
      { id: '1-1', name: '研发中心', children: [{ id: '1-1-1', name: '前端组' }] },
      { id: '1-2', name: '运营中心' },
    ],
  },
]

const searchItems = [
  { label: '名称', prop: 'name', type: 'input', placeholder: '请输入名称' },
  {
    label: '状态',
    prop: 'status',
    type: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
  },
  { label: '创建日期', prop: 'createdAt', type: 'daterange' },
  { label: '年龄', prop: 'age', type: 'number' },
]

const buttonItems = [
  { name: '新增', action: 'add', type: 'button', icon: Plus, typeColor: 'primary' },
  { name: '编辑', action: 'edit', type: 'button', icon: Edit, typeColor: 'primary', index: 0 },
  { name: '删除', action: 'delete', type: 'button', icon: Delete, typeColor: 'danger', index: 1 },
  {
    name: '更多',
    type: 'down',
    icon: Download,
    typeColor: 'default',
    searchItem: [
      { name: '导出', action: 'export', icon: Download },
      { name: '导入', action: 'import', icon: Upload },
    ],
  },
]

const tableColumns = [
  { type: 'selection', width: 48 },
  { type: 'index', label: '#', width: 56 },
  { label: '名称', prop: 'name', minWidth: 120 },
  {
    label: '状态',
    prop: 'status',
    type: 'tag',
    width: 100,
    options: [
      { label: '启用', value: 1, type: 'success' },
      { label: '停用', value: 0, type: 'info' },
    ],
  },
  { label: '备注', prop: 'remark', type: 'longText', minWidth: 160 },
]

const tableRows = [
  { id: 1, name: '示例用户 A', status: 1, remark: '这是一段较短的备注' },
  {
    id: 2,
    name: '示例用户 B',
    status: 0,
    remark: '这是一段很长很长的备注内容，用于演示 longText 列在表格中的截断与点击展开效果。',
  },
  { id: 3, name: '示例用户 C', status: 1, remark: '另一条备注' },
]

function onTreeClick(node) {
  treeKey.value = String(node.id)
  ElMessage.info(`选中：${String(node.name)}`)
}

function pushUploadLog(text) {
  uploadLogs.value.unshift(`${new Date().toLocaleTimeString()} · ${text}`)
  if (uploadLogs.value.length > 8) uploadLogs.value.pop()
}

function onUploadSuccess(file, task) {
  pushUploadLog(
    `${task.instant ? '秒传命中' : '上传成功'}：${file.name} → ${file.url || file.path}`,
  )
  ElMessage.success(`${file.name} ${task.instant ? '秒传完成' : '上传完成'}`)
}

function onUploadError(message, task) {
  pushUploadLog(`失败：${task.name} — ${message}`)
  ElMessage.error(`${task.name} 上传失败：${message}`)
}
</script>

<style scoped>
.demo-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  box-sizing: border-box;
  padding: 16px 20px 24px;
}

.demo-page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.demo-page__title {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.demo-page__desc {
  margin: 0;
  max-width: 720px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.demo-page__tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 12px 8px 12px 0;
}

.demo-page__tabs :deep(.el-tabs__header.is-left) {
  margin-right: 0;
  flex-shrink: 0;
}

.demo-page__tabs :deep(.el-tabs__content) {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 0 8px 8px 16px;
}

.demo-section {
  margin-bottom: 12px;
}

.demo-section__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-intro {
  margin-bottom: 14px;
}

.demo-layout-box {
  border: 1px dashed var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  min-height: 420px;
}

.demo-hint {
  margin: 8px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.demo-note-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.demo-upload__form {
  margin-bottom: 4px;
}

.demo-upload__form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.demo-upload__logs {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  line-height: 1.9;
  color: var(--el-text-color-secondary);
  word-break: break-all;
}
</style>
