# xn-admin-vue3-js

心念后台管理系统前端：Vue 3 + **JavaScript** + Vite + Element Plus（Composition API / `<script setup>`）。

功能与 [`xn-admin-vue3-ts`](../xn-admin-vue3-ts/) 对齐，共用微服务后端 [`xn-admin-cloud`](../xn-admin-cloud/)（网关 `8088`）。同步范围见 [`../docs/PRD-xn-admin-frontend-sync.md`](../docs/PRD-xn-admin-frontend-sync.md)。

版本：`1.0.0` · 许可证：[Apache-2.0](./LICENSE) · Copyright 2026 心念

## 前提

1. Node.js 20+（见 `.nvmrc`）
2. 后端已启动，网关可访问：http://localhost:8088  
   （同级目录一般为 [`../xn-admin-cloud`](../xn-admin-cloud/)，按其 README 启动 system / file / log / job / gateway）
3. MySQL / Redis / Nacos 等中间件已就绪

## 默认账号

与后端种子账号一致（首次初始化）：

| 用户名       | 初始密码     | 说明       |
| ------------ | ------------ | ---------- |
| `SuperAdmin` | `SuperAdmin` | 超级管理员 |
| `admin`      | `admin`      | 管理员     |

登录后请尽快修改密码。

## 快速启动

```bash
npm install           # 安装依赖
npm run dev           # 启动开发服务
```

开发地址：http://localhost:5174（与基准 `5173` 错开，便于同时联调）

Vite 已代理到网关：

| 前缀           | 目标                                 |
| -------------- | ------------------------------------ |
| `/api`         | `http://localhost:8088`              |
| `/uploads`     | `http://localhost:8088`              |
| `/ws`          | `http://localhost:8088`（WebSocket） |
| `/swagger-ui`  | `http://localhost:8088`              |
| `/v3/api-docs` | `http://localhost:8088`              |

```bash
npm run build         # vite 生产构建
npm run preview       # 本地预览构建产物
npm run format        # Prettier：格式化代码
npm run format:check  # Prettier：仅检查格式，不改文件
npm run lint:fix     # ESLint：自动修复可修复项
npm run test:watch    # Vitest：watch 模式
```

生产静态资源需由 Nginx 等反向代理到同一网关（`/api`、`/uploads`、`/ws`），或自行调整构建时的代理/网关地址。

## 质量检查

```bash
npm run lint          # ESLint：代码规范与潜在问题检查
npm run test          # Vitest：跑单元测试（非 watch）
npm run ci            # 全量检查：lint + format:check + test + build
```

提交前会经 Husky 跑 lint-staged（ESLint 修复 + Prettier 格式化）；提交信息需符合 [Conventional Commits](https://www.conventionalcommits.org/)（如 `feat: xxx`）。约定详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 技术栈

| 类别          | 技术                                                     |
| ------------- | -------------------------------------------------------- |
| 框架          | Vue 3.5、**JavaScript**、Vite 8                          |
| 写法          | Composition API / `<script setup>`                       |
| UI            | Element Plus、@element-plus/icons-vue、Iconify           |
| 状态 / 路由   | Pinia 4、Vue Router 5                                    |
| 请求          | Axios                                                    |
| 图表 / 编辑器 | ECharts、wangEditor                                      |
| Excel         | ExcelJS、xlsx                                            |
| 工程化        | ESLint、Prettier、Vitest、Husky、lint-staged、commitlint |

## 与基准差异

- 语言：TypeScript → JavaScript（去类型注解；运行时行为对齐）
- 开发端口：`5174`（基准为 `5173`）
- 无 `vue-tsc` / `typecheck`；其余功能与后端契约一致

## 目录结构

```
src/
├── api/            # 接口模块（auth、user、role、route、notice、logs…）
├── components/     # 通用组件（各目录含 README.md）
├── composables/    # usePageUi、useCrudApi
├── config/         # 应用 / 菜单 / 主题 / 首页配置
├── directives/     # v-permission
├── layouts/        # AdminLayout 及 Side / Top / Mix / Columns
├── router/         # 静态路由 + 动态注册与守卫
├── stores/         # user、permission、menu、tagsView、theme、notice
├── types/          # 运行时常量/辅助（由基准 types 去类型而来）
├── utils/          # request、icons、excel、download、route-register…
└── views/          # 业务页面（含 system/logs/{login,oper,exception}）
```

## 环境与约定

- 路径别名：`@` → `src/`
- 鉴权 Token 由 `utils/request` 注入；未登录跳转登录页
- 列表页常用 `usePageUi` + 手写数据加载；部分页面使用 `xnTable` 的 `api` 模式
- 日志等特殊导出走 `utils/download.js`（带鉴权拉取文件流）
- 共用后端：仅对接 `xn-admin-cloud`，见 [PRD](../docs/PRD-xn-admin-frontend-sync.md)
