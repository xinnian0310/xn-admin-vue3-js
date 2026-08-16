# xnPageLayout

后台列表页骨架：可选左侧树、搜索区、工具栏、表格/卡片切换、分页。绝大多数 CRUD 列表页都包一层本组件。

## 介绍

插槽拼出标准后台页。有 `#aside` 时左右分栏。同时提供 `#table` 与 `#card` 且 `showViewSwitch` 为真时才显示切换；模式可写入 `localStorage`（键 `xn-view-mode:{route.path}`）。

## 文件

| 文件               | 说明         |
| ------------------ | ------------ |
| `xnPageLayout.vue` | 页面布局骨架 |

## Props

| 名称              | 类型                | 默认值              | 说明                     |
| ----------------- | ------------------- | ------------------- | ------------------------ |
| `loading`         | `boolean`           | `false`             | 加载态                   |
| `showViewSwitch`  | `boolean`           | `true`              | 是否显示表格/卡片切换    |
| `viewMode`        | `'table' \| 'card'` | `'table'`           | 当前视图模式             |
| `showPagination`  | `boolean`           | `false`             | 是否显示分页             |
| `page`            | `number`            | `1`                 | 当前页                   |
| `pageSize`        | `number`            | `10`                | 每页条数                 |
| `total`           | `number`            | `0`                 | 总条数                   |
| `pageSizes`       | `number[]`          | `[10, 20, 50, 100]` | 每页条数选项             |
| `persistViewMode` | `boolean`           | `true`              | 是否按路由持久化视图模式 |

## Emits

| 事件              | 载荷                |
| ----------------- | ------------------- |
| `update:viewMode` | `'table' \| 'card'` |
| `update:page`     | `number`            |
| `update:pageSize` | `number`            |
| `page-change`     | —                   |

## Slots

| 插槽            | 说明                             |
| --------------- | -------------------------------- |
| `aside`         | 左侧面板（存在时启用左右布局）   |
| `search`        | 搜索区                           |
| `toolbar`       | 工具栏左侧                       |
| `toolbar-extra` | 工具栏右侧（视图切换前）         |
| `table`         | 表格视图                         |
| `card`          | 卡片视图                         |
| `pagination`    | 自定义分页                       |
| default         | 未提供 `table`/`card` 时的内容区 |

## 用法

```vue
<xnPageLayout
  v-model:page="page"
  v-model:page-size="pageSize"
  :total="total"
  show-pagination
  @page-change="load"
>
  <template #aside>
    <xnTreePanel ... />
  </template>
  <template #search>
    <xnSearch ... />
  </template>
  <template #toolbar>
    <xnButton ... />
  </template>
  <template #table>
    <xnTable ... />
  </template>
</xnPageLayout>
```

同时提供 `table` 与 `card` 且 `showViewSwitch` 为真时才显示切换；模式可写入 `localStorage`（键 `xn-view-mode:{route.path}`）。
