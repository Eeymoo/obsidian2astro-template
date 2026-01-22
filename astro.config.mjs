// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

// Get git hash from environment variable
const gitHash = process.env.VITE_GIT_HASH || 'unknown';

// https://astro.build/config
export default defineConfig({
  site: "https://blog.eeymoo.com",
  base: "/",
  integrations: [mdx(), sitemap()],

  build: {
    assets: "assets",
  },

  markdown: {
    shikiConfig: {
      theme: "monokai",
      wrap: true,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    define: {
      'import.meta.env.__version__': JSON.stringify(process.env.VITE_GIT_HASH || gitHash),
    },
  },
});
