/**
 * 工具页面数据源
 */

/** 工具项类型定义 */
export interface ToolItem {
  /** 工具名称 */
  name: string;
  /** 工具链接 */
  href: string;
  /** 工具描述 */
  description: string;
}

/** 工具列表 */
export const tools: ToolItem[] = [
  {
    name: 'URL 重定向',
    href: '/tool/goto',
    description: '安全的外链跳转工具，支持所有 URI 协议',
  },
  {
    name: 'Gzip 压缩率对比',
    href: '/tool/gzip-compare',
    description: '输入两段文本，实时对比它们的 Gzip 压缩率和大小',
  },
  {
    name: '文本差异对比',
    href: '/tool/text-compare',
    description: '对比两段文本或代码的差异，支持多语言语法高亮',
  },
];
