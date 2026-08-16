# 通用组件

列表页常用组合：

```
xnPageLayout
├── #aside → xnTreePanel（可选）
├── #search → xnSearch
├── #toolbar → xnButton
└── #table → xnTable
```

配置通常来自后端 page-ui（`usePageUi`）与路由权限。

| 组件           | 说明                                | 文档                                 |
| -------------- | ----------------------------------- | ------------------------------------ |
| xnAppIcon      | 统一图标（Element / Iconify / SVG） | [README](./xnAppIcon/README.md)      |
| xnAppBrandLogo | 品牌 Logo                           | [README](./xnAppBrandLogo/README.md) |
| xnButton       | 工具栏 / 行操作按钮                 | [README](./xnButton/README.md)       |
| xnErrorPage    | 403 / 404 / 503 错误页骨架          | [README](./xnErrorPage/README.md)    |
| xnIconPicker   | 图标选择器                          | [README](./xnIconPicker/README.md)   |
| xnImport       | Excel 导入对话框                    | [README](./xnImport/README.md)       |
| xnLongText     | 长文本截断 + 弹窗查看               | [README](./xnLongText/README.md)     |
| xnNoticeInbox  | 消息中心抽屉                        | [README](./xnNoticeInbox/README.md)  |
| xnPageLayout   | 列表页骨架                          | [README](./xnPageLayout/README.md)   |
| xnRichEditor   | 富文本（wangEditor）                | [README](./xnRichEditor/README.md)   |
| xnSearch       | 配置化搜索表单                      | [README](./xnSearch/README.md)       |
| xnSidebarMenu  | 多级菜单                            | [README](./xnSidebarMenu/README.md)  |
| xnTable        | 配置化表格                          | [README](./xnTable/README.md)        |
| xnTagsView     | 页面标签栏                          | [README](./xnTagsView/README.md)     |
| xnThemePicker  | 主题设置                            | [README](./xnThemePicker/README.md)  |
| xnTreePanel    | 左侧树面板                          | [README](./xnTreePanel/README.md)    |
| xnUiPreference | 个人界面偏好 FAB                    | [README](./xnUiPreference/README.md) |
| xnUpload       | 大文件分片上传                      | [README](./xnUpload/README.md)       |
