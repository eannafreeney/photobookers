import * as esbuild from "esbuild";
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const outDir = path.join(root, "dist/server");

function collectSourceFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry) && !/\.(test|spec)\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function collectJsFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
      continue;
    }
    if (entry.endsWith(".js")) files.push(fullPath);
  }
  return files;
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function hasKnownExtension(spec) {
  return /\.(js|json|node|mjs|cjs)$/i.test(spec);
}

function resolveRelativeImport(fromFile, spec) {
  if (hasKnownExtension(spec)) return spec;
  const base = path.resolve(path.dirname(fromFile), spec);
  if (existsSync(`${base}.js`)) return `${spec}.js`;
  if (existsSync(path.join(base, "index.js"))) return `${spec}/index.js`;
  return `${spec}.js`;
}

function resolveAliasImport(fromFile, importPath) {
  const base = path.join(outDir, importPath);
  let rel = toPosix(path.relative(path.dirname(fromFile), base));
  if (!rel.startsWith(".")) rel = `./${rel}`;
  if (hasKnownExtension(importPath)) return rel;
  if (existsSync(`${base}.js`)) return `${rel}.js`;
  if (existsSync(path.join(base, "index.js"))) return `${rel}/index.js`;
  return `${rel}.js`;
}

function fixImports(filePath, source) {
  const fixSpec = (spec) => {
    if (spec.startsWith("@/")) return resolveAliasImport(filePath, spec.slice(2));
    if (spec.startsWith("./") || spec.startsWith("../")) {
      return resolveRelativeImport(filePath, spec);
    }
    return spec;
  };

  return source
    .replace(
      /from (["'])(\.\.?\/[^"']+|@\/[^"']+)\1/g,
      (_, quote, spec) => `from ${quote}${fixSpec(spec)}${quote}`,
    )
    .replace(
      /import\((["'])(\.\.?\/[^"']+|@\/[^"']+)\1\)/g,
      (_, quote, spec) => `import(${quote}${fixSpec(spec)}${quote})`,
    )
    .replace(
      /export(\s+[^'";]+?\s+from\s+)(["'])(\.\.?\/[^"']+|@\/[^"']+)\2/g,
      (_, prefix, quote, spec) =>
        `export${prefix}${quote}${fixSpec(spec)}${quote}`,
    )
    .replace(
      /from (["'])(\.\.?\/[^"']+\.json|@\/[^"']+\.json)\1(?!\s+with)/g,
      (_, quote, spec) =>
        `from ${quote}${fixSpec(spec)}${quote} with { type: "json" }`,
    );
}

const pathAliasPlugin = {
  name: "path-alias",
  setup(build) {
    build.onResolve({ filter: /^@\// }, (args) => ({
      path: path.join(srcDir, args.path.slice(2)),
    }));
  },
};

const entryPoints = collectSourceFiles(srcDir);

await esbuild.build({
  entryPoints,
  bundle: false,
  platform: "node",
  target: "node20",
  format: "esm",
  outbase: srcDir,
  outdir: outDir,
  packages: "external",
  jsx: "automatic",
  jsxImportSource: "hono/jsx",
  plugins: [pathAliasPlugin],
  logLevel: "info",
});

for (const file of collectJsFiles(outDir)) {
  const source = readFileSync(file, "utf8");
  writeFileSync(file, fixImports(file, source));
}

copyFileSync(
  path.join(root, "featureFlags.json"),
  path.join(root, "dist/featureFlags.json"),
);

console.log(
  `Transpiled ${entryPoints.length} files to dist/server/ (entry: dist/server/server.js)`,
);
