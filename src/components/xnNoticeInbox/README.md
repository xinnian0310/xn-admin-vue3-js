# xnNoticeInbox

消息中心抽屉与公告详情弹窗。状态由 `useNoticeStore` 驱动，自身无 Props。一般挂在后台布局顶栏。

## 介绍

抽屉列出未读/已读公告与站内信，点击打开详情（HTML 正文）。WebSocket `/ws` 推送后 store 会刷新未读数。打开/关闭全部走 store，不要给组件加 `v-model`。

## 文件

| 文件                | 说明        |
| ------------------- | ----------- |
| `xnNoticeInbox.vue` | 消息中心 UI |

## Props / Emits / Slots

无（完全由 Pinia store 控制）。

## 依赖

- `@/stores/notice`
- `@/utils/datetime`（`formatDateTime`）

## 用法

一般挂在布局顶栏区域，通过 store 打开：

```ts
noticeStore.openDrawer()
```

列表点击打开详情（`openNotice`），关闭详情走 `closeDetail`。公告正文以 HTML 渲染（`v-html`）。
