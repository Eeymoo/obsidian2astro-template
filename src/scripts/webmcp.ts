interface WebMcpConnection {
  id: string;
  name: string;
  endpoint: string;
  status: string;
  description: string;
  capabilities: string[];
}

interface WebMcpArticle {
  slug: string;
  title: string;
  url: string;
  date: string;
  summary: string;
  previewContent: string;
  fullContent: string;
}

interface WebMcpPayload {
  connections: WebMcpConnection[];
  articles: WebMcpArticle[];
}

interface ModelContextRuntime {
  registerTool?: (...args: unknown[]) => unknown;
  registerResource?: (...args: unknown[]) => unknown;
}

function updateRuntimeStatus(status: string, detail: string, isSuccess: boolean): void {
  const statusElement = document.getElementById('webmcp-runtime-status');
  const detailElement = document.getElementById('webmcp-runtime-detail');

  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = isSuccess
      ? 'inline-flex items-center px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
      : 'inline-flex items-center px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
  }

  if (detailElement) {
    detailElement.textContent = detail;
  }
}

function getPagePayload(): WebMcpPayload | null {
  const payloadElement = document.getElementById('webmcp-page-data');
  if (!payloadElement) return null;

  try {
    return JSON.parse(payloadElement.textContent || '{}') as WebMcpPayload;
  } catch (error) {
    console.error('解析 WebMCP 页面数据失败:', error);
    return null;
  }
}

function getRuntime(): ModelContextRuntime | null {
  const nav = navigator as Navigator & { modelContext?: ModelContextRuntime };
  if (nav.modelContext) return nav.modelContext;
  return null;
}

async function tryRegisterTool(
  runtime: ModelContextRuntime,
  name: string,
  description: string,
  inputSchema: Record<string, unknown>,
  handler: (input: unknown) => Promise<unknown>,
): Promise<boolean> {
  if (typeof runtime.registerTool !== 'function') return false;

  const attempts: Array<() => unknown> = [
    () => runtime.registerTool?.(name, description, inputSchema, handler),
    () => runtime.registerTool?.({ name, description, inputSchema }, handler),
    () => runtime.registerTool?.({ name, description, inputSchema, execute: handler }),
  ];

  for (const attempt of attempts) {
    try {
      await Promise.resolve(attempt());
      return true;
    } catch {
      // 兼容不同 runtime 的 registerTool 签名，失败后继续尝试下一种
    }
  }

  return false;
}

async function tryRegisterResource(
  runtime: ModelContextRuntime,
  name: string,
  uri: string,
  description: string,
  handler: () => Promise<unknown>,
): Promise<boolean> {
  if (typeof runtime.registerResource !== 'function') return false;

  const attempts: Array<() => unknown> = [
    () => runtime.registerResource?.(name, uri, description, handler),
    () => runtime.registerResource?.({ name, uri, description }, handler),
    () => runtime.registerResource?.({ name, uri, description, read: handler }),
  ];

  for (const attempt of attempts) {
    try {
      await Promise.resolve(attempt());
      return true;
    } catch {
      // 兼容不同 runtime 的 registerResource 签名，失败后继续尝试下一种
    }
  }

  return false;
}

export async function initWebMcp(): Promise<void> {
  const payload = getPagePayload();
  if (!payload) {
    updateRuntimeStatus('未启用', '页面数据读取失败，无法初始化 WebMCP。', false);
    return;
  }

  const runtime = getRuntime();
  if (!runtime) {
    updateRuntimeStatus('未检测到运行时', '未发现 navigator.modelContext，仅保留页面展示。', false);
    return;
  }

  const listConnectionsRegistered = await tryRegisterTool(
    runtime,
    'list_connections',
    '列出当前页面可用的全部 WebMCP 连接',
    { type: 'object', properties: {} },
    async () => ({
      total: payload.connections.length,
      connections: payload.connections,
    }),
  );

  const getArticleRegistered = await tryRegisterTool(
    runtime,
    'get_article_by_slug',
    '根据 slug 获取文章内容',
    {
      type: 'object',
      required: ['slug'],
      properties: {
        slug: {
          type: 'string',
          description: '文章 slug，例如 2026-year-new-start',
        },
      },
    },
    async (input: unknown) => {
      const inputObject = typeof input === 'object' && input !== null ? input as { slug?: unknown } : {};
      const slug = typeof inputObject.slug === 'string' ? inputObject.slug : '';
      if (!slug) {
        throw new TypeError('slug 不能为空');
      }

      const article = payload.articles.find((item) => item.slug === slug);
      if (!article) {
        throw new Error(`未找到 slug=${slug} 的文章`);
      }

      return article;
    },
  );

  const connectionsResourceRegistered = await tryRegisterResource(
    runtime,
    'connections',
    'webmcp://connections',
    '当前页面公开的连接列表',
    async () => ({
      total: payload.connections.length,
      connections: payload.connections,
    }),
  );

  const articlesResourceRegistered = await tryRegisterResource(
    runtime,
    'articles',
    'webmcp://articles',
    '当前页面公开的文章列表',
    async () => ({
      total: payload.articles.length,
      articles: payload.articles.map((article) => ({
        slug: article.slug,
        title: article.title,
        url: article.url,
        date: article.date,
        summary: article.summary,
      })),
    }),
  );

  const registeredCount = [
    listConnectionsRegistered,
    getArticleRegistered,
    connectionsResourceRegistered,
    articlesResourceRegistered,
  ].filter(Boolean).length;

  if (registeredCount === 0) {
    updateRuntimeStatus('注册失败', '检测到运行时，但注册工具/资源失败。', false);
    return;
  }

  updateRuntimeStatus(
    '已启用',
    `已注册 ${registeredCount} 项能力（连接与文章内容可被读取）。`,
    true,
  );
}
