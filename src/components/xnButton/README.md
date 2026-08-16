# xnButton

工具栏按钮组与表格行操作按钮。支持 page-ui 配置、权限控制、按选中行数启用/禁用。

## 介绍

`xnButton` 放在 `xnPageLayout` 的 `#toolbar`；`xnTableActions` 放在表格操作列。按钮列表通常来自 `usePageUi(routePath).buttonItems`。无权限的按钮不渲染。`index` 表示「需要选中的行数 - 1」（编辑/查看一般为 `0`，即恰好 1 行）。

## 文件

| 文件                 | 说明               |
| -------------------- | ------------------ |
| `xnButton.vue`       | 工具栏按钮组       |
| `xnTableActions.vue` | 表格行内操作按钮   |
| `defaultButtons.ts`  | 默认 CRUD 按钮定义 |

---

## xnButton

### Props

| 名称               | 类型               | 默认值         | 说明                   |
| ------------------ | ------------------ | -------------- | ---------------------- |
| `listItem`         | `ButtonListItem[]` | 默认 CRUD 按钮 | 传 `[]` 可隐藏全部按钮 |
| `selected`         | `unknown[]`        | `[]`           | 当前表格选中行         |
| `createPermission` | `string`           | —              | 新增权限码             |
| `updatePermission` | `string`           | —              | 编辑权限码             |
| `viewPermission`   | `string`           | —              | 查看权限码             |
| `deletePermission` | `string`           | —              | 删除权限码             |

### Emits

| 事件          | 载荷                                                           |
| ------------- | -------------------------------------------------------------- |
| `buttonClick` | `action: string`（`item.action \|\| item.name`，下拉子项同理） |

### 行为说明

- `index`：需要选中 `index + 1` 行才可点（如编辑要求恰好 1 行）
- `delete` / `publish` / `revoke`：至少选中 1 行
- 下拉：`type: 'down'` + `searchItem` 子项

---

## xnTableActions

### Props

| 名称       | 类型                                 | 默认值 | 说明                     |
| ---------- | ------------------------------------ | ------ | ------------------------ |
| `items`    | `ButtonListItem[]`                   | `[]`   | 行操作配置               |
| `row`      | `Record<string, any>`                | `{}`   | 当前行                   |
| `disabled` | `(action, row) => boolean \| string` | —      | 返回 `true`/字符串则禁用 |

### Emits

| 事件          | 载荷                                           |
| ------------- | ---------------------------------------------- |
| `actionClick` | `{ action: string; row: Record<string, any> }` |

行内为文字链按钮，不展示图标。

---

## defaultButtons.ts

导出：

- `XN_BUTTON_NAMES`
- `DefaultButtonPermissions`
- `createDefaultButtonList(permissions)` → 新增/编辑/查看/删除（编辑/查看 `index: 0`）

## 相关类型

`ButtonListItem`（`@/types/button`）：`name`、`type`、`action`、`permission`、`index`、`typeColor`、`icon`、`searchItem` 等。

## 用法

```vue
<xnButton :list-item="pageUi.buttonItems" :selected="selected" @button-click="onToolbar" />

<xnTableActions :items="rowActions" :row="row" @action-click="onRowAction" />
```
