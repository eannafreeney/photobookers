import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    devServer({
      entry: "src/index.tsx", // your Hono entry file
    }),
  ],
  build: {
    outDir: "dist/client",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/client/main.js",
      output: {
        entryFileNames: "main.js",
        assetFileNames: (assetInfo) => {
          // Extract CSS to a predictable filename
          if (assetInfo.name?.endsWith(".css")) {
            return "styles.css";
          }
          return assetInfo.name || "assets/[name].[ext]";
        },
      },
    },
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
