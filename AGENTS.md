# AGENTS.md - 代理行为指南

## 项目概述
Astro + TypeScript + Tailwind CSS 4.x 博客项目，支持 MDX、Markdown 内容管理。

## 主要命令

### 构建
- **开发服务器**: `npm run dev`
- **生产构建**: `npm run build` (包含 git hash 插入)
- **预览构建产物**: `npm run preview`
- **Astro CLI**: `npm run astro`

### 代理提交前构建流程
代理在提交代码前必须执行以下步骤：

1. **检查 Node.js 版本**
   - 运行 `node -v` 检查当前版本
   - 如果版本低于 18.20.8，需要使用 nvm 切换版本：
     - 已安装 nvm：`nvm use 20` (或其他 >=18.20.8 的版本)
     - 未安装 nvm：先安装
       ```bash
       curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
       export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
       nvm install 20
       nvm use 20
       ```

2. **本地构建测试**
   - 运行 `npm run build` 确保构建成功
   - 如果构建失败，修复问题后重新测试

3. **提交代码**
   - 构建成功后才能提交代码
   - 提交信息中必须包含构建验证结果

### 代码质量
本项目暂未配置 lint、format、test 工具。如需添加，建议：
- **Linting**: ESLint + @typescript-eslint
- **Formatting**: Prettier
- **Testing**: Vitest (如需测试)

## 代码风格指南

### TypeScript
- **严格模式**: 启用 strictNullChecks，避免 any 类型
- **类型定义**: 统一在 `src/config/types.ts` 等类型文件中定义
- **导入顺序**: 第三方库 -> 内部模块 -> 相对路径，每组按字母排序

### 命名约定
- **组件文件**: PascalCase (如 `Header.astro`, `DarkModeButton.astro`)
- **工具函数**: camelCase (如 `generatePostSlug`, `convertMdALinksToGoto`)
- **常量**: SNAKE_CASE 或 camelCase (根据上下文)
- **类型/接口**: PascalCase

### Astro 组件
- **Props 接口**: 使用 interface 定义，明确类型
- **Props 解构**: 使用 `const { prop = default } = Astro.props`
- **类型断言**: 仅在必要时使用 `any`，添加注释说明原因
- **客户端脚本**: 使用 `<script>` 标签，避免内联复杂逻辑

### 函数与模块
- **单一职责**: 函数应短小（<100 行），职责明确
- **错误处理**: 抛出类型化错误而非字符串，提供上下文信息
- **参数校验**: 公共函数需校验参数类型，使用 TypeError
- **配置管理**: 集中在 `src/config/index.ts`，类型定义在 `src/config/types.ts`

### 注释与文档
- **注释语言**: 中文注释，简明扼要
- **JSDoc**: 公共函数添加 JSDoc 注释（参数、返回值、示例）
- **TODO**: 临时方案标记 TODO，避免长期遗留

## 样式规范

### Tailwind CSS 4.x
- **优先使用工具类**: 避免自定义 CSS，使用 Tailwind 工具类
- **响应式设计**: 优先移动端，使用 `sm:`, `md:`, `lg:` 断点
- **暗色模式**: 使用 `dark:` 变体，遵循亮/暗色层级
- **悬停状态**: 使用 `hover:` 变体，添加过渡效果 `transition-colors`
- **颜色使用**:
  - 主要颜色: `text-primary`, `bg-primary`
  - 衍生变种: `bg-primary/10`, `bg-primary/20` (10%/20% 透明度用于背景、交互状态)
  - 语义颜色: text-slate-*, text-gray-*
  - 背景色: `bg-white dark:bg-slate-950`
- **留白设计**: 通过 padding/margin 区分层级，避免过多边框和阴影
- **布局**: 使用 Flexbox 和 Grid，响应式优先

### 现代留白美学
- **背景**: 使用 `bg-primary/20` 等透明色作为主要颜色背景
- **交互**: 悬停时使用 `bg-primary/10` (亮色) 或 `bg-primary/20` (暗色)
- **边框**: 最小化边框使用，用留白代替
- **阴影**: 仅在必要如下拉菜单使用 `shadow-lg`
- **圆角**: 统一使用 `rounded` 或 `rounded-lg`

## 导入规范
```typescript
// 第三方库
import crypto from 'crypto';
import { join } from 'node:path';

// 内部模块
import config from '../config/index.ts';
import { generateCategorySlug } from '../utils/categories.ts';

// 相对路径
import { type Config } from './types.ts';
```

## Git 提交策略
- **小步提交**: 每次改动只做一件事
- **提交信息格式**: 使用中文，格式：`区域: 描述`
  - 区域类型: `feat(新功能)`, `fix(修复)`, `refactor(重构)`, `style(样式)`, `docs(文档)`, `test(测试)`, `chore(构建/配置)`
  - 示例: `feat(header): 添加下拉菜单支持`, `fix: 修复链接跳转失败`, `docs: 更新部署说明`
- **提交前**: 运行 `npm run build` 确保构建成功
- **代理提交详情**: 必须包含变更原因、运行命令、测试结果

## Pull Request 规则
- **标题格式**: 使用中文，格式 `区域: 描述`
  - 示例: `feat: 添加搜索功能`, `fix: 修复移动端导航问题`
- **描述内容**: 使用中文，包含以下部分：
  - 变更概述（简短说明改动内容）
  - 主要改动点（使用列表列出关键变更）
  - 测试说明（如何验证改动）
  - 截图/演示（UI 相关改动需提供）
- **关联 Issue**: 标题或描述中应包含问题编号（如 `Fixes #123`）

## 特殊约定
- **链接安全**: 外部链接需通过 `convertMdALinksToGoto` 转换，白名单在 config 中配置
- **Slug 生成**: 使用 `generatePostSlug` 统一生成 URL
- **日期处理**: 使用 dayjs 库，统一在工具函数封装
- **Markdown**: 支持 MDX，frontmatter 类型由 Astro 自动生成

## 环境变量
- `VITE_GIT_HASH`: 构建时自动注入 git commit hash
- 通过 `import.meta.env.__version__` 访问

## 常见任务
- **添加新页面**: 在 `src/pages/` 创建 `*.astro` 或 `[param]/index.astro`
- **添加组件**: 在 `src/components/` 创建 `*.astro`
- **添加工具函数**: 在 `src/utils/` 创建 `*.ts`，统一在 `index.ts` 导出
- **修改配置**: 编辑 `src/config/index.ts` 和 `src/config/types.ts`
