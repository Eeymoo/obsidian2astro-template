import { extractDescriptionFromMarkdown } from './src/utils/index.js';

// 测试内容
const testContent = `---
title: "测试文章描述提取"
tags: ["测试"]
categories: "技术"
date: 2026-01-20
---

# 这是一个测试文章

这是用来测试**描述提取功能**的文章。包含了一些 *Markdown* 语法。

## 功能特性

- 支持粗体和斜体
- \`代码块\`也能正确处理
- [链接文本](https://example.com)会提取文本部分

> 引用内容也会被正确处理

这个文章应该能够生成一个干净的描述，去除所有 Markdown 符号，只保留纯文本内容用于 SEO 优化和社交媒体分享。`;

console.log('=== 描述提取测试 ===');
console.log('原始内容长度:', testContent.length);
console.log('提取的描述:');
console.log(extractDescriptionFromMarkdown(testContent));
console.log('描述长度:', extractDescriptionFromMarkdown(testContent).length);