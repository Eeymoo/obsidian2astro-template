import https from 'https';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';

// 禁用SSL证书验证（用于自签名证书）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface DomainUrls {
  domain: string;
  urls: Set<string>;
}

/**
 * 发送HTTP请求获取页面内容
 */
function fetchPage(urlString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlString);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      const options: any = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search || '/',
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'close'
        },
        timeout: 15000,
        rejectUnauthorized: false // 允许自签名证书
      };

      // 只为本地开发设置Host头
      if (urlObj.hostname.includes('localhost') || urlObj.hostname.includes('127.0.0.1')) {
        options.headers['Host'] = urlObj.host;
      }

      const req = protocol.request(options, (res) => {
        // 检查响应状态码
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }

        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout for ${urlString}`));
      });
      req.on('aborted', () => {
        reject(new Error(`Request aborted for ${urlString}`));
      });
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 从HTML中提取所有链接
 */
function extractLinks(html: string, baseDomain: string): Set<string> {
  const links = new Set<string>();
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];

    // 跳过锚点和javascript链接
    if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
      continue;
    }

    try {
      let fullUrl: URL;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        fullUrl = new URL(href);
      } else if (href.startsWith('/')) {
        fullUrl = new URL(`${baseDomain}${href}`);
      } else {
        fullUrl = new URL(href, baseDomain);
      }

      // 只收集相同域名的链接
      if (fullUrl.hostname === new URL(baseDomain).hostname) {
        // 移除查询参数和哈希，只保留路径
        let path = fullUrl.pathname || '/';

        // 规范化：移除尾部斜杠（根路径除外）
        if (path.length > 1 && path.endsWith('/')) {
          path = path.slice(0, -1);
        }

        // 过滤静态资源：图片、xml、css、js
        const assetExt = /\.(png|jpe?g|gif|svg|webp|ico|bmp|tiff|xml|css|js)$/i;
        if (assetExt.test(path)) {
          continue;
        }

        // 解码百分号编码，使其可读
        try {
          path = decodeURIComponent(path);
        } catch (_) {
          // 保留原值
        }

        links.add(path);
      }
    } catch (error) {
      // 忽略无效的URL
    }
  }

  return links;
}

/**
 * 自动检测正确的协议
 */
async function detectProtocol(domain: string): Promise<string> {
  // 如果已经有协议，直接返回
  if (domain.startsWith('http://') || domain.startsWith('https://')) {
    return domain.replace(/\/$/, ''); // 移除末尾的斜杠
  }

  // 移除末尾的斜杠
  domain = domain.replace(/\/$/, '');

  // 对于本地开发，优先尝试http
  const isLocalhost = domain.includes('localhost') || domain.includes('127.0.0.1');
  const urlsToTry = isLocalhost
    ? [`http://${domain}`, `https://${domain}`]
    : [`https://${domain}`, `http://${domain}`];

  for (const url of urlsToTry) {
    try {
      const response = await new Promise<boolean>((resolve) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        const options: any = {
          hostname: urlObj.hostname,
          port: urlObj.port,
          path: '/',
          method: 'HEAD',
          timeout: 5000,
          rejectUnauthorized: false
        };
        const req = protocol.request(options, (res) => {
          req.destroy();
          resolve(res.statusCode! < 400);
        });
        req.on('error', () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      });

      if (response) {
        return url;
      }
    } catch (error) {
      // 继续尝试下一个
    }
  }

  // 如果都失败，根据是否本地返回对应默认值
  return isLocalhost ? `http://${domain}` : `https://${domain}`;
}

/**
 * 在指定域名下检查路径是否可访问（HEAD）
 */
async function checkPathOnDomain(baseDomainStr: string, path: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  return new Promise((resolve) => {
    try {
      const target = new URL(`${baseDomainStr}${path}`);
      const protocol = target.protocol === 'https:' ? https : http;
      const options: any = {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: target.pathname + target.search || '/',
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Connection': 'close'
        },
        timeout: 8000,
        rejectUnauthorized: false
      };

      const req = protocol.request(options, (res) => {
        const sc = res.statusCode || 0;
        resolve({ ok: sc > 0 && sc < 400, status: sc });
      });
      req.on('error', (err: any) => resolve({ ok: false, error: String(err?.message || err) }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'timeout' });
      });
      req.end();
    } catch (err: any) {
      resolve({ ok: false, error: String(err?.message || err) });
    }
  });
}

/**
 * 爬取一个域名下的所有URL
 */
async function crawlDomain(domain: string): Promise<Set<string>> {
  const baseUrl = await detectProtocol(domain);
  const baseDomainObj = new URL(baseUrl);
  const baseDomainStr = `${baseDomainObj.protocol}//${baseDomainObj.host}`; // 使用 host 而不是 hostname 以保留端口

  const urls = new Set<string>();
  const queue: string[] = [baseDomainStr];
  const visited = new Set<string>();

  console.log(`开始爬取 ${domain}...`);

  while (queue.length > 0) {
    const currentUrl = queue.shift()!;

    if (visited.has(currentUrl)) {
      continue;
    }

    visited.add(currentUrl);
    console.log(`  [${visited.size}] 抓取: ${currentUrl}`);

    try {
      const html = await fetchPage(currentUrl);
      const links = extractLinks(html, baseDomainStr);

      for (const link of links) {
        const fullPath = link;
        urls.add(fullPath);
        const fullUrl = `${baseDomainStr}${fullPath}`;

        if (!visited.has(fullUrl)) {
          queue.push(fullUrl);
        }
      }

      // 延迟以避免过度请求
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`  ✗ 获取失败: ${currentUrl}`, (error as Error).message);
    }
  }

  console.log(`✓ ${domain} 完成，共获取 ${urls.size} 个URL\n`);
  return urls;
}

/**
 * 比较两个域名的URL差异
 */
async function compareDomains(domain1: string, domain2: string): Promise<void> {
  try {
    const [urls1, urls2] = await Promise.all([
      crawlDomain(domain1),
      crawlDomain(domain2)
    ]);

    const paths1 = Array.from(urls1).sort();
    const paths2 = Array.from(urls2).sort();

    const set1 = new Set(paths1);
    const set2 = new Set(paths2);

    // 只在domain1中存在的路径
    const onlyInDomain1 = paths1.filter(p => !set2.has(p));

    // 只在domain2中存在的路径
    const onlyInDomain2 = paths2.filter(p => !set1.has(p));

    // 两者都存在的路径
    const common = paths1.filter(p => set2.has(p));

    // 尝试用后者域名访问前者缺失路径
    const base2 = await detectProtocol(domain2);
    const base2Str = `${new URL(base2).protocol}//${new URL(base2).host}`;
    const checkResults: Array<{ path: string; ok: boolean; status?: number; error?: string }> = [];
    for (const p of onlyInDomain1) {
      const r = await checkPathOnDomain(base2Str, p);
      checkResults.push({ path: p, ok: r.ok, status: r.status, error: r.error });
      // 轻微节流，避免过快请求
      await new Promise(res => setTimeout(res, 80));
    }

    console.log('='.repeat(60));
    console.log('📊 对比结果');
    console.log('='.repeat(60));
    console.log(`\n${domain1}: ${paths1.length} 个URL`);
    console.log(`${domain2}: ${paths2.length} 个URL`);
    console.log(`共同的: ${common.length} 个URL\n`);

    if (onlyInDomain1.length > 0) {
      console.log(`\n🔴 只在 ${domain1} 存在的路径 (${onlyInDomain1.length}):`);
      onlyInDomain1.slice(0, 20).forEach(path => console.log(`  - ${path}`));
      if (onlyInDomain1.length > 20) {
        console.log(`  ... 还有 ${onlyInDomain1.length - 20} 个`);
      }
    }

    if (onlyInDomain2.length > 0) {
      console.log(`\n🔵 只在 ${domain2} 存在的路径 (${onlyInDomain2.length}):`);
      onlyInDomain2.slice(0, 20).forEach(path => console.log(`  - ${path}`));
      if (onlyInDomain2.length > 20) {
        console.log(`  ... 还有 ${onlyInDomain2.length - 20} 个`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 统计');
    console.log('='.repeat(60));
    console.log(`总差异: ${onlyInDomain1.length + onlyInDomain2.length} 个路径`);
    console.log(`相似度: ${(common.length / Math.max(paths1.length, paths2.length) * 100).toFixed(2)}%`);

    // 生成 Markdown diff 文件
    const mdLines: string[] = [];
    mdLines.push(`# 域名差异对比`);
    mdLines.push(`比较: ${domain1} vs ${domain2}`);
    mdLines.push('');
    mdLines.push('```diff');
    mdLines.push(`--- 只在 ${domain1} 的路径 (${onlyInDomain1.length})`);
    onlyInDomain1.forEach(p => mdLines.push(`- ${p}`));
    mdLines.push('');
    mdLines.push(`+++ 只在 ${domain2} 的路径 (${onlyInDomain2.length})`);
    onlyInDomain2.forEach(p => mdLines.push(`+ ${p}`));
    mdLines.push('');
    mdLines.push(`@@ 共同路径 (${common.length})`);
    common.forEach(p => mdLines.push(`  ${p}`));
    mdLines.push('```');

    // 第二个 diff 块：尝试在后者访问前者缺失路径
    mdLines.push('');
    mdLines.push('```diff');
    mdLines.push(`@@ 尝试使用后者域名访问前者缺失路径 (${onlyInDomain1.length})`);
    for (const r of checkResults) {
      const targetUrl = `${base2Str}${r.path}`;
      if (r.ok) {
        mdLines.push(`+ OK ${targetUrl} (status: ${r.status})`);
      } else {
        mdLines.push(`- Missing ${targetUrl} ${r.status ? `(status: ${r.status})` : r.error ? `(${r.error})` : ''}`);
      }
    }
    mdLines.push('```');

    const outPath = 'diff.md';
    fs.writeFileSync(outPath, mdLines.join('\n'), 'utf-8');
    console.log(`\n📝 已生成差异文件: ${outPath}`);

  } catch (error) {
    console.error('❌ 错误:', (error as Error).message);
    process.exit(1);
  }
}

// 获取命令行参数
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('使用方法:');
  console.log('  npx tsx scripts/compare-domains.ts <domain1> <domain2>');
  console.log('\n示例:');
  console.log('  npx tsx scripts/compare-domains.ts https://example.com https://example2.com');
  console.log('  npx tsx scripts/compare-domains.ts https://blog.onemue.cn http://127.0.0.1:4321');
  console.log('\n输出: 项目根目录生成 diff.md，使用diff语法展示差异');
  process.exit(1);
}

const domain1 = args[0];
const domain2 = args[1];

compareDomains(domain1, domain2);
