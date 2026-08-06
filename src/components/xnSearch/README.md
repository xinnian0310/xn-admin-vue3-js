# xnSearch

配置驱动的行内搜索表单。支持字段溢出折叠，以及查询 / 重置。

## 文件

| 文件           | 说明     |
| -------------- | -------- |
| `xnSearch.vue` | 搜索表单 |

## Props

| 名称         | 类型               | 默认值   | 必填   | 说明         |
| ------------ | ------------------ | -------- | ------ | ------------ |
| `searchItem` | `SearchItem[]`     | —        | **是** | 搜索项配置   |
| `height`     | `string`           | `'auto'` | 否     | 区域高度     |
| `fieldWidth` | `string \| number` | `200`    | 否     | 默认字段宽度 |

## Emits

| 事件        | 载荷                       |
| ----------- | -------------------------- |
| `queryForm` | `SearchForm`（空值已剥离） |
| `reset`     | `SearchForm`               |

## Slots

| 插槽     | 说明                    |
| -------- | ----------------------- |
| default  | 额外字段（按钮前）      |
| `button` | 额外按钮（查询/重置旁） |

## 字段类型（`SearchItem.type`）

`input` | `number` | `select` | `date` | `datetime` | `daterange`

## 相关类型

`SearchItem`（`@/types/search`）：`label`、`prop`、`type`，以及可选 `options` / `width` / `clearable` / `multiple`。

## 用法

```vue
<xnSearch :search-item="pageUi.searchItems" @query-form="onQuery" @reset="onReset" />
```

单项 `width` 可覆盖 `fieldWidth`；窗口尺寸变化会重算折叠；深度监听 `searchItem` 会重置表单与布局。
