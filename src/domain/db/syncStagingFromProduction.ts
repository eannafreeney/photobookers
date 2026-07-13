import { spawn } from "node:child_process";
import postgres from "postgres";
import { err, ok, type Result } from "../../lib/result";

type SyncError = { reason: string };

export type StagingDatabaseSyncResult =
  | {
      action: "dry_run";
      sourceHost: string;
      targetHost: string;
      schemas: readonly string[];
    }
  | {
      action: "synced";
      sourceHost: string;
      targetHost: string;
      schemas: readonly string[];
      durationMs: number;
    };

export type RunStagingDatabaseSyncOptions = {
  dryRun?: boolean;
  sourceDatabaseUrl?: string;
  targetDatabaseUrl?: string;
};

const PUBLIC_SCHEMA = "public";
const DRIZZLE_SCHEMA = "drizzle";
/** Staging sync must include drizzle so __drizzle_migrations matches the copied public schema. */
export const STAGING_SYNC_SCHEMAS = [PUBLIC_SCHEMA, DRIZZLE_SCHEMA] as const;
const PG_DUMP = process.env.PG_DUMP_PATH ?? "pg_dump";
const PSQL = process.env.PSQL_PATH ?? "psql";

type ParsedDatabaseUrl = {
  host: string;
  port: string;
  database: string;
  usesPgBouncer: boolean;
};

/** Supabase and most hosted Postgres require SSL from external hosts (e.g. GitHub Actions). */
export function withSslModeForSync(connectionString: string): string {
  const normalized = connectionString.replace(/^postgres:\/\//, "postgresql://");
  const parsed = new URL(normalized);
  if (!parsed.searchParams.has("sslmode")) {
    parsed.searchParams.set("sslmode", "require");
  }
  return parsed.toString();
}

/** Normalize postgres:// for URL parsing and compare connection targets safely. */
export function parseDatabaseUrlForSync(connectionString: string): ParsedDatabaseUrl {
  const normalized = connectionString.replace(/^postgres:\/\//, "postgresql://");
  const parsed = new URL(normalized);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, "") || "postgres");

  return {
    host: parsed.hostname,
    port: parsed.port || "5432",
    database,
    usesPgBouncer:
      parsed.port === "6543" ||
      parsed.searchParams.get("pgbouncer") === "true",
  };
}

export function assertSafeStagingSyncConfig(
  sourceUrl: string,
  targetUrl: string,
): Result<void, SyncError> {
  let source: ParsedDatabaseUrl;
  let target: ParsedDatabaseUrl;
  try {
    source = parseDatabaseUrlForSync(sourceUrl);
    target = parseDatabaseUrlForSync(targetUrl);
  } catch {
    return err({ reason: "Invalid database URL" });
  }

  if (
    source.host === target.host &&
    source.port === target.port &&
    source.database === target.database
  ) {
    return err({
      reason: "Source and target database URLs must point to different databases",
    });
  }

  for (const [label, config] of [
    ["source", source],
    ["target", target],
  ] as const) {
    if (config.usesPgBouncer) {
      return err({
        reason: `${label} URL uses Supabase transaction pooler; use a direct connection on port 5432`,
      });
    }
  }

  return ok(undefined);
}

function trimUrl(url: string): string {
  return url.trim();
}

/** Redact credentials before surfacing pg errors in CI logs. */
export function redactDatabaseUrl(connectionString: string): string {
  try {
    const parsed = new URL(connectionString.replace(/^postgres:\/\//, "postgresql://"));
    if (parsed.password) parsed.password = "***";
    if (parsed.username) parsed.username = "***";
    return parsed.toString();
  } catch {
    return "[invalid database url]";
  }
}

function sanitizePgMessage(message: string, sourceUrl: string, targetUrl: string): string {
  return [sourceUrl, targetUrl].reduce(
    (text, url) => text.split(url).join(redactDatabaseUrl(url)),
    message,
  );
}

function resolveSyncDatabaseUrls(options: RunStagingDatabaseSyncOptions = {}): Result<
  { sourceUrl: string; targetUrl: string },
  SyncError
> {
  const sourceUrl = trimUrl(
    options.sourceDatabaseUrl ??
      process.env.PRODUCTION_DATABASE_URL ??
      process.env.DATABASE_URL ??
      "",
  );
  const targetUrl = trimUrl(
    options.targetDatabaseUrl ?? process.env.STAGING_DATABASE_URL ?? "",
  );

  if (!sourceUrl) {
    return err({
      reason: "Missing source database URL (set PRODUCTION_DATABASE_URL or DATABASE_URL)",
    });
  }
  if (!targetUrl) {
    return err({ reason: "Missing STAGING_DATABASE_URL" });
  }

  const safety = assertSafeStagingSyncConfig(sourceUrl, targetUrl);
  if (safety[0]) return safety;

  return ok({ sourceUrl, targetUrl });
}

async function commandExists(command: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", `command -v ${command}`], {
      stdio: "ignore",
    });
    child.on("close", (code) => resolve(code === 0));
    child.on("error", () => resolve(false));
  });
}

async function testDatabaseConnection(
  label: string,
  connectionUrl: string,
): Promise<Result<void, SyncError>> {
  return new Promise((resolve) => {
    const child = spawn(PSQL, ["-d", connectionUrl, "-c", "SELECT 1"], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PGSSLMODE: "require" },
    });

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(ok(undefined));
        return;
      }
      resolve(
        err({
          reason: `${label} connection failed: ${
            stderr.trim() || `psql exited with code ${code ?? "unknown"}`
          }. Use Supabase Session pooler URL (port 5432, not 6543) if connecting from GitHub Actions.`,
        }),
      );
    });
    child.on("error", () => {
      resolve(err({ reason: `${label} connection failed: psql not available` }));
    });
  });
}

const pgChildEnv = {
  ...process.env,
  PGSSLMODE: "require",
};

type DrizzleMigrationRow = {
  id: number;
  hash: string;
  created_at: number;
};

export async function syncDrizzleMigrationHistoryFromProduction(
  options: RunStagingDatabaseSyncOptions = {},
): Promise<Result<{ copied: number }, SyncError>> {
  const resolved = resolveSyncDatabaseUrls(options);
  if (resolved[0]) return resolved;

  const { sourceUrl, targetUrl } = resolved[1];
  const source = postgres(withSslModeForSync(sourceUrl), { max: 1 });
  const target = postgres(withSslModeForSync(targetUrl), { max: 1 });

  try {
    const rows = await source<DrizzleMigrationRow[]>`
      SELECT id, hash, created_at
      FROM drizzle.__drizzle_migrations
      ORDER BY id
    `;

    await target`CREATE SCHEMA IF NOT EXISTS drizzle`;
    await target`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;
    await target`TRUNCATE drizzle.__drizzle_migrations`;
    for (const row of rows) {
      await target`
        INSERT INTO drizzle.__drizzle_migrations (id, hash, created_at)
        VALUES (${row.id}, ${row.hash}, ${row.created_at})
      `;
    }
    if (rows.length > 0) {
      await target`
        SELECT setval(
          pg_get_serial_sequence('drizzle.__drizzle_migrations', 'id'),
          (SELECT COALESCE(MAX(id), 1) FROM drizzle.__drizzle_migrations)
        )
      `;
    }

    return ok({ copied: rows.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync Drizzle migrations";
    return err({
      reason: sanitizePgMessage(message, sourceUrl, targetUrl),
    });
  } finally {
    await source.end();
    await target.end();
  }
}

function runStagingDatabasePipe(
  sourceUrl: string,
  targetUrl: string,
): Promise<{ durationMs: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const dump = spawn(
      PG_DUMP,
      [
        "-d",
        sourceUrl,
        ...STAGING_SYNC_SCHEMAS.flatMap((schema) => [`--schema=${schema}`]),
        "--no-owner",
        "--no-acl",
        "--clean",
        "--if-exists",
      ],
      { stdio: ["ignore", "pipe", "pipe"], env: pgChildEnv },
    );

    const restore = spawn(
      PSQL,
      ["-d", targetUrl, "--single-transaction", "-v", "ON_ERROR_STOP=1"],
      { stdio: ["pipe", "pipe", "pipe"], env: pgChildEnv },
    );

    let dumpError = "";
    let restoreError = "";

    dump.stderr.on("data", (chunk: Buffer) => {
      dumpError += chunk.toString();
    });
    restore.stderr.on("data", (chunk: Buffer) => {
      restoreError += chunk.toString();
    });

    dump.stdout.pipe(restore.stdin);

    dump.on("error", (error) => {
      restore.kill();
      reject(error);
    });
    restore.on("error", (error) => {
      dump.kill();
      reject(error);
    });

    dump.on("close", (code) => {
      if (code !== 0) {
        restore.kill();
        reject(
          new Error(
            dumpError.trim() || `pg_dump exited with code ${code ?? "unknown"}`,
          ),
        );
        return;
      }
      restore.stdin.end();
    });

    restore.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            restoreError.trim() || `psql exited with code ${code ?? "unknown"}`,
          ),
        );
        return;
      }
      resolve({ durationMs: Date.now() - startedAt });
    });
  });
}

export async function runStagingDatabaseSync(
  options: RunStagingDatabaseSyncOptions = {},
): Promise<Result<StagingDatabaseSyncResult, SyncError>> {
  const resolved = resolveSyncDatabaseUrls(options);
  if (resolved[0]) return resolved;

  const { sourceUrl, targetUrl } = resolved[1];
  const source = parseDatabaseUrlForSync(sourceUrl);
  const target = parseDatabaseUrlForSync(targetUrl);

  if (options.dryRun) {
    return ok({
      action: "dry_run",
      sourceHost: source.host,
      targetHost: target.host,
      schemas: STAGING_SYNC_SCHEMAS,
    });
  }

  if (process.env.ALLOW_STAGING_DB_SYNC !== "true") {
    return err({
      reason: "Set ALLOW_STAGING_DB_SYNC=true to run a staging database sync",
    });
  }

  const hasPgDump = await commandExists(PG_DUMP);
  const hasPsql = await commandExists(PSQL);
  if (!hasPgDump || !hasPsql) {
    return err({
      reason: `${PG_DUMP} and ${PSQL} must be installed on the host running this job`,
    });
  }

  const sslSourceUrl = withSslModeForSync(sourceUrl);
  const sslTargetUrl = withSslModeForSync(targetUrl);

  const sourceConn = await testDatabaseConnection("Production", sslSourceUrl);
  if (sourceConn[0]) return sourceConn;
  const targetConn = await testDatabaseConnection("Staging", sslTargetUrl);
  if (targetConn[0]) return targetConn;

  try {
    const { durationMs } = await runStagingDatabasePipe(sslSourceUrl, sslTargetUrl);
    return ok({
      action: "synced",
      sourceHost: source.host,
      targetHost: target.host,
      schemas: STAGING_SYNC_SCHEMAS,
      durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Staging sync failed";
    return err({
      reason: sanitizePgMessage(message, sslSourceUrl, sslTargetUrl),
    });
  }
}
