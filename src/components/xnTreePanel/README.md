# xnTreePanel

左侧树形面板：标题、过滤输入、滚动区域；可使用内置 `el-tree`，也可完全自定义默认插槽。

## 文件

| 文件              | 说明   |
| ----------------- | ------ |
| `xnTreePanel.vue` | 树面板 |

## Props

| 名称                | 类型                               | 默认值                                     | 说明                              |
| ------------------- | ---------------------------------- | ------------------------------------------ | --------------------------------- |
| `title`             | `string`                           | —                                          | 标题                              |
| `width`             | `string \| number`                 | `'260px'`                                  | 面板宽度                          |
| `filter`            | `string`                           | `''`                                       | 过滤关键字（可 `v-model:filter`） |
| `filterable`        | `boolean`                          | `true`                                     | 是否显示过滤框                    |
| `filterPlaceholder` | `string`                           | `'搜索'`                                   | 过滤占位                          |
| `data`              | `any[]`                            | —                                          | 树数据（内置树模式）              |
| `nodeKey`           | `string`                           | `'id'`                                     | 节点唯一键                        |
| `treeProps`         | `{ label?; children?; disabled? }` | `{ label: 'label', children: 'children' }` | 字段映射                          |
| `defaultExpandAll`  | `boolean`                          | `true`                                     | 默认展开全部                      |
| `highlightCurrent`  | `boolean`                          | `true`                                     | 高亮当前节点                      |
| `expandOnClickNode` | `boolean`                          | `false`                                    | 点击节点是否展开                  |
| `currentKey`        | `string \| number`                 | —                                          | 当前选中键                        |
| `filterNodeMethod`  | `(value, data) => boolean`         | 默认按 label 包含匹配                      | 自定义过滤                        |

## Emits

| 事件            | 载荷                                  |
| --------------- | ------------------------------------- |
| `update:filter` | `string`                              |
| `node-click`    | `data, node, event`（禁用节点不触发） |

## Slots

| 插槽    | 说明             |
| ------- | ---------------- |
| `title` | 自定义标题       |
| default | 替换内置树       |
| `node`  | 自定义树节点内容 |

## Expose

| 名称                 | 说明                        |
| -------------------- | --------------------------- |
| `treeRef`            | `ElTree` 实例               |
| `setCurrentKey(key)` | 设置当前节点                |
| `filter(value?)`     | 过滤（默认用当前 `filter`） |

## 用法

常与 `xnPageLayout` 的 `#aside` 配合：

```vue
<xnTreePanel title="组织" v-model:filter="keyword" :data="treeData" @node-click="onNodeClick" />
```
