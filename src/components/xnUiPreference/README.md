# xnUiPreference

登录用户的「界面偏好」悬浮按钮 + 抽屉。可改本账号的布局模式、弹窗限高、标签栏高度与各区域字号；未设置的项沿用管理员通用配置。

## 文件

| 文件                    | 说明                    |
| ----------------------- | ----------------------- |
| `xnUiPreferenceFab.vue` | 右侧半隐 FAB + 偏好抽屉 |

## 介绍

挂在后台布局右缘，平时半隐藏，鼠标靠近或拖动时探出。单击打开抽屉，上下拖动可改垂直位置（写入 `localStorage` 键 `xn-ui-pref-fab-top`）。保存 / 恢复走 `useUiPreferenceStore` → `/api/user-ui-config`。

可改项：

- 布局模式：`side` / `top` / `mix` / `columns`
- 弹窗最大高度（如 `80vh`）
- 标签栏高度（px）
- 侧栏 / 顶栏 / 标签栏 / 正文字号（px）

## 使用

布局中挂载即可，无需传参：

```vue
<xnUiPreferenceFab />
```

用 store 打开抽屉（一般不必，点 FAB 即可）：

```ts
import { useUiPreferenceStore } from '@/stores/uiPreference'

useUiPreferenceStore().openDrawer()
```

## 传参 / 事件 / 插槽

无。显隐由 `uiPreferenceStore.drawerVisible` 控制。

## 行为说明

| 操作     | 行为                                  |
| -------- | ------------------------------------- |
| 单击 FAB | 打开抽屉，表单回填当前生效配置        |
| 上下拖动 | 超过 4px 视为拖动，松手后记住位置     |
| 保存     | `uiPrefStore.save(...)`，成功后关抽屉 |
| 恢复通用 | `uiPrefStore.reset()`，清掉本账号覆盖 |
| 靠近右缘 | FAB 探出（`is-peek`）                 |

## 依赖

- `@/stores/uiPreference`
- `@/config/app`（`LayoutMode`、当前通用配置）
- `@/utils/px`（`parsePxInt` / `toPx`）
- `@/api/user-ui-config`

## 说明

- 只影响当前登录用户，不改管理员「系统配置」里的全局 UI。
- 四套前端均有等价实现（React 目录名为 `XnUiPreferenceFab`）。
