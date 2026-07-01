import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(async ({ command }) => {
  const plugins = [tailwindcss()];
  if (command === "serve") {
    const { default: devServer } = await import("@hono/vite-dev-server");
    plugins.push(
      devServer({
        entry: "src/index.tsx",
      }),
    );
  }

  return {
    server: {
      host: true,
    },
    plugins,
    build: {
      outDir: "dist/client",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: "src/client/main.js",
          dashboard: "src/client/dashboard.js",
          admin: "src/client/admin.js",
        },
        output: {
          entryFileNames: (chunk) => {
            if (chunk.name === "admin") return "admin.js";
            if (chunk.name === "dashboard") return "dashboard.js";
            return "main.js";
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "styles.css";
            }
            return "assets/[name][extname]";
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
  };
});
