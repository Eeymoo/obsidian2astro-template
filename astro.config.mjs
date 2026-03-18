// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import rehypeGotoLinks from "./src/plugins/rehypeGotoLinks.ts";
import rehypeZoomImages from "./src/plugins/rehypeZoomImages.ts";
import remarkWikiLinks from "./src/plugins/remarkWikiLinks.ts";
import remarkCitation from "./src/plugins/remarkCitation.ts";
import rehypeCitation from "./src/plugins/rehypeCitation.ts";
import { citationToHast } from "./src/plugins/citationToHast.ts";

// Get git hash from environment variable
const gitHash = process.env.VITE_GIT_HASH || 'unknown';

// https://astro.build/config
export default defineConfig({
  site: "https://blog.eeymoo.com",
  base: "/",
  integrations: [mdx(), sitemap(), mermaid()],

  build: {
    assets: "assets",
  },

  markdown: {
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid'],
    },
    shikiConfig: {
      // VSCode 风格双主题配置
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
    remarkPlugins: [remarkCitation, remarkWikiLinks],
    rehypePlugins: [rehypeGotoLinks, rehypeZoomImages, rehypeCitation],
    remarkRehype: {
      handlers: {
        citation: citationToHast,
      },
    },
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.__version__': JSON.stringify(process.env.VITE_GIT_HASH || gitHash),
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].${gitHash}.js`,
          chunkFileNames: `assets/[name].${gitHash}.js`,
          assetFileNames: `assets/[name].${gitHash}.[ext]`,
        },
      },
    },
  },
});
