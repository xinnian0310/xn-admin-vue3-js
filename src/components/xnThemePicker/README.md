# xnThemePicker

主题设置对话框：预设主题、浅色/深色外观、自定义配色与主内容区背景图。

## 文件

| 文件                | 说明         |
| ------------------- | ------------ |
| `xnThemeDialog.vue` | 主题设置弹窗 |

## Props / Emits / Slots

无。显隐由 `themeStore.dialogVisible` 控制。

## 依赖

- `@/stores/theme`（含 `MAIN_BG_MAX_BYTES`）
- `@/config/themes`（`CustomThemeParts`）

## 行为说明

- 背景图大小限制约 800KB，以 data URL 形式本地存储
- 通过 theme store 的对话框 API 打开/关闭

## 用法

```ts
themeStore.openDialog() // 或项目中对应的 store 方法
```

布局中挂载：

```vue
<xnThemeDialog />
```
