import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export type ProjectSummaryInput = {
  rootDir: string;
  generatedAt?: Date;
};

export type RouteGroup = {
  name: string;
  description: string;
  count: number;
  examples: string[];
};

const KEY_DEPENDENCIES: Record<string, string> = {
  hono: "HTTP server framework",
  "hono-fsr": "File-system routing",
  "@hono/node-server": "Node adapter",
  "@hono/session": "Cookie sessions",
  "drizzle-orm": "Postgres ORM",
  postgres: "Postgres driver",
  "@supabase/supabase-js": "Auth + storage",
  alpinejs: "Client interactivity (web)",
  tailwindcss: "CSS utility framework",
  zod: "Schema validation",
  mjml: "Email HTML generation",
  "@react-email/components": "React email templates",
  sharp: "Image processing",
  cheerio: "HTML parsing (scrapers/imports)",
};

const KEY_CONFIG_FILES = [
  { path: "package.json", note: "Scripts and dependencies" },
  { path: "drizzle.config.ts", note: "Database migrations (Postgres via DATABASE_URL)" },
  { path: "vite.config.ts", note: "Dev server, build, path alias @/" },
  { path: "vitest.config.ts", note: "Unit test runner config" },
  { path: "featureFlags.json", note: "Runtime feature toggles" },
  { path: "CLAUDE.md", note: "Developer architecture guide" },
  { path: "src/db/schema.ts", note: "Drizzle schema (source of truth for DB)" },
  { path: "src/fs-routes.manifest.ts", note: "Generated route manifest (hono-fsr)" },
  { path: "src/jobs/cronRunners.ts", note: "Scheduled job registry" },
  { path: ".github/workflows/ci.yml", note: "Typecheck, tests, migrations on push" },
  { path: ".github/workflows/production-cron.yml", note: "Production cron schedules" },
];

const ENV_VAR_NAMES = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "SITE_URL",
  "PUBLIC_APP_URL",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
  "BREVO_API_KEY",
  "BREVO_NEWSLETTER_LIST_ID",
  "BREVO_SENDER_EMAIL",
  "BUFFER_ACCESS_TOKEN",
  "GA4_PROPERTY_ID",
  "GOOGLE_APPLICATION_CREDENTIALS_JSON",
];

const ROUTE_GROUP_RULES: Array<{
  name: string;
  description: string;
  test: (path: string) => boolean;
}> = [
  {
    name: "Public web",
    description: "Server-rendered pages for fans and discovery",
    test: (p) =>
      !p.startsWith("/api/") &&
      !p.startsWith("/auth/") &&
      !p.startsWith("/dashboard/") &&
      !p.startsWith("/hyperview/") &&
      !p.startsWith("/jobs/") &&
      !p.startsWith("/claims/"),
  },
  {
    name: "API",
    description: "JSON/partials for likes, comments, follows, newsletter, activity",
    test: (p) => p.startsWith("/api/"),
  },
  {
    name: "Auth",
    description: "Login, registration, password reset, Supabase callback",
    test: (p) => p.startsWith("/auth/"),
  },
  {
    name: "Dashboard",
    description: "Creator and admin dashboards",
    test: (p) => p.startsWith("/dashboard/"),
  },
  {
    name: "Hyperview (mobile)",
    description: "XML routes consumed by the Expo mobile app",
    test: (p) => p.startsWith("/hyperview/"),
  },
  {
    name: "Jobs / cron HTTP",
    description: "Authenticated cron endpoints hit by GitHub Actions",
    test: (p) => p.startsWith("/jobs/"),
  },
  {
    name: "Claims",
    description: "Creator account claim flow",
    test: (p) => p.startsWith("/claims/"),
  },
];

export function extractUrlPaths(manifestSource: string): string[] {
  const paths = new Set<string>();
  for (const match of manifestSource.matchAll(/urlPath:\s*"([^"]+)"/g)) {
    paths.add(match[1]);
  }
  return [...paths].sort();
}

export function groupRoutes(urlPaths: string[]): RouteGroup[] {
  const assigned = new Set<string>();

  const groups = ROUTE_GROUP_RULES.map(({ name, description, test }) => {
    const matched = urlPaths.filter((p) => test(p));
    matched.forEach((p) => assigned.add(p));
    return {
      name,
      description,
      count: matched.length,
      examples: pickExamples(matched, 12),
    };
  }).filter((g) => g.count > 0);

  const other = urlPaths.filter((p) => !assigned.has(p));
  if (other.length > 0) {
    groups.push({
      name: "Other",
      description: "Miscellaneous routes",
      count: other.length,
      examples: pickExamples(other, 8),
    });
  }

  return groups;
}

function pickExamples(paths: string[], max: number): string[] {
  if (paths.length <= max) return paths;

  const staticPaths = paths.filter((p) => !p.includes("["));
  const dynamicPaths = paths.filter((p) => p.includes("["));
  const picked = [...staticPaths.slice(0, max - 2), ...dynamicPaths.slice(0, 2)];
  return picked.slice(0, max);
}

export function extractSchemaSummary(schemaSource: string): {
  tables: string[];
  enums: string[];
} {
  const tables = [
    ...schemaSource.matchAll(/pgTable\(\s*"([^"]+)"/g),
  ].map((m) => m[1]);
  const enums = [
    ...schemaSource.matchAll(/pgEnum\(\s*"([^"]+)"/g),
  ].map((m) => m[1]);
  return { tables, enums };
}

export function extractCronJobNames(cronSource: string): string[] {
  const block = cronSource.match(
    /export const CRON_JOB_NAMES = \[([\s\S]*?)\]\s*(?:as const)?/,
  );
  if (!block) return [];
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

function readText(rootDir: string, filePath: string): string | null {
  try {
    return readFileSync(join(rootDir, filePath), "utf8");
  } catch {
    return null;
  }
}

function listTopLevelDirs(rootDir: string, relativePath: string): string[] {
  const full = join(rootDir, relativePath);
  try {
    return readdirSync(full)
      .filter((name) => statSync(join(full, name)).isDirectory())
      .sort();
  } catch {
    return [];
  }
}

function summarizeDependencies(packageJson: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}): string[] {
  const lines: string[] = [];
  const deps = packageJson.dependencies ?? {};

  for (const [pkg, note] of Object.entries(KEY_DEPENDENCIES)) {
    if (deps[pkg]) {
      lines.push(`- ${pkg} (${deps[pkg]}): ${note}`);
    }
  }

  const otherRuntime = Object.keys(deps)
    .filter((d) => !(d in KEY_DEPENDENCIES))
    .sort();
  if (otherRuntime.length > 0) {
    lines.push(
      `- Other runtime deps (${otherRuntime.length}): ${otherRuntime.slice(0, 15).join(", ")}${otherRuntime.length > 15 ? ", …" : ""}`,
    );
  }

  return lines;
}

function formatSection(title: string, body: string): string {
  const rule = "=".repeat(Math.min(title.length + 4, 72));
  return `${rule}\n${title.toUpperCase()}\n${rule}\n\n${body.trim()}\n`;
}

function stripMarkdownForSummary(markdown: string, maxChars = 4000): string {
  const trimmed = markdown
    .replace(/^#+\s+/gm, "")
    .replace(/```[\s\S]*?```/g, "[code block omitted]")
    .replace(/\*\*/g, "")
    .replace(/\|[^\n]+\|/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars).trimEnd()}…\n\n[truncated]`;
}

function extractClaudeGuideExcerpt(claudeMd: string): string {
  const sections = [
    "Project Overview",
    "Architecture",
    "Domain layer",
    "Feature modules",
    "Routing",
    "Rendering patterns",
    "Auth & middleware",
  ];
  const parts: string[] = [];
  for (const heading of sections) {
    const re = new RegExp(
      `## ${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`,
    );
    const match = claudeMd.match(re);
    if (match) {
      parts.push(`### ${heading}\n${stripMarkdownForSummary(match[1], 1200)}`);
    }
  }
  return parts.join("\n\n");
}

export function generateProjectSummary({
  rootDir,
  generatedAt = new Date(),
}: ProjectSummaryInput): string {
  const pkg = JSON.parse(readText(rootDir, "package.json") ?? "{}") as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  const manifest = readText(rootDir, "src/fs-routes.manifest.ts") ?? "";
  const schema = readText(rootDir, "src/db/schema.ts") ?? "";
  const cronRunners = readText(rootDir, "src/jobs/cronRunners.ts") ?? "";
  const readme = readText(rootDir, "README.md") ?? "(no README)";
  const claudeMd = readText(rootDir, "CLAUDE.md") ?? "";
  const roadmap =
    readText(rootDir, "docs/project-context/ROADMAP.md") ??
    "(docs/project-context/ROADMAP.md not found — add priorities there)";
  const limitations =
    readText(rootDir, "docs/project-context/LIMITATIONS.md") ??
    "(docs/project-context/LIMITATIONS.md not found)";

  const featureFlagsRaw = readText(rootDir, "featureFlags.json");
  let featureFlags = featureFlagsRaw;
  if (featureFlagsRaw) {
    try {
      featureFlags = JSON.stringify(JSON.parse(featureFlagsRaw), null, 2);
    } catch {
      // keep raw
    }
  }

  const urlPaths = extractUrlPaths(manifest);
  const routeGroups = groupRoutes(urlPaths);
  const { tables, enums } = extractSchemaSummary(schema);
  const cronJobs = extractCronJobNames(cronRunners);
  const domainModules = listTopLevelDirs(rootDir, "src/domain");
  const featureModules = listTopLevelDirs(rootDir, "src/features");

  const sections: string[] = [];

  sections.push(
    formatSection(
      "About this document",
      `Machine-readable project summary for LLMs and external tooling.
Generated: ${generatedAt.toISOString()}
Source repo path: ${relative(process.cwd(), rootDir) || "."}
Endpoint: GET /api/project-summary.txt

This file summarizes architecture and structure — not application source code.
Edit docs/project-context/*.md for roadmap and limitations; re-run generation to refresh extracted data.`,
    ),
  );

  sections.push(
    formatSection(
      "Project purpose & core features",
      `Photobookers is a full-stack TypeScript platform for discovering photobooks and supporting creators (artists and publishers).

Core product areas:
- Discovery: featured books, search, tags, editorial spotlights (book of the day, artist/publisher of the week)
- Creators: profiles, social links, book catalogs, verification and claim flows
- Fans: library/collections, wishlists, likes, follows, feed, newsletter signup
- Creator dashboard: book CRUD, image uploads, import CSV, analytics, messages
- Admin dashboard: moderation (books, creators, fairs, stores), user management, planner (newsletter + Instagram + spotlight emails)
- Book fairs & bookstores: listings, attendee registration, map views
- Interviews: token-based creator interviews (feature-flagged)
- Mobile: separate Expo app using Hyperview XML routes under /hyperview/
- Background jobs: email digests, milestone emails, stub outreach, Instagram queue, CEO metrics`,
    ),
  );

  sections.push(
    formatSection(
      "Tech stack & key libraries",
      `Runtime: Node 20+, TypeScript, ESM
Server: Hono on Node (@hono/node-server)
Web UI: Hono JSX (hono/jsx) + Tailwind CSS 4 + Alpine.js + alpine-ajax
Mobile API: Hyperview XML (src/fs-routes/hyperview/)
Database: PostgreSQL via Drizzle ORM
Auth: Supabase Auth + @hono/session cookies
Email: MJML / React Email, Brevo for newsletter
Images: Supabase storage + sharp
Deploy: Render (inferred from CI/migrate workflow); cron via GitHub Actions

Key dependencies:
${summarizeDependencies(pkg).join("\n")}

Dev tooling: Vite, Vitest, Playwright, ESLint, drizzle-kit, hono-fsr route generator`,
    ),
  );

  sections.push(
    formatSection(
      "High-level architecture",
      `src/
  index.tsx, server.ts     — Hono app entry
  routes/                  — session/auth middleware, router mount
  fs-routes/               — file-system routes (pages + handlers)
  fs-routes.manifest.ts    — GENERATED route registry
  domain/                  — shared business logic (multi-surface)
  features/                — surface-specific UI and services
  components/              — shared layouts and UI primitives
  client/                  — Alpine.js bundles (main.js, admin.js)
  db/                      — Drizzle schema
  jobs/                    — cron runner registry
  middleware/              — auth guards
  lib/                     — shared utilities

Domain modules (${domainModules.length}): ${domainModules.join(", ")}

Feature modules (${featureModules.length}): ${featureModules.join(", ")}

Import rule: public (app) and hyperview routes must import shared logic from src/domain/, not admin features (enforced by npm run lint).

${extractClaudeGuideExcerpt(claudeMd)}`,
    ),
  );

  sections.push(
    formatSection(
      "Current limitations & pain points",
      stripMarkdownForSummary(limitations, 6000),
    ),
  );

  sections.push(
    formatSection(
      "Roadmap & next priorities",
      stripMarkdownForSummary(roadmap, 6000),
    ),
  );

  const routeLines = routeGroups.map(
    (g) =>
      `${g.name} (${g.count} routes) — ${g.description}\n  Examples: ${g.examples.join(", ")}`,
  );
  sections.push(
    formatSection(
      "Route / endpoint structure",
      `Total registered routes: ${urlPaths.length}
Routing: hono-fsr file-system routes in src/fs-routes/

${routeLines.join("\n\n")}

Public JSON/HTML API endpoints (sample):
${urlPaths
  .filter((p) => p.startsWith("/api/"))
  .slice(0, 20)
  .map((p) => `- ${p}`)
  .join("\n")}`,
    ),
  );

  sections.push(
    formatSection(
      "Database schema",
      `ORM: Drizzle (src/db/schema.ts)
Dialect: PostgreSQL

Tables (${tables.length}):
${tables.map((t) => `- ${t}`).join("\n")}

Enums (${enums.length}):
${enums.map((e) => `- ${e}`).join("\n")}`,
    ),
  );

  sections.push(
    formatSection(
      "Background jobs (cron)",
      cronJobs.length
        ? cronJobs.map((j) => `- ${j}`).join("\n")
        : "(could not parse CRON_JOB_NAMES)",
    ),
  );

  sections.push(
    formatSection(
      "Feature flags",
      featureFlags ?? "(featureFlags.json not found)",
    ),
  );

  const configLines = KEY_CONFIG_FILES.map(({ path, note }) => {
    const exists = readText(rootDir, path) !== null;
    return `- ${path}${exists ? "" : " (missing)"}: ${note}`;
  });
  sections.push(
    formatSection(
      "Key configuration files",
      `${configLines.join("\n")}

Environment variables (names only — never commit values):
${ENV_VAR_NAMES.map((v) => `- ${v}`).join("\n")}`,
    ),
  );

  sections.push(
    formatSection(
      "README",
      stripMarkdownForSummary(readme, 2000),
    ),
  );

  return `${sections.join("\n")}\n`;
}

export const PROJECT_SUMMARY_OUTPUT = "public/project-summary.txt";

export function projectSummaryOutputPath(rootDir: string): string {
  return join(rootDir, PROJECT_SUMMARY_OUTPUT);
}
