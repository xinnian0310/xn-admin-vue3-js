# xnTagsView

已访问路由的页签栏：横向滚动、关闭、右键菜单（刷新 / 关闭左侧 / 关闭右侧 / 关闭全部 / 全屏 / 新窗口）。

## 文件

| 文件             | 说明   |
| ---------------- | ------ |
| `xnTagsView.vue` | 页签栏 |

## Props / Emits / Slots

无（状态来自 `useTagsViewStore` + 路由）。

## 依赖

- `@/stores/tagsView`
- `@/types/menu`（`TagView`）

## 行为说明

- Affix 页签不可关闭
- 刷新走 `/redirect{path}`
- 全屏通过 `tagsViewStore.setFullscreen(true)`

## 用法

挂载于后台布局内容区上方即可，一般无需传参：

```vue
<xnTagsView />
```
