import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

export default defineConfig({
  plugins: [solidPlugin(), solidSvg({ svgo: { enabled: false } })],
  build: {
    target: "esnext",
    assetsDir: "static",
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          kpopnet: ["kpopnet.json"],
          jqw: ["jqw", "ansi_up"],
        },
      },
    },
  },
});
