<template>
  <div class="demo-page" id="demo-ui-top">
    <div class="demo-page__header">
      <div>
        <h2 class="demo-page__title">Element Plus 基础组件</h2>
        <p class="demo-page__desc">
          按 Element Plus 常用分类展示组件示例，便于对照主题色、尺寸与暗色模式效果。完整 API
          请参阅官方文档。
        </p>
      </div>
      <el-tag type="primary" effect="plain">Element Plus</el-tag>
    </div>

    <el-tabs v-model="activeTab" tab-position="left" class="demo-page__tabs">
      <el-tab-pane label="通用" name="general">
        <el-card shadow="never" class="demo-section">
          <template #header>Button 按钮</template>
          <el-space wrap>
            <el-button type="primary">Primary</el-button>
            <el-button>Default</el-button>
            <el-button type="success">Success</el-button>
            <el-button type="info">Info</el-button>
            <el-button type="warning">Warning</el-button>
            <el-button type="danger">Danger</el-button>
            <el-button type="primary" :icon="Plus">带图标</el-button>
            <el-button type="primary" loading>Loading</el-button>
            <el-button type="primary" :icon="Search" circle />
            <el-button disabled>Disabled</el-button>
            <el-button type="primary" link>Link</el-button>
            <el-button type="primary" text>Text</el-button>
          </el-space>
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Link / Text / Icon</template>
          <el-space wrap :size="16">
            <el-link type="primary">Primary</el-link>
            <el-link type="success">Success</el-link>
            <el-link type="warning">Warning</el-link>
            <el-link type="danger">Danger</el-link>
            <el-link type="info">Info</el-link>
            <el-text type="primary">Primary Text</el-text>
            <el-text truncated style="max-width: 120px">超长文本会被截断显示</el-text>
            <el-icon :size="18"><Setting /></el-icon>
            <el-icon :size="18" color="var(--el-color-primary)"><Star /></el-icon>
          </el-space>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="布局" name="layout">
        <el-card shadow="never" class="demo-section">
          <template #header>Layout / Container / Space / Divider</template>
          <el-row :gutter="8">
            <el-col v-for="(span, idx) in gridSpans" :key="idx" :span="span">
              <div class="demo-grid-cell">span={{ span }}</div>
            </el-col>
          </el-row>
          <el-divider content-position="left">分割线</el-divider>
          <el-space>
            <el-button>A</el-button>
            <el-button>B</el-button>
            <el-button>C</el-button>
          </el-space>
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Scrollbar / Splitter 风格面板</template>
          <el-scrollbar height="120px">
            <p v-for="i in 12" :key="i" class="demo-scroll-line">滚动内容 {{ i }}</p>
          </el-scrollbar>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="导航" name="nav">
        <el-card shadow="never" class="demo-section">
          <template #header>Breadcrumb / Dropdown / Pagination / Menu</template>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>
              <el-icon><HomeFilled /></el-icon>
              <span style="margin-left: 4px">首页</span>
            </el-breadcrumb-item>
            <el-breadcrumb-item>组件演示</el-breadcrumb-item>
            <el-breadcrumb-item>基础组件</el-breadcrumb-item>
          </el-breadcrumb>
          <el-divider />
          <el-dropdown>
            <el-button>
              下拉菜单 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>菜单项一</el-dropdown-item>
                <el-dropdown-item>菜单项二</el-dropdown-item>
                <el-dropdown-item divided>菜单项三</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-divider />
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="50"
            :page-sizes="[10, 20, 50]"
          />
          <el-divider />
          <el-menu mode="horizontal" :ellipsis="false" default-active="1">
            <el-menu-item index="1">导航一</el-menu-item>
            <el-menu-item index="2">导航二</el-menu-item>
            <el-sub-menu index="3">
              <template #title>导航三</template>
              <el-menu-item index="3-1">选项 1</el-menu-item>
              <el-menu-item index="3-2">选项 2</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Steps / Tabs / Affix / Anchor / Backtop</template>
          <el-steps :active="1" finish-status="success" align-center>
            <el-step title="填写" description="基本信息" />
            <el-step title="确认" description="核对内容" />
            <el-step title="完成" description="提交成功" />
          </el-steps>
          <el-divider />
          <el-tabs type="card">
            <el-tab-pane label="标签 A">内容 A</el-tab-pane>
            <el-tab-pane label="标签 B">内容 B</el-tab-pane>
            <el-tab-pane label="标签 C">内容 C</el-tab-pane>
          </el-tabs>
          <el-divider />
          <el-affix :offset="80">
            <el-button type="primary">固钉示例（滚动时吸顶）</el-button>
          </el-affix>
          <el-divider />
          <el-anchor :offset="80">
            <el-anchor-link href="#demo-ui-top" title="页顶" />
            <el-anchor-link href="#demo-ui-form" title="表单区" />
          </el-anchor>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="数据录入" name="form">
        <div id="demo-ui-form">
          <el-card shadow="never" class="demo-section">
            <template #header>表单控件</template>
            <el-form label-width="110px" class="demo-form">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="Input">
                    <el-input v-model="form.name" placeholder="请输入" clearable :prefix-icon="User" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Password">
                    <el-input v-model="form.password" type="password" show-password placeholder="密码" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Textarea">
                    <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="多行文本" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="InputNumber">
                    <el-input-number v-model="form.age" :min="0" :max="100" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Select">
                    <el-select v-model="form.city" placeholder="请选择" clearable style="width: 100%">
                      <el-option label="杭州" value="hz" />
                      <el-option label="上海" value="sh" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Cascader">
                    <el-cascader v-model="form.region" :options="cascaderOptions" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="TreeSelect">
                    <el-tree-select
                      v-model="form.dept"
                      :data="treeSelectData"
                      check-strictly
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="DatePicker">
                    <el-date-picker v-model="form.date" type="date" placeholder="选择日期" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="DateRange">
                    <el-date-picker
                      v-model="form.range"
                      type="daterange"
                      start-placeholder="开始"
                      end-placeholder="结束"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="TimePicker">
                    <el-time-picker v-model="form.time" placeholder="选择时间" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Radio">
                    <el-radio-group v-model="form.radio">
                      <el-radio value="a">A</el-radio>
                      <el-radio value="b">B</el-radio>
                      <el-radio-button value="c">C</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Checkbox">
                    <el-checkbox-group v-model="form.checks">
                      <el-checkbox label="苹果" value="apple" />
                      <el-checkbox label="香蕉" value="banana" />
                      <el-checkbox label="橙子" value="orange" />
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Switch">
                    <el-switch v-model="form.enabled" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Slider">
                    <el-slider v-model="form.score" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Rate">
                    <el-rate v-model="form.rate" allow-half />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="ColorPicker">
                    <el-color-picker v-model="form.color" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Segmented">
                    <el-segmented v-model="form.segment" :options="['日', '周', '月', '年']" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Mention">
                    <el-mention v-model="form.mention" :options="mentionOptions" placeholder="输入 @ 提及" />
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="Upload">
                    <el-upload action="#" :auto-upload="false" list-type="picture-card">
                      <el-icon><Plus /></el-icon>
                    </el-upload>
                  </el-form-item>
                </el-col>
                <el-col :span="24">
                  <el-form-item label="Transfer">
                    <el-transfer v-model="form.transfer" :data="transferData" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据展示" name="data">
        <el-card shadow="never" class="demo-section">
          <template #header>Table / Tag / Badge / Avatar</template>
          <el-space wrap style="margin-bottom: 12px">
            <el-tag>默认</el-tag>
            <el-tag type="success">成功</el-tag>
            <el-tag type="warning">警告</el-tag>
            <el-tag type="danger">危险</el-tag>
            <el-tag type="info">信息</el-tag>
            <el-badge :value="5" class="demo-badge">
              <el-avatar :icon="UserFilled" shape="square" />
            </el-badge>
            <el-badge is-dot>
              <el-button>消息</el-button>
            </el-badge>
            <el-avatar :icon="UserFilled" />
            <el-avatar>A</el-avatar>
            <el-avatar>B</el-avatar>
            <el-avatar>C</el-avatar>
          </el-space>
          <el-table :data="tableData" border size="small" style="width: 100%">
            <el-table-column prop="name" label="姓名" />
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="city" label="城市" />
          </el-table>
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Descriptions / List / Empty / Image / Tree / Timeline</template>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="系统">xn-admin-vue3-js</el-descriptions-item>
            <el-descriptions-item label="UI">Element Plus</el-descriptions-item>
            <el-descriptions-item label="说明" :span="2">
              本页用于演示 Element Plus 常用组件外观与交互。
            </el-descriptions-item>
          </el-descriptions>
          <el-divider />
          <el-row :gutter="16">
            <el-col :span="8">
              <el-tree :data="treeData" :props="{ label: 'label', children: 'children' }" default-expand-all />
            </el-col>
            <el-col :span="8">
              <el-timeline>
                <el-timeline-item timestamp="创建账号" />
                <el-timeline-item timestamp="完善资料" type="success" />
                <el-timeline-item timestamp="开始使用" type="info" />
              </el-timeline>
            </el-col>
            <el-col :span="8">
              <el-empty description="空状态" :image-size="72" />
            </el-col>
          </el-row>
          <el-divider />
          <el-image
            style="width: 120px; height: 80px"
            src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
            fit="cover"
          />
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Collapse / Calendar / Carousel / Statistic / Progress</template>
          <el-collapse>
            <el-collapse-item title="面板一" name="1">内容一</el-collapse-item>
            <el-collapse-item title="面板二" name="2">内容二</el-collapse-item>
          </el-collapse>
          <el-divider />
          <el-row :gutter="16">
            <el-col :span="8">
              <el-statistic title="用户数" :value="1286" />
            </el-col>
            <el-col :span="8">
              <el-progress :percentage="70" />
            </el-col>
            <el-col :span="8">
              <el-progress type="circle" :percentage="55" :width="80" />
            </el-col>
          </el-row>
          <el-divider />
          <el-calendar v-model="calendarDate" />
          <el-divider />
          <el-carousel height="120px" style="max-width: 420px">
            <el-carousel-item v-for="color in ['#409eff', '#67c23a', '#e6a23c']" :key="color">
              <div class="demo-carousel-item" :style="{ background: color }">Carousel</div>
            </el-carousel-item>
          </el-carousel>
        </el-card>

        <el-card shadow="never" class="demo-section">
          <template #header>Tooltip / Popover / Popconfirm</template>
          <el-space>
            <el-tooltip content="提示文案">
              <el-button>Tooltip</el-button>
            </el-tooltip>
            <el-popover title="标题" content="气泡卡片内容" placement="top">
              <template #reference>
                <el-button>Popover</el-button>
              </template>
            </el-popover>
            <el-popconfirm title="确认删除？" @confirm="ElMessage.success('已确认')">
              <template #reference>
                <el-button type="danger">Popconfirm</el-button>
              </template>
            </el-popconfirm>
          </el-space>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="反馈" name="feedback">
        <el-card shadow="never" class="demo-section">
          <template #header>Alert / Message / Notification / Loading / Skeleton / Result</template>
          <el-space direction="vertical" fill style="width: 100%">
            <el-alert title="成功提示" type="success" show-icon />
            <el-alert title="信息提示" type="info" show-icon />
            <el-alert title="警告提示" type="warning" show-icon closable />
            <el-alert title="错误提示" type="error" show-icon />
          </el-space>
          <el-divider />
          <el-space wrap>
            <el-button @click="ElMessage.success('操作成功')">Message</el-button>
            <el-button
              @click="
                ElNotification({ title: '通知标题', message: '这是一条通知说明。', type: 'info' })
              "
            >
              Notification
            </el-button>
            <el-button @click="dialogVisible = true">Dialog</el-button>
            <el-button @click="drawerVisible = true">Drawer</el-button>
            <el-button
              @click="
                ElMessageBox.confirm('确认执行该操作？', '提示', { type: 'warning' }).catch(() => {})
              "
            >
              MessageBox
            </el-button>
          </el-space>
          <el-divider />
          <el-skeleton :rows="3" animated />
          <el-divider />
          <el-result icon="success" title="操作成功" sub-title="Result 组件用于展示处理结果。">
            <template #extra>
              <el-button type="primary">返回</el-button>
            </template>
          </el-result>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="其他" name="other">
        <el-card shadow="never" class="demo-section">
          <template #header>Card / CheckTag / Watermark</template>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-card shadow="hover">
                <template #header>
                  <div class="demo-card-header">
                    <span>卡片标题</span>
                    <el-link type="primary">更多</el-link>
                  </div>
                </template>
                卡片内容区域
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-space wrap>
                <el-check-tag :checked="checkTag" @change="checkTag = $event">可选标签</el-check-tag>
                <el-check-tag checked type="success">成功</el-check-tag>
              </el-space>
            </el-col>
            <el-col :span="8">
              <el-watermark content="xn-admin">
                <div class="demo-watermark">水印区域</div>
              </el-watermark>
            </el-col>
          </el-row>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" title="Dialog 示例" width="480px">
      <p>这是 Element Plus Dialog 的基础用法。</p>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" title="Drawer 示例">
      <p>从右侧滑出的抽屉面板。</p>
    </el-drawer>

    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import {
  ArrowDown,
  HomeFilled,
  Plus,
  Search,
  Setting,
  Star,
  User,
  UserFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

defineOptions({ name: 'DemoUiPage' })

const activeTab = ref('general')
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const checkTag = ref(true)
const calendarDate = ref(new Date())
const gridSpans = [6, 6, 6, 6, 8, 8, 8, 12, 12]

const form = reactive({
  name: '',
  password: '',
  desc: '',
  age: 10,
  city: '',
  region: [],
  dept: undefined,
  date: '',
  range: '',
  time: '',
  radio: 'a',
  checks: ['apple'],
  enabled: true,
  score: 36,
  rate: 3.5,
  color: '#409EFF',
  segment: '日',
  mention: '',
  transfer: [],
})

const cascaderOptions = [
  {
    value: 'zhejiang',
    label: '浙江',
    children: [
      { value: 'hangzhou', label: '杭州', children: [{ value: 'xihu', label: '西湖' }] },
      { value: 'ningbo', label: '宁波' },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [{ value: 'nanjing', label: '南京' }],
  },
]

const treeSelectData = [
  {
    value: '1',
    label: '节点 1',
    children: [{ value: '1-1', label: '子节点' }],
  },
]

const treeData = [
  {
    label: '总公司',
    children: [
      { label: '研发部', children: [{ label: '前端组' }] },
      { label: '市场部' },
    ],
  },
]

const mentionOptions = [
  { value: '张三', label: '张三' },
  { value: '李四', label: '李四' },
]

const transferData = Array.from({ length: 8 }).map((_, i) => ({
  key: i,
  label: `选项 ${i + 1}`,
}))

const tableData = [
  { name: '张三', age: 28, city: '杭州' },
  { name: '李四', age: 32, city: '上海' },
  { name: '王五', age: 24, city: '北京' },
]
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

.demo-section + .demo-section {
  margin-top: 12px;
}

.demo-form {
  max-width: 920px;
}

.demo-grid-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 12px;
  background: var(--el-fill-color-light);
  margin-bottom: 8px;
}

.demo-scroll-line {
  margin: 0;
  padding: 6px 0;
  color: var(--el-text-color-regular);
}

.demo-badge {
  margin-right: 12px;
}

.demo-carousel-item {
  height: 120px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border-radius: 6px;
}

.demo-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.demo-watermark {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}
</style>
