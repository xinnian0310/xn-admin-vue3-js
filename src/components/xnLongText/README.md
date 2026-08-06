# xnLongText

表格/列表中的长文本展示：单行截断，点击后弹窗查看全文，支持一键复制。

## 文件

| 文件             | 说明     |
| ---------------- | -------- |
| `xnLongText.vue` | 组件本体 |

## Props

| 名称        | 类型             | 默认值     | 说明                 |
| ----------- | ---------------- | ---------- | -------------------- |
| `text`      | `string \| null` | `''`       | 完整文本             |
| `title`     | `string`         | `详细内容` | 弹窗标题             |
| `emptyText` | `string`         | `—`        | 空值占位             |
| `maxLength` | `number`         | `48`       | 触发区最大展示字符数 |

## 在 xnTable 中使用

列配置：

```ts
{ type: 'longText', prop: 'userAgent', label: '浏览器', minWidth: 200 }
```

也可单独使用：

```vue
<xnLongText :text="row.userAgent" title="浏览器" />
```
