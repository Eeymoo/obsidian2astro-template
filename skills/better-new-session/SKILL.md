---
name: better-new-session
description: 在新会话开始时执行标准 Git 工作流程：切换到主分支、拉取最新代码、根据任务创建符合命名规范的新分支。适用于所有新开发会话的初始化阶段，确保代码库处于最新状态且分支管理规范。
---

# Better New Session

## 工作流程

在新的会话开始时，按以下顺序执行 Git 操作：

### 1. 切换到主分支
```bash
git checkout main
```

### 2. 拉取最新代码
```bash
git pull
```

### 3. 创建新分支
根据任务类型和内容创建分支，遵循命名规范。

## 分支命名规范

分支名称格式：`区域/描述`

**区域类型**：
- `feat` - 新功能
- `fix` - 修复问题
- `refactor` - 重构代码
- `style` - 样式调整
- `docs` - 文档相关
- `chore` - 构建工具或辅助工具的变动
- `feature` - 功能开发（与 feat 同义）

**命名示例**：
- `docs/skills` - 创建 skills 相关文档
- `feat/header-search-change` - 修改 header 的搜索功能
- `fix/mobile-navigation-menu` - 修复移动端导航菜单问题
- `refactor/utils-optimize-urls` - 优化 URL 处理工具函数
- `style/posts-readability` - 改进文章页面的可读性样式
- `feature/mobile-ua-routing` - 移动端 UA 路由功能

**命名原则**：
- 使用英文，避免中文
- 使用小写字母和连字符 `-`
- 区域和描述之间用斜杠 `/` 分隔
- 描述中使用连字符 `-` 分隔单词
- 描述简洁明了，能清楚表达任务内容

## 错误处理

**主分支名称不是 main**：
检查项目的默认分支名称（可能是 `master` 或其他），使用正确的分支名称。

**本地有未提交的更改**：
先处理本地更改（提交或暂存），再执行 checkout 操作。

**拉取冲突**：
使用 `git status` 查看冲突文件，解决冲突后再继续。

## 执行命令示例

```bash
# 标准工作流程
git checkout main && git pull && git checkout -b feat/header-search-change
```

## 注意事项

- 每次新会话都应执行此工作流程，确保基于最新的代码进行开发
- 分支名称应在创建前与用户确认，确保符合项目规范
- 如果项目有特殊的分支管理策略，优先遵循项目规定
