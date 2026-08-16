# xnIconPicker

图标选择表单控件。通过 Popover 从 Element Plus / Iconify 预设 / 本地 SVG 中挑选，支持 `v-model`。路由管理、权限内容等「选图标」字段用它。

## 介绍

三个 Tab：Element、Iconify、SVG。Element 最多匹配展示 200 项；Iconify 自由输入须含 `:`（如 `mdi:home`）；选中值交给 `xnAppIcon` 渲染。点击外部关闭。

## 文件

| 文件               | 说明       |
| ------------------ | ---------- |
| `xnIconPicker.vue` | 图标选择器 |

## Props

| 名称          | 类型      | 默认值       | 说明       |
| ------------- | --------- | ------------ | ---------- |
| `modelValue`  | `string`  | `''`         | 当前图标值 |
| `disabled`    | `boolean` | `false`      | 禁用       |
| `placeholder` | `string`  | `'选择图标'` | 占位文案   |

## Emits

| 事件                | 载荷     | 说明       |
| ------------------- | -------- | ---------- |
| `update:modelValue` | `string` | 选中值变更 |

## 依赖

- `xnAppIcon`
- `@/utils/icons`（`ICONIFY_PRESETS`、`listElementIconNames` 等）

## 用法

```vue
<xnIconPicker v-model="form.icon" />
```

Element 图标列表最多匹配展示 200 项；Iconify 自由输入需包含 `:`；点击外部关闭 Popover。
