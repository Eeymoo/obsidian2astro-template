/**
 * WebMCP 页面数据源
 */

/** WebMCP 连接状态 */
export type WebMcpConnectionStatus = 'connected' | 'degraded' | 'disconnected';

/** WebMCP 连接信息 */
export interface WebMcpConnection {
  /** 连接 ID */
  id: string;
  /** 连接名称 */
  name: string;
  /** 连接端点 */
  endpoint: string;
  /** 连接状态 */
  status: WebMcpConnectionStatus;
  /** 连接描述 */
  description: string;
  /** 可用能力列表 */
  capabilities: string[];
}

/** WebMCP 连接列表（页面展示 + runtime 注册） */
export const webmcpConnections: WebMcpConnection[] = [
  {
    id: 'blog-content',
    name: 'Blog Content MCP',
    endpoint: 'mcp://blog/content',
    status: 'connected',
    description: '提供文章正文读取、按 slug 获取文章全文。',
    capabilities: ['article.read', 'article.list'],
  },
  {
    id: 'blog-search',
    name: 'Blog Search MCP',
    endpoint: 'mcp://blog/search',
    status: 'connected',
    description: '提供文章标题与正文关键词检索能力。',
    capabilities: ['article.search'],
  },
  {
    id: 'friend-links',
    name: 'Friend Links MCP',
    endpoint: 'mcp://blog/friends',
    status: 'degraded',
    description: '提供友链与站点关联信息读取，当前响应较慢。',
    capabilities: ['links.list'],
  },
  {
    id: 'site-metrics',
    name: 'Metrics MCP',
    endpoint: 'mcp://blog/metrics',
    status: 'connected',
    description: '提供页面访问指标的只读查询接口。',
    capabilities: ['metrics.read'],
  },
];
