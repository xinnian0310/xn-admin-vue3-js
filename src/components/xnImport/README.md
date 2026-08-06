# xnImport

Excel 导入对话框：下载模板 → 上传解析预览 → 调用 `importer` 提交。

## 文件

| 文件                 | 说明                                  |
| -------------------- | ------------------------------------- |
| `xnImportDialog.vue` | 导入对话框（组件名 `XnImportDialog`） |

## Props

| 名称           | 类型                  | 默认值         | 必填   | 说明       |
| -------------- | --------------------- | -------------- | ------ | ---------- |
| `title`        | `string`              | `'Excel 导入'` | 否     | 标题       |
| `columns`      | `ExcelImportColumn[]` | —              | **是** | 列定义     |
| `templateName` | `string`              | `'导入模板'`   | 否     | 模板文件名 |
| `importer`     | `ExcelImportSubmit`   | —              | **是** | 提交函数   |
| `maxRows`      | `number`              | `2000`         | 否     | 最大行数   |
| `previewLimit` | `number`              | `50`           | 否     | 预览行数   |

## Emits

| 事件      | 载荷                                |
| --------- | ----------------------------------- |
| `success` | `ImportResult \| void \| undefined` |

## Expose

| 名称     | 说明                 |
| -------- | -------------------- |
| `open()` | 重置状态并打开对话框 |

## 依赖

- `@/types/excel`
- `@/utils/excel`

## 用法

```vue
<XnImportDialog ref="importRef" :columns="importColumns" :importer="doImport" @success="reload" />
```

```ts
importRef.value?.open()
```

全部成功（`failed === 0` 或无结果对象）时自动关闭；部分失败则停留并展示错误表。
