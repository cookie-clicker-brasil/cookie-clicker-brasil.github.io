import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import "dotenv/config";

export default defineConfig({
  root: "./www",
  target: 'esnext',
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
      "@scss": "/src/styles/scss",
    },
  },
  server: {
    port: 8080,
  },
});
