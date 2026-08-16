# xnTable

配置驱动表格：支持 **data 模式**（外部数据）与 **api 模式**（按模块名加载 CRUD API）。内置列类型、分页、列设置、保存弹窗与删除流程。

## 介绍

多数业务页用 data 模式：页面自己拉数，把 `data` / `total` / `loading` 传进来。`api` 模式按模块名加载 `@/api/{api}.ts` 的 CRUD。设置 `tableKey` 后底部分页出现「列设置」，配置写入 `/api/table-columns`。

## 文件

| 文件                        | 说明                     |
| --------------------------- | ------------------------ |
| `xnTable.vue`               | 主表格                   |
| `xnColumnSettingDialog.vue` | 列显示/排序/宽度设置弹窗 |

---

## xnTable

### Props

| 名称                          | 类型                         | 默认值              | 说明                            |
| ----------------------------- | ---------------------------- | ------------------- | ------------------------------- |
| `data`                        | `unknown[]`                  | —                   | 数据模式；与 `api` 二选一       |
| `api`                         | `string`                     | —                   | API 模式，对应 `@/api/{api}.ts` |
| `columns`                     | `TableColumnItem[]`          | `[]`                | 列配置                          |
| `loading`                     | `boolean`                    | `false`             | 数据模式加载态                  |
| `tableHeight`                 | `string \| number`           | `'100%'`            | 表格高度                        |
| `showPagination`              | `boolean`                    | `true`              | 是否分页                        |
| `page` / `pageSize` / `total` | `number`                     | `1` / `10` / `0`    | 分页（data 模式需外部 total）   |
| `pageSizes`                   | `number[]`                   | `[10, 20, 50, 100]` | 每页条数选项                    |
| `queryParams`                 | `Record<string, unknown>`    | `{}`                | 查询参数（变更会重置到第 1 页） |
| `listFilter`                  | `(rows) => unknown[]`        | —                   | 客户端过滤                      |
| `saveComponent`               | `Component`                  | —                   | 新增/编辑/查看弹窗组件          |
| `entityName`                  | `string`                     | `'数据'`            | 实体中文名（提示文案）          |
| `nameField`                   | `string`                     | `'title'`           | 名称字段                        |
| `idField`                     | `string`                     | `'id'`              | 主键字段                        |
| `deleteCheck`                 | `(row) => boolean \| string` | —                   | 删除前校验                      |
| `immediate`                   | `boolean`                    | `true`              | 挂载后是否立即拉数（api 模式）  |
| `tableKey`                    | `string`                     | —                   | 有值则启用列设置持久化          |
| `actionItems`                 | `ButtonListItem[]`           | `[]`                | 操作列按钮                      |
| `autoPageSize`                | `boolean`                    | `true`              | 按表格可视高度自动计算每页条数  |
| `autoPageSizeMin` / `Max`     | `number`                     | `5` / `200`         | 自动计算条数上下限              |

`inheritAttrs: false`，其余属性透传到内部 `el-table`。

开启 `autoPageSize`（默认）时，会测量表格区域高度与表头/行高，算出能填满一屏的条数并写入 `pageSize`；窗口或容器尺寸变化时会重新计算。下拉「每页条数」仍可手动改，尺寸变化后会再次按高度适配。

### Emits

| 事件                              | 载荷                          |
| --------------------------------- | ----------------------------- |
| `update:page` / `update:pageSize` | `number`                      |
| `page-change`                     | —                             |
| `selection-change`                | `unknown[]`                   |
| `switch-change`                   | `{ row, prop, value }`        |
| `data-change`                     | `{ records, total, loading }` |
| `success`                         | —（删除/保存成功后）          |

### Slots

| 插槽         | 说明                                               |
| ------------ | -------------------------------------------------- |
| 动态插槽     | `type: 'slot'` 列，名称为 `col.slot \|\| col.prop` |
| default      | 追加额外 `el-table-column`                         |
| `pagination` | 自定义分页                                         |

### Expose

| 名称                                              | 说明                               |
| ------------------------------------------------- | ---------------------------------- |
| `openSave(mode, id?, options?)`                   | 打开保存弹窗                       |
| `handleDelete(row?)`                              | 删除选中或指定行                   |
| `handleAction(action)`                            | `add` / `edit` / `view` / `delete` |
| `loadData(extraParams?)`                          | 重新加载（api 模式）               |
| `selected`                                        | 当前选中                           |
| `displayData` / `displayTotal` / `displayLoading` | 展示态                             |
| `getApi()`                                        | 当前 CRUD API 模块                 |

### 列类型（`TableColumnItem.type`）

`selection` | `index` | `text`（默认） | `datetime` | `tag` | `switch` | `iconText` | `longText` | `slot`

`longText`：单元格截断展示，点击弹窗查看全文（可复制）。

### 用法

```vue
<!-- API 模式 -->
<xnTable
  ref="tableRef"
  api="user"
  table-key="users"
  :columns="columns"
  :query-params="query"
  :save-component="UserSave"
  :action-items="rowActions"
  @selection-change="(rows) => (selected = rows)"
/>

<!-- 数据模式 -->
<xnTable :data="rows" :columns="columns" :loading="loading" :total="total" />
```

---

## xnColumnSettingDialog

通常由 `xnTable` 在设置了 `tableKey` 时内部打开，较少单独使用。

### Props

| 名称         | 类型                   | 必填 | 说明   |
| ------------ | ---------------------- | ---- | ------ |
| `modelValue` | `boolean`              | 是   | 显隐   |
| `columns`    | `TableColumnSetting[]` | 是   | 列设置 |
| `saving`     | `boolean`              | 否   | 保存中 |

### Emits

| 事件                | 载荷                   |
| ------------------- | ---------------------- |
| `update:modelValue` | `boolean`              |
| `save`              | `TableColumnSetting[]` |
| `reset`             | —                      |
| `closed`            | —                      |

选择列（selection）锁定，不可拖拽/改名/改宽。

## 相关类型

- `TableColumnItem` / `TableColumnSetting`：`@/types/table`
- CRUD / Save：`@/types/crud`、`@/types/save`
