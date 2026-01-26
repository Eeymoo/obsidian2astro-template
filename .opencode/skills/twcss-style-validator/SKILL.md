---
name: twcss-style-validator
description: Tailwind CSS 风格校验器，检测代码是否完全使用 Tailwind CSS 而不是自定义 CSS，以及是否符合简约现代设计要求。使用时机：代码提交前检查、代码审查、PR 合并前、开发过程中确保样式一致性。
---

# Tailwind CSS 风格校验器

## 概述

该技能提供 Tailwind CSS 风格校验工具，确保代码符合项目规范：
- 完全使用 Tailwind CSS 工具类，不使用自定义 CSS
- 遵循简约现代设计原则（减少边框/阴影，使用透明度背景）

## 快速开始

运行校验器检查当前目录：

```bash
python3 .opencode/skills/twcss-style-validator/scripts/validate_twcss.py src/
```

检查特定文件：

```bash
python3 .opencode/skills/twcss-style-validator/scripts/validate_twcss.py src/components/Header.astro
```

输出 JSON 格式（用于 CI）：

```bash
python3 .opencode/skills/twcss-style-validator/scripts/validate_twcss.py src/ --json
```

## 校验规则

### 1. Tailwind CSS 使用规范

检测并警告以下情况：
- **内联样式**：`style="..."` 应转换为 Tailwind 工具类
- **<style> 标签**：应使用 `@apply` 或工具类组合
- **CSS 导入**：`@import` 或 `.css` 文件应移除

### 2. 简约现代设计规范

检测并建议以下改进：
- **过度边框**：繁重的边框应用留白代替
- **过度阴影**：过多的阴影（如 `shadow-2xl`）应减少
- **非透明背景**：纯色背景应改为透明度变体（如 `bg-primary/10`）

## 常见修复示例

### 内联样式 → Tailwind

```astro
<!-- ❌ 错误 -->
<div style="padding: 1rem; background: #f0f0f0">

<!-- ✅ 正确 -->
<div class="p-4 bg-slate-100">
```

### <style> 标签 → @apply

```astro
<!-- ❌ 错误 -->
<style>
  .custom-card {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }
</style>

<!-- ✅ 正确 -->
<div class="p-6 rounded">
```

### 纯色背景 → 透明度

```astro
<!-- ❌ 错误 -->
<div class="bg-primary">

<!-- ✅ 正确 -->
<div class="bg-primary/10">
```

## 集成到项目

### Git Hooks

在 `.git/hooks/pre-commit` 添加：

```bash
#!/bin/bash
python3 .opencode/skills/twcss-style-validator/scripts/validate_twcss.py src/
if [ $? -ne 0 ]; then
  echo "❌ 风格校验失败，请修复后再提交"
  exit 1
fi
```

### CI/CD

在 GitHub Actions 中：

```yaml
- name: 验证 Tailwind CSS 风格
  run: |
    python3 .opencode/skills/twcss-style-validator/scripts/validate_twcss.py src/ --json > report.json
```

## 扩展自定义规则

修改 `scripts/validate_twcss.py` 中的 `patterns` 字典添加自定义检测规则：

```python
self.patterns = {
    # 添加自定义规则
    'custom_rule': r'your_regex_pattern',
}
```

在 `validate_file` 方法中添加对应的检测逻辑。

## 资源

### scripts/
- `validate_twcss.py`: 主校验脚本，可在命令行直接运行

### references/
此技能不需要额外的参考文档。

### assets/
此技能不需要额外资源。
