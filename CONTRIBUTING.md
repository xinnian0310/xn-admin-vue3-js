# 工程规范

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

## 与基准

功能对齐 [`xn-admin-vue3-ts`](../xn-admin-vue3-ts/)，共用后端 [`xn-admin-cloud`](../xn-admin-cloud/)。详见 [`../docs/PRD-xn-admin-frontend-sync.md`](../docs/PRD-xn-admin-frontend-sync.md)。
