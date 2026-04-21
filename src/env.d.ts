/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly MP_ACCESS_TOKEN: string;
  readonly PUBLIC_MP_PUBLIC_KEY?: string;
  readonly SITE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}