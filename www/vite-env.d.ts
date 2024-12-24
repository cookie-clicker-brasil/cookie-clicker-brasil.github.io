/// <reference types="vite/client" />

export {};

declare global {
  interface Window {
    Capacitor: typeof import("@capacitor/core").Capacitor;
  }
}
