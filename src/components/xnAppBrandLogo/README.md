# xnAppBrandLogo

品牌 Logo 展示组件。优先使用配置/传入图片，缺失时回退为 Element Plus `Monitor` 图标。

## 文件

| 文件                 | 说明      |
| -------------------- | --------- |
| `xnAppBrandLogo.vue` | Logo 展示 |

## Props

| 名称     | 类型             | 默认值                     | 说明                    |
| -------- | ---------------- | -------------------------- | ----------------------- |
| `src`    | `string`         | `appConfig.app.logo`       | 图片地址                |
| `width`  | `number \| null` | `appConfig.app.logoWidth`  | 宽度；`null` 表示自适应 |
| `height` | `number \| null` | `appConfig.app.logoHeight` | 高度；`null` 表示自适应 |
| `alt`    | `string`         | `appConfig.app.name`       | 替代文本                |

## 依赖

- `@/config/app`
- `@element-plus/icons-vue`（`Monitor`）

## 用法

```vue
<xnAppBrandLogo />
<xnAppBrandLogo :width="32" :height="32" />
```

Logo URL 为空时显示回退图标，尺寸取自 `width` / `height`（默认约 28）。
