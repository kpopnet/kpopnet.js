import { resolve } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import solidSvg from "vite-plugin-solid-svg";

/*const svgoConfig = {
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },
  ],
};*/

export default defineConfig({
  plugins: [solidPlugin(), solidSvg({ svgo: { enabled: false } })],
  build: {
    target: "esnext",
    assetsDir: "static",
  },
  resolve: {
    alias: [
      {
        // XXX(Kagami): vite's bug
        find: "@tabler",
        replacement: resolve(__dirname, "node_modules/@tabler"),
      },
    ],
  },
});
