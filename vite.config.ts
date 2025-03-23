import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import "dotenv/config";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  root: "./www",
  publicDir: "./public",
  build: {
    outDir: "../build",
    minify: false,
    emptyOutDir: false,
  },
  plugins: [
    babel({
      babelConfig: {
        presets: ["@babel/preset-env"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@lang": "/src/locales/lang",
      "@language": "/src/locales",
      "@plugin": "/src/plugins",
      "@ts": "/src/ts",
      "@js": "/src/js",
      "@scss": "/src/styles/scss",
    },
  },
  server: {
    host: process.env.VITE_WEB_HOST,
    port: +process.env.VITE_WEB_PORT!,
    cors: true,
    allowedHosts:["beatles-wooden-asian-hypothesis.trycloudflare.com"]
  },
});
