# xn-admin-vue3-js

[简体中文](README.md) | [English](README.en.md)

心念后台管理系统前端：Vue 3 + **JavaScript** + Vite + Element Plus（Composition API / `<script setup>`）。

xn-admin-vue3-js 是「心念后台」的 JavaScript 管理端（Composition API / `<script setup>`），功能与基准仓库 xn-admin-vue3-ts 对齐，共用微服务后端 xn-admin-cloud。适合不使用 TypeScript、希望以 Composition 写法快速落地中后台的团队；内置登录鉴权、动态菜单、RBAC、CRUD、主题布局、监控与文件任务等完整能力。采用 Apache License 2.0 开源，**可商用、可自用**。

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![开源](https://img.shields.io/badge/开源-免费-success.svg)](./LICENSE)
[![商用](https://img.shields.io/badge/商用-允许-brightgreen.svg)](./LICENSE)
[![自用](https://img.shields.io/badge/自用-允许-brightgreen.svg)](./LICENSE)

本仓库**独立开源**（Apache-2.0，**可商用、可自用**）。功能与基准仓库 **xn-admin-vue3-ts** 对齐，共用微服务后端 **xn-admin-cloud**（网关 `8088`）。

版本：`1.0.0` · 许可证：[Apache-2.0](./LICENSE) · **可商用 / 可自用** · Copyright 2026 心念

**在线演示：** https://vue3-js.xinniankeji.vip · 官网：https://xinniankeji.vip

## 相关仓库

开源范围仅后端 + 四套管理端：

| 仓库 | Gitee | GitHub | 说明 |
|------|-------|--------|------|
| `xn-admin-cloud` | [Gitee](https://gitee.com/jenning/xn-admin-cloud) | [GitHub](https://github.com/xinnian0310/xn-admin-cloud) | 微服务后端（必需） |
| `xn-admin-vue3-ts` | [Gitee](https://gitee.com/jenning/xn-admin-vue3-ts) | [GitHub](https://github.com/xinnian0310/xn-admin-vue3-ts) | 功能基准（TypeScript） |
| `xn-admin-vue3-js` | [Gitee](https://gitee.com/jenning/xn-admin-vue3-js) | [GitHub](https://github.com/xinnian0310/xn-admin-vue3-js) | 本仓库 |
| `xn-admin-vue2-js` | [Gitee](https://gitee.com/jenning/xn-admin-vue2-js) | [GitHub](https://github.com/xinnian0310/xn-admin-vue2-js) | Vue 3 + JavaScript（Options API） |
| `xn-admin-react-ts` | [Gitee](https://gitee.com/jenning/xn-admin-react-ts) | [GitHub](https://github.com/xinnian0310/xn-admin-react-ts) | React + TypeScript |

## 前提

1. Node.js 20+（见 `.nvmrc`）
2. 后端 **xn-admin-cloud** 已启动，网关可访问：http://127.0.0.1:8088
3. MySQL / Redis / Nacos / MinIO 等中间件已就绪（随后端）

## 默认账号

与后端种子账号一致（首次初始化，**仅用于本地开发**）：

| 用户名       | 初始密码     | 说明       |
| ------------ | ------------ | ---------- |
| `SuperAdmin` | `SuperAdmin` | 超级管理员 |
| `admin`      | `admin`      | 管理员     |

登录后请尽快修改密码。详见 [SECURITY.md](./SECURITY.md)。

## 快速启动

```bash
npm install           # 安装依赖
npm run dev           # 启动开发服务
```

开发地址：http://localhost:1802（与 react-ts `1800` / vue2-js `1801` / vue3-ts `1803` 错开，便于同时联调）

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

在 Cursor / VS Code 中打开本仓库并安装推荐扩展后：**保存文件会自动 Prettier 格式化，并执行 ESLint 可自动修复项**（见 `.vscode/settings.json`）。

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
- `APP_CLIENT_ID`：`xn-admin-vue3-js`（`src/config/client.js`）
- 开发端口：`1802`
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

## 通用组件

每个组件目录下有独立文档，总览见 [`src/components/README.md`](./src/components/README.md)：

| 组件           | 说明                                | 文档                                                |
| -------------- | ----------------------------------- | --------------------------------------------------- |
| xnAppIcon      | 统一图标（Element / Iconify / SVG） | [README](./src/components/xnAppIcon/README.md)      |
| xnAppBrandLogo | 品牌 Logo                           | [README](./src/components/xnAppBrandLogo/README.md) |
| xnIconPicker   | 图标选择器                          | [README](./src/components/xnIconPicker/README.md)   |
| xnNoticeInbox  | 消息中心抽屉                        | [README](./src/components/xnNoticeInbox/README.md)  |
| xnPageLayout   | 列表页骨架                          | [README](./src/components/xnPageLayout/README.md)   |
| xnRichEditor   | 富文本编辑器                        | [README](./src/components/xnRichEditor/README.md)   |
| xnSidebarMenu  | 多级菜单                            | [README](./src/components/xnSidebarMenu/README.md)  |
| xnTagsView     | 页面标签栏                          | [README](./src/components/xnTagsView/README.md)     |
| xnThemePicker  | 主题设置                            | [README](./src/components/xnThemePicker/README.md)  |
| xnTreePanel    | 左侧树面板                          | [README](./src/components/xnTreePanel/README.md)    |
| xnButton       | 工具栏 / 行操作按钮                 | [README](./src/components/xnButton/README.md)       |
| xnImport       | Excel 导入对话框                    | [README](./src/components/xnImport/README.md)       |
| xnLongText     | 长文本截断 + 点击弹窗查看           | [README](./src/components/xnLongText/README.md)     |
| xnSearch       | 配置化搜索表单                      | [README](./src/components/xnSearch/README.md)       |
| xnTable        | 配置化表格                          | [README](./src/components/xnTable/README.md)        |
| xnUpload       | 大文件分片上传                      | [README](./src/components/xnUpload/README.md)       |
| xnErrorPage    | 403 / 404 / 503 错误页              | [README](./src/components/xnErrorPage/README.md)    |
| xnUiPreference | 个人界面偏好 FAB                    | [README](./src/components/xnUiPreference/README.md) |

典型列表页组合：

```
xnPageLayout
├── #aside → xnTreePanel（可选）
├── #search → xnSearch
├── #toolbar → xnButton
└── #table → xnTable
```

配置通常来自后端 page-ui（`usePageUi`）与路由权限。

## 界面预览

截图放在 [`docs/images/`](./docs/images/)，命名与基准仓库 **xn-admin-vue3-ts** 一致。

### 登录与首页

| 模块   | 截图                                 |
| ------ | ------------------------------------ |
| 登录页 | ![登录页](./docs/images/login.png)   |
| 首页   | ![首页](./docs/images/dashboard.png) |

### 个人中心

| 模块     | 截图                                         |
| -------- | -------------------------------------------- |
| 个人信息 | ![个人信息](./docs/images/profile.png)       |
| 我的消息 | ![我的消息](./docs/images/messages-mine.png) |

### 系统监控

| 模块     | 截图                                          |
| -------- | --------------------------------------------- |
| 在线用户 | ![在线用户](./docs/images/monitor-online.png) |
| 服务监控 | ![服务监控](./docs/images/monitor-server.png) |
| 缓存监控 | ![缓存监控](./docs/images/monitor-redis.png)  |
| SQL 监控 | ![SQL 监控](./docs/images/monitor-sql.png)    |

### 日志管理

后端 `xn-log` / `xn-job` 已提供登录 / 操作 / 异常 / 任务日志接口（查询、详情、删除、清空、导出），菜单与 page-ui 已种子。本仓库**尚未落地页面**（`view-loader` 会落到 404）：

| 页面     | 路由                     | 前端现状                                     |
| -------- | ------------------------ | -------------------------------------------- |
| 登录日志 | `/system/logs/login`     | 有 `api/login-log`，无 `views/.../index.vue` |
| 操作日志 | `/system/logs/oper`      | 有 `api/oper-log`，无页面                    |
| 异常日志 | `/system/logs/exception` | 有 `api/exception-log`，无页面               |
| 任务日志 | `/system/jobs/logs`      | 定时任务页会跳转至此，无页面                 |

### 组织与账号

| 模块     | 截图                                 |
| -------- | ------------------------------------ |
| 用户管理 | ![用户管理](./docs/images/users.png) |
| 单位管理 | ![单位管理](./docs/images/units.png) |
| 岗位管理 | ![岗位管理](./docs/images/posts.png) |

### 权限与安全

| 模块     | 截图                                               |
| -------- | -------------------------------------------------- |
| 角色列表 | ![角色列表](./docs/images/roles.png)               |
| 角色权限 | ![角色权限](./docs/images/permissions.png)         |
| 权限内容 | ![权限内容](./docs/images/permissions-content.png) |
| 路由管理 | ![路由管理](./docs/images/routes.png)              |

### 内容运营

| 模块     | 截图                                   |
| -------- | -------------------------------------- |
| 公告管理 | ![公告管理](./docs/images/notices.png) |
| 站内信   | ![站内信](./docs/images/messages.png)  |

### 基础数据与系统设置

| 模块       | 截图                                            |
| ---------- | ----------------------------------------------- |
| 字典管理   | ![字典管理](./docs/images/dicts.png)            |
| 登录页设置 | ![登录页设置](./docs/images/login-settings.png) |
| 系统配置   | ![系统配置](./docs/images/config.png)           |
| 安全策略   | ![安全策略](./docs/images/security.png)         |
| 远程连接   | ![远程连接](./docs/images/remote-storage.png)   |
| 联系与捐赠 | ![联系与捐赠](./docs/images/site-contact.png)   |

### 系统工具

| 模块     | 截图                                    |
| -------- | --------------------------------------- |
| 文件管理 | ![文件管理](./docs/images/files.png)    |
| 定时任务 | ![定时任务](./docs/images/jobs.png)     |
| 回收站   | ![回收站](./docs/images/recycle.png)    |
| 代码生成 | ![代码生成](./docs/images/codegen.png)  |
| 接口文档 | ![接口文档](./docs/images/api-docs.png) |

## 功能概览

- JWT 登录与会话刷新；`v-permission` 按钮级权限
- 动态菜单 / 路由注册（后端路由 + 视图懒加载）
- 角色、权限、用户、单位、岗位、字典、公告、站内信、登录页配置、系统配置、安全策略、远程连接、联系与捐赠
- 页面标签栏、多布局模式、主题（含自定义色与背景）
- 通用系统配置 + 登录用户个人布局/字号（右下角悬浮入口）
- 表格列个性化、Excel 导入导出
- 系统监控：在线用户 / 服务 / Redis / SQL
- 文件管理、定时任务、回收站、代码生成、接口文档页
- 公告 WebSocket 推送（`/ws`）
- 日志页面前端待补：登录 / 操作 / 异常 / 任务日志（后端接口与菜单已齐）

## 环境与约定

- 路径别名：`@` → `src/`
- 鉴权 Token 由 `utils/request` 注入；未登录跳转登录页
- 列表页常用 `usePageUi` + 手写数据加载；部分页面使用 `xnTable` 的 `api` 模式
- 日志等特殊导出走 `utils/download.js`（带鉴权拉取文件流）
- 共用后端：仅对接独立仓库 `xn-admin-cloud`

## 生产部署（摘要）

- `npm run build` 产出静态资源，由 Nginx 等托管
- 将 `/api`、`/uploads`、`/ws` 反向代理到后端网关（默认 `127.0.0.1:8088`）
- 安全见 [SECURITY.md](./SECURITY.md)；贡献见 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 支持捐赠

如果这个项目对你有帮助，欢迎请作者喝杯咖啡 ☕

<p align="center">
  <img src="./docs/donation/donate.png" alt="支持捐赠（微信支付 / 支付宝）" width="480" />
</p>

## 开源与许可证

本项目采用 [Apache License 2.0](./LICENSE) **免费开源**，**允许个人自用与商业使用**，无需单独购买授权。

| 用途 | 是否允许 |
|------|----------|
| 个人学习、自用部署 | 允许 |
| 二次开发、修改源码 | 允许 |
| 商业项目使用、对外交付 | 允许 |
| 闭源商用 | 允许（须遵守 Apache-2.0） |
| 再分发源码或编译产物 | 允许 |

使用、修改或分发时请：保留版权声明、本许可证文本及 NOTICE（如有）；对修改过的文件注明变更。软件按「现状」提供，不附带任何明示或默示担保。完整条款见 [LICENSE](./LICENSE)。

捐赠为自愿支持，不构成商业授权或付费售后。
