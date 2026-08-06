# xnRichEditor

基于 wangEditor 的富文本编辑器封装，`v-model` 绑定 HTML 字符串；已排除视频相关工具。

## 文件

| 文件               | 说明         |
| ------------------ | ------------ |
| `xnRichEditor.vue` | 富文本编辑器 |

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

## 用法

```vue
<xnRichEditor v-model="form.content" height="400px" />
```

组件卸载时会销毁编辑器实例。
