# xnAppIcon

统一图标渲染组件，支持 Element Plus 图标、Iconify、本地 SVG。菜单、按钮、路由管理、图标选择器都走这一套解析。

## 介绍

`name` 经 `@/utils/icons` 的 `parseIcon` 识别类型：

| 写法           | 类型         | 示例              |
| -------------- | ------------ | ----------------- |
| Element 组件名 | Element Plus | `Setting`、`User` |
| 含 `:`         | Iconify      | `mdi:home`        |
| `svg:` 前缀    | 本地 SVG     | `svg:my-icon`     |

无法解析或 `name` 为空时不渲染。

## 文件

| 文件            | 说明         |
| --------------- | ------------ |
| `xnAppIcon.vue` | 图标渲染入口 |

## Props

| 名称    | 类型               | 默认值 | 说明                                                 |
| ------- | ------------------ | ------ | ---------------------------------------------------- |
| `name`  | `string \| null`   | —      | 图标名，如 `Setting`、`mdi:home`、`svg:自定义文件名` |
| `size`  | `number \| string` | `16`   | 尺寸                                                 |
| `color` | `string`           | —      | 颜色                                                 |

## 依赖

- `@/utils/icons`：`parseIcon`、`resolveElementIcon`、`getSvgRaw`
- `@iconify/vue`
- Element Plus `el-icon`

## 用法

```vue
<xnAppIcon name="Setting" :size="18" />
<xnAppIcon name="mdi:home" color="#409eff" />
<xnAppIcon name="svg:my-icon" />
```

`name` 为空或无法解析时不渲染内容。
