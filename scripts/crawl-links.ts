#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

type Options = {
  output: string;
  maxPages: number;
  timeoutMs: number;
};

const [, , startUrl, ...restArgs] = process.argv;

if (!startUrl) {
  console.error("Usage: npx tsx scripts/crawl-links.ts <start-url> [--output broken.txt] [--max-pages 1000] [--timeout-ms 15000]");
  process.exit(1);
}

// Very small CLI parser
const options: Options = {
  output: "broken-links.txt",
  maxPages: 1000,
  timeoutMs: 15000,
};

for (let i = 0; i < restArgs.length; i += 1) {
  const arg = restArgs[i];
  if (arg === "--output" && restArgs[i + 1]) {
    options.output = restArgs[i + 1];
    i += 1;
  } else if (arg === "--max-pages" && restArgs[i + 1]) {
    options.maxPages = Number(restArgs[i + 1]);
    i += 1;
  } else if (arg === "--timeout-ms" && restArgs[i + 1]) {
    options.timeoutMs = Number(restArgs[i + 1]);
    i += 1;
  }
}

const origin = new URL(startUrl).origin;
const toVisit: string[] = [startUrl];
const seen = new Set<string>([normalizeUrl(startUrl)]);
const broken: string[] = [];

void (async () => {
  let processed = 0;
  while (toVisit.length && processed < options.maxPages) {
    const current = toVisit.shift();
    if (!current) break;

    processed += 1;
    try {
      const html = await fetchWithTimeout(current, options.timeoutMs);
      const links = extractLinks(html, current);
      for (const link of links) {
        if (!link.startsWith(origin)) continue; // stay within the same site
        const normalized = normalizeUrl(link);
        if (!seen.has(normalized)) {
          seen.add(normalized);
          toVisit.push(link);
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      broken.push(`${current} -> ${reason}`);
      console.error(`Broken: ${current} (${reason})`);
    }
  }

  const content = broken.length ? `${broken.join("\n")}\n` : "No broken links found.\n";
  await writeFile(options.output, content, "utf8");

  console.log(`Visited: ${seen.size} pages (capped at ${options.maxPages}).`);
  console.log(`Broken links: ${broken.length}. Written to ${options.output}`);
})();

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeout = delay(timeoutMs).then(() => null);
  const response = await Promise.race<(Response | null)>([
    fetch(url, { signal: controller.signal }),
    timeout,
  ]);

  if (!response) {
    throw new Error("No response");
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    return ""; // skip non-HTML bodies
  }

  return response.text();
}

function extractLinks(html: string, baseUrl: string): string[] {
  if (!html) return [];
  const links: string[] = [];
  const hrefRegex = /href\s*=\s*['"]([^'"#]+)['"]/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    try {
      const resolved = new URL(href, baseUrl).toString();
      if (resolved.startsWith("http")) {
        links.push(resolved);
      }
    } catch (_) {
      // ignore malformed URLs
    }
  }
  return links;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = ""; // ignore fragments
    if (u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch (_) {
    return url;
  }
}