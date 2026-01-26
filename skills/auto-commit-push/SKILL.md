---
name: auto-commit-push
description: 功能开发完成后自动提交更改并推送到远程仓库。包含代码审查、构建验证、提交信息生成（使用项目规范格式）和远程推送的完整流程，适用于所有功能开发结束后的代码提交场景。
---

# Auto Commit Push

## 工作流程

在功能开发完成后，按以下顺序执行提交和推送操作：

### 1. 检查当前状态
```bash
git status
```
查看未跟踪文件和修改，确认所有需要提交的更改。

### 2. 查看代码变更
```bash
git diff
```
查看所有未暂存和已暂存的更改内容，了解具体修改。

### 3. 运行构建验证
```bash
npm run build
```
确保构建成功，构建失败不应提交。

### 4. 添加更改到暂存区
```bash
git add .
```
或根据需要选择性添加：
```bash
git add <file1> <file2>
```

### 5. 创建提交
```bash
git commit -m "区域: 描述 [auto]"
```

**提交信息格式**：
- 使用中文描述
- 格式：`区域: 描述 [auto]`
- 必须包含 `[auto]` 标记（代理提交标识）

**区域类型**：
- `feat` - 新功能
- `fix` - 修复
- `refactor` - 重构
- `style` - 样式
- `docs` - 文档
- `test` - 测试
- `chore` - 构建/配置

**提交示例**：
- `feat: 添加搜索功能 [auto]`
- `fix: 修复移动端导航问题 [auto]`
- `docs: 更新部署说明 [auto]`
- `refactor: 优化组件结构 [auto]`

### 6. 推送到远程
```bash
git push -u origin <branch-name>
```
或如果已关联远程分支：
```bash
git push
```

## 提交信息规范

根据代码变更的具体内容确定提交信息：

- **新增功能**：`feat: 描述 [auto]`
- **修复 Bug**：`fix: 描述 [auto]`
- **代码重构**：`refactor: 描述 [auto]`
- **样式调整**：`style: 描述 [auto]`
- **文档更新**：`docs: 描述 [auto]`
- **配置变更**：`chore: 描述 [auto]`

**描述应包含**：
- 简短说明改动内容
- 如果是修复问题，简要说明修复的问题
- 保持简洁（1-2 句话）

## 错误处理

**构建失败**：
- 不要提交代码
- 先修复构建错误
- 重新运行 `npm run build` 验证

**提交信息错误**：
- 使用 `git commit --amend` 修正最近一次提交
- 或创建新的提交修正

**推送失败**：
- 检查网络连接
- 检查远程仓库名称和分支名称
- 如果远程有新提交，先拉取：`git pull --rebase`

**有未提交的临时代码**：
- 只提交相关功能代码
- 临时代码和调试代码不应提交
- 使用 `.gitignore` 忽略不需要的文件

## 完整命令示例

```bash
# 标准提交流程
git status && git diff && npm run build && git add . && git commit -m "feat: 添加搜索功能 [auto]" && git push -u origin feat/header-search-change
```

## 注意事项

- 代理提交必须包含 `[auto]` 标记
- 提交前必须确保构建成功
- 只提交与当前任务相关的更改
- 不要提交敏感信息（如 .env 文件）
- 每次提交只做一件事，保持提交历史清晰
