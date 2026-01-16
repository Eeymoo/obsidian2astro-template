/**
 * 生成统一的分类 slug（不做 URI 编码，便于人类可读）
 * 规则：trim -> 空白/下划线/斜杠替换为 '-' -> 去重 '-' -> 去除首尾 '-'
 * 同时移除常见标点，保留中文与字母数字。
 */
export function generateCategorySlug(category: string): string {
  if (typeof category !== 'string') return '';
  let s = category.trim();
  s = s.replace(/[!@#$%^&*()+=,.:;"'<>?`~\[\]{}]/g, '');
  s = s.replace(/\s+/g, '-');
  s = s.replace(/[_/\\]+/g, '-');
  s = s.replace(/-{2,}/g, '-');
  s = s.replace(/^-|-$/g, '');
  return s;
}
