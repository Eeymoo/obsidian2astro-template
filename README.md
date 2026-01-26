# Obsidian2Astro 博客模板

基于 Astro + TypeScript + Tailwind CSS 4.x 的现代化博客模板，专为从 Obsidian 迁移到静态博客而设计。

## 特性

- ✅ 支持 Markdown 和 MDX 内容
- ✅ Tailwind CSS 4.x 现代化样式
- ✅ 深色模式支持
- ✅ 评论系统（支持 Giscus 和 Gitalk）
- ✅ 分类和标签系统
- ✅ 微博客功能
- ✅ RSS 订阅源
- ✅ SEO 优化（Sitemap、结构化数据）
- ✅ 友情链接页面
- ✅ 构建时注入 Git Commit Hash
- ✅ 外部链接白名单和转换功能

## 项目结构

```
├── public/           # 静态资源
├── src/
│   ├── components/   # Astro 组件
│   ├── config/       # 应用配置
│   ├── content/      # 内容集合
│   ├── layouts/      # 页面布局
│   ├── pages/        # 页面路由
│   └── utils/        # 工具函数
├── astro.config.mjs  # Astro 配置
├── package.json
└── tsconfig.json
```

### 主要页面

- **首页** (`/`) - 博客主页，展示最新文章
- **博客** (`/post`) - 博客文章列表
  - 微博客 (`/microblog`)
  - 归档 (`/archives`)
- **分类** (`/categories`) - 文章分类列表
- **标签** (`/tags`) - 文章标签云
- **关于** (`/about`) - 关于页面
- **友链** (`/friends`) - 友情链接
- **捐赠** (`/donate`) - 捐赠页面
- **跳转** (`/goto`) - 外部链接跳转页
- **RSS 订阅** (`/rss.xml`) - RSS Feed

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 http://localhost:4321

### 构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录，构建时自动注入 Git Commit Hash

### 预览

```bash
npm run preview
```

### Astro CLI

```bash
npm run astro ...
```

## 配置

主要配置位于 `src/config/index.ts`：

**站点配置**
- `siteTitle`: 站点标题
- `siteDescription`: 站点描述
- `siteUrl`: 站点 URL（需修改为你的域名）
- `siteIcon`: 站点图标 URL
- `navLinks`: 导航菜单配置

**其他配置**
- `friendlyLink`: 友情链接列表
- `donate`: 捐赠信息（ETC、SOL 地址）
- `comments`: 评论系统配置（`giscus` 或 `gitalk`）

## 编写内容

### 创建博客文章

在 `src/content/blog/` 目录下创建 Markdown 或 MDX 文件：

```yaml
---
title: 文章标题
description: 文章描述
date: 2026-01-26
tags: [标签1, 标签2]
categories: [分类]
draft: false
---

文章内容...
```

### 创建微博客

在 `src/content/microblog/` 目录下创建文件：

```yaml
---
date: 2026-01-26
---

短内容...
```

### 外部链接转换

支持 `[[链接]]` 语法，需在 `src/config/index.ts` 中配置白名单。

## 技术栈

- **框架**: Astro 5.16.6
- **语言**: TypeScript
- **样式**: Tailwind CSS 4.1.18
- **内容**: MDX (@astrojs/mdx 4.3.13)
- **SEO**: Sitemap (@astrojs/sitemap 3.6.0), RSS (@astrojs/rss 4.0.14)
- **工具**: dayjs (日期), sharp (图片处理)

## 部署

项目可部署到任何支持静态站点托管的服务：

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- 自建服务器

构建后，Git Commit Hash 会自动注入到 `import.meta.env.__version__`，可用于版本显示。

## 代码规范

详见 [AGENTS.md](./AGENTS.md)：

- 使用 TypeScript 严格模式
- 组件使用 PascalCase 命名
- 工具函数使用 camelCase 命名
- 短小函数，单一职责
- Tailwind CSS 工具类优先，避免自定义 CSS
- 使用透明度变色 (`bg-primary/10`, `bg-primary/20`)
- 最小化边框和阴影，用留白代替

## Git 提交规范

提交信息格式：`区域: 描述`（中文）

- `feat`: 新功能
- `fix`: 修复
- `refactor`: 重构
- `style`: 样式
- `docs`: 文档
- `chore`: 构建/配置

示例：`docs: 更新 README 说明`

## 贡献

欢迎提交 Issue 和 Pull Request。

## 许可

MIT License
