/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    Capacitor: typeof import("@capacitor/core").Capacitor;
  }
}

interface ImportMetaEnv {
  readonly VITE_SOCKET_URL: string;
  readonly VITE_WEB_HOST: string;
  readonly VITE_WEB_PORT: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
