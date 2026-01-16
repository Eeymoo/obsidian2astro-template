/**
 * 生成统一的标签 slug（不做 URI 编码，便于人类可读）
 * 规则：trim -> 空白/下划线/斜杠替换为 '-' -> 去重 '-' -> 去除首尾 '-'
 * 同时移除常见标点，保留中文与字母数字。
 */
export function generateTagSlug(tag: string): string {
  if (typeof tag !== 'string') return '';
  let s = tag.trim();
  s = s.replace(/[!@#$%^&*()+=,.:;"'<>?`~\[\]{}]/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/[_/\\]+/g, '-');
  s = s.replace(/-{2,}/g, '-');
  s = s.replace(/^-|-$/g, '');
  return s;
}
