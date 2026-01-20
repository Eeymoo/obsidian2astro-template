import config from '../config/index.ts';
import crypto from 'crypto';
import { MD_LINK_REG } from './regexps.ts';
import { generateCategorySlug } from './categories.ts';
import { generateTagSlug } from './tags.ts';

/**
 * 生成文章的固定链接 slug
 * @param post - 文章对象，包含 id 和 data.uri
 * @returns 文章的 slug
 */
export function generatePostSlug(post: { id: string; data: { uri?: string } }): string {
  if (post.data.uri) {
    return post.data.uri;
  }
  const algorithm = 'sha256';
  return 'temporary-url/' + crypto
    .createHash(algorithm)
    .update(post.id, 'utf8')
    .digest('hex')
    .slice(0, 32);
}

/**
 * 转换 Markdown 中的所有行内链接，非白名单链接转为 /goto.html?url=原始链接 格式
 * @param {string} mdContent - 原始 Markdown 内容字符串
 * @param {Array<string>} whiteList - 链接白名单列表（匹配原始链接，精准匹配）
 * @returns {string} 处理后的 Markdown 内容
 */
export function convertMdALinksToGoto(mdContent: string, whiteList: string[] = config.friendlyLink.map(link => link.link)): string {
  // 校验参数类型，避免异常
  if (typeof mdContent !== 'string') {
    throw new TypeError('第一个参数 mdContent 必须是字符串类型');
  }
  if (!Array.isArray(whiteList)) {
    throw new TypeError('第二个参数 whiteList 必须是数组类型');
  }

  // 使用 replace 方法进行批量替换，回调函数处理每个匹配项
  return mdContent.replace(MD_LINK_REG, (match, linkText, originalUrl, title) => {
    // 判断原始链接是否在白名单中
    const isInWhiteList = whiteList.some(whiteUrl => whiteUrl === originalUrl);

    if (isInWhiteList) {
      // 白名单内的链接，直接返回原匹配内容，不做修改
      return match;
    } else {
      // 非白名单链接，转换为目标格式，对原始链接进行 URL 编码（避免特殊字符导致跳转异常）
      const encodedUrl = encodeURIComponent(originalUrl);
      const targetUrl = `/goto.html?url=${encodedUrl}`;
      // 拼接新的 Markdown 链接，保留原链接文本和可选标题
      return title ? `[${linkText}](${targetUrl}${title})` : `[${linkText}](${targetUrl})`;
    }
  });
}

/**
 * 从 HTML 中提取所有 a 标签，将非白名单链接的 href 转为 /goto.html?url=原始链接 格式
 * @param {string} htmlContent - 原始 HTML 内容字符串
 * @param {Array<string>} whiteList - 链接白名单列表（匹配原始 href，精准匹配）
 * @returns {string} 处理后的 HTML 内容
 */
export function convertHtmlALinksToGoto(htmlContent: string, whiteList: string[] = config.friendlyLink.map(link => link.link)) {
  // 校验参数类型，避免异常
  if (typeof htmlContent !== 'string') {
    throw new TypeError('第一个参数 htmlContent 必须是字符串类型');
  }
  if (!Array.isArray(whiteList)) {
    throw new TypeError('第二个参数 whiteList 必须是数组类型');
  }

  // 1. 创建 DOMParser 实例，用于解析 HTML 字符串（原生浏览器 API，不依赖第三方库）
  const parser = new DOMParser();
  // 2. 解析 HTML 内容，生成文档对象模型（DOM）
  const doc = parser.parseFromString(htmlContent, 'text/html');
  // 3. 提取文档中所有的 <a> 标签
  const aTags = doc.querySelectorAll('a');

  // 4. 遍历所有 <a> 标签，进行链接处理
  aTags.forEach(aTag => {
    // 获取 a 标签的原始 href 属性值（忽略空 href 或无 href 属性的标签）
    const originalHref = aTag.getAttribute('href');
    if (!originalHref) return;

    // 5. 判断原始链接是否在白名单中
    const isInWhiteList = whiteList.some(whiteUrl => whiteUrl === originalHref);

    if (!isInWhiteList) {
      // 6. 非白名单链接：进行 URL 编码，避免特殊字符导致参数异常
      const encodedHref = encodeURIComponent(originalHref);
      // 7. 拼接目标链接格式，更新 a 标签的 href 属性
      const targetHref = `/goto.html?url=${encodedHref}`;
      aTag.setAttribute('href', targetHref);
    }
    // 白名单链接：不做任何修改，保留原始 href
  });

  // 8. 将处理后的 DOM 转换回 HTML 字符串并返回
  return doc.body.innerHTML;
}

/**
 * 从 Markdown 内容中提取纯文本描述
 * @param content - Markdown 内容字符串
 * @param maxLength - 最大长度，默认180字
 * @returns 提取的纯文本描述
 */
export function extractDescriptionFromContent(content: string, maxLength: number = 180): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // 移除 frontmatter
  let cleanContent = content.replace(/^---\n.*?\n---\n/s, '');
  
  // 移除 Markdown 语法
  cleanContent = cleanContent
    // 移除标题标记
    .replace(/^#{1,6}\s+/gm, '')
    // 移除加粗和斜体
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, '')
    // 移除行内代码
    .replace(/`([^`]+)`/g, '$1')
    // 移除链接，保留文本
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // 移除图片
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // 移除引用
    .replace(/^>\s+/gm, '')
    // 移除列表标记
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    // 移除表格
    .replace(/\|.*\|/g, '')
    // 移除分隔线
    .replace(/^---+$/gm, '')
    // 移除多余的空白字符
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 限制长度
  if (cleanContent.length > maxLength) {
    return cleanContent.substring(0, maxLength).trim() + '...';
  }

  return cleanContent;
}

// 统一导出所有 utils 方法和规则
export { generateCategorySlug, generateTagSlug };
export { filterContent } from './filterContent';
export { MD_LINK_REG } from './regexps.ts';