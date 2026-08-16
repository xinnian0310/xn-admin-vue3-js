# xnRichEditor

基于 wangEditor 的富文本编辑器封装，`v-model` 绑定 HTML 字符串。公告、站内信正文使用。

## 介绍

图片 / 视频 / 附件上传走项目 `UploadManager`（与 XnUpload 同一套：秒传、分片、续传）。工具栏保留 `uploadVideo` / `insertVideo` / `group-video`。

已注册官方插件：Markdown、公式、@提及、上传附件、链接卡片、Ctrl+Enter 换行。只读页展示请用 `decorateRichHtml`，否则公式节点是空 span。卸载时销毁编辑器实例。

## 文件

| 文件               | 说明         |
| ------------------ | ------------ |
| `xnRichEditor.vue` | 富文本编辑器 |

逻辑在 `@/utils/rich-editor`。

## Props

| 名称          | 类型      | 默认值             | 说明                    |
| ------------- | --------- | ------------------ | ----------------------- |
| `modelValue`  | `string`  | `''`               | HTML 内容               |
| `disabled`    | `boolean` | `false`            | 只读/禁用（隐藏工具栏） |
| `height`      | `string`  | `'320px'`          | 编辑区高度              |
| `placeholder` | `string`  | `'请输入公告内容'` | 占位文案                |

## Emits

| 事件                | 载荷     |
| ------------------- | -------- |
| `update:modelValue` | `string` |

## 依赖

- `@wangeditor/editor`
- `@wangeditor/editor-for-vue`
- `@wangeditor/plugin-md`
- `@wangeditor/plugin-formula` + `katex`
- `@wangeditor/plugin-mention`
- `@wangeditor/plugin-upload-attachment`
- `@wangeditor/plugin-link-card`
- `@wangeditor/plugin-ctrl-enter`

## 用法

```vue
<xnRichEditor v-model="form.content" height="400px" />
```

只读页展示请用 `decorateRichHtml`，否则公式节点是空 span。

组件卸载时会销毁编辑器实例。
