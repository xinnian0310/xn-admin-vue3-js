# xnErrorPage

全屏错误页骨架：状态码、标题、说明，以及底部操作区。用于 403 / 404 / 503 等独立错误页，不负责路由跳转。

## 文件

| 文件              | 说明      |
| ----------------- | --------- |
| `xnErrorPage.vue` | 错误页 UI |

## 介绍

按 `tone` 切换视觉语义（静默 / 警告 / 危险），中间是状态码与图标，下方用插槽放按钮（回首页、重试等）。本组件不内置导航，由调用方决定按钮行为。

## 使用

```vue
<xnErrorPage code="404" title="页面不存在" description="链接可能已失效，或你没有访问权限。">
  <template #actions>
    <el-button type="primary" @click="router.push('/dashboard')">返回首页</el-button>
  </template>
</xnErrorPage>
```

```vue
<xnErrorPage
  code="403"
  tone="warn"
  title="无权访问"
  description="当前账号没有该菜单权限，请联系管理员。"
>
  <template #actions>
    <el-button @click="router.back()">返回上一页</el-button>
  </template>
</xnErrorPage>
```

## 传参

| 名称          | 类型                            | 默认值    | 说明                         |
| ------------- | ------------------------------- | --------- | ---------------------------- |
| `code`        | `string`                        | —（必填） | 展示用状态码，如 `404`       |
| `title`       | `string`                        | —（必填） | 主标题                       |
| `description` | `string`                        | —（必填） | 补充说明                     |
| `tone`        | `'warn' \| 'muted' \| 'danger'` | `'muted'` | 配色：警告 / 默认主色 / 危险 |

## 插槽

| 插槽      | 说明                           |
| --------- | ------------------------------ |
| `actions` | 底部操作区，通常放 1～2 个按钮 |

## 说明

- 无 Emits / Expose。
- 跟随 `--app-color-primary` 与暗色主题变量。
- 工程内典型用法：`views/error/NotFoundView.vue`、`ForbiddenView.vue`、`ServiceUnavailableView.vue`。
