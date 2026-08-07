# 贡献指南

感谢关注本仓库。本工程为独立开源前端（Vue 3 + JavaScript）；功能对齐基准仓库 **xn-admin-vue3-ts**，配套后端为 **xn-admin-cloud**。

## 如何贡献

1. Fork 本仓库并创建功能分支
2. 本地按下方命令完成检查
3. 提交信息遵循 Conventional Commits
4. 发起 Pull Request，说明动机与验证方式

安全相关问题请优先阅读 [SECURITY.md](./SECURITY.md)。

## 本地命令

```bash
npm run lint
npm run test
npm run format:check
npm run ci
```

- `lint` / `test` / `format:check`：单项检查
- `ci`：lint + format:check + test + build（本仓库为 JavaScript，无 typecheck）

## Git Hooks

安装依赖后 Husky 会配置本地 hooks。

| Hook         | 作用                                  |
| ------------ | ------------------------------------- |
| `pre-commit` | lint-staged（ESLint 修复 + Prettier） |
| `commit-msg` | Conventional Commits                  |

## 提交信息

```
<type>(optional-scope): <subject>

feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert
```

示例：`feat(logs): 增加操作日志详情弹窗`

## CI

- Gitee Go：`.workflow/ci.yml`（需在控制台启用流水线）
