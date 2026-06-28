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
          admin: "src/client/admin.js",
        },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === "admin" ? "admin.js" : "main.js",
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
  };
});
