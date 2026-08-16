# xnSidebarMenu

多级侧边/顶栏菜单。由 `xnSidebarMenu` 渲染 `el-menu`，`xnSidebarMenuItem` 递归展开子项。

## 介绍

默认读 `menuStore.menus`（后端 `/api/auth/menus`）。`mode` 为 `vertical`（侧栏）或 `horizontal`（顶栏）。隐藏项会被过滤；图标走 `xnAppIcon`。激活路径取自 `route.meta.activeMenu`，或去掉 `/save…` 后缀的当前 path。

## 文件

| 文件                    | 说明                  |
| ----------------------- | --------------------- |
| `xnSidebarMenu.vue`     | 菜单容器（垂直/水平） |
| `xnSidebarMenuItem.vue` | 递归菜单项            |

---

## xnSidebarMenu

### Props

| 名称    | 类型                         | 默认值            | 说明                   |
| ------- | ---------------------------- | ----------------- | ---------------------- |
| `mode`  | `'vertical' \| 'horizontal'` | `'vertical'`      | 菜单方向               |
| `menus` | `MenuItem[]`                 | `menuStore.menus` | 菜单树；不传则用 store |

无 Emits / Slots / Expose。

### 行为说明

- 激活路径取自 `route.meta.activeMenu`，或去掉 `/save…` 后缀的当前 path
- 隐藏菜单会被过滤；主题色来自 `themeStore`
- 路由变化时保持祖先 submenu 展开

---

## xnSidebarMenuItem

### Props

| 名称    | 类型         | 必填 | 说明             |
| ------- | ------------ | ---- | ---------------- |
| `menus` | `MenuItem[]` | 是   | 当前层级菜单列表 |

带 `path` 的父级点击标题会导航；图标通过 `xnAppIcon` 渲染。

## 依赖

- `@/types/menu`
- `@/stores/menu`、`@/stores/theme`
- `@/utils/menu`
- `xnAppIcon`、vue-router

## 用法

```vue
<xnSidebarMenu mode="vertical" />
<!-- 或传入自定义树 -->
<xnSidebarMenu :menus="customMenus" mode="horizontal" />
```
