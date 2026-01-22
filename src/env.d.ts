/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly __version__: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  const __version__: string;
}