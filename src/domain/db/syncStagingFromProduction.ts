import { spawn } from "node:child_process";
import { err, ok, type Result } from "../../lib/result";

type SyncError = { reason: string };

export type StagingDatabaseSyncResult =
  | {
      action: "dry_run";
      sourceHost: string;
      targetHost: string;
      schema: string;
    }
  | {
      action: "synced";
      sourceHost: string;
      targetHost: string;
      schema: string;
      durationMs: number;
    };

export type RunStagingDatabaseSyncOptions = {
  dryRun?: boolean;
  sourceDatabaseUrl?: string;
  targetDatabaseUrl?: string;
};

const PUBLIC_SCHEMA = "public";

type ParsedDatabaseUrl = {
  host: string;
  port: string;
  database: string;
  usesPgBouncer: boolean;
};

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

function resolveSyncDatabaseUrls(options: RunStagingDatabaseSyncOptions = {}): Result<
  { sourceUrl: string; targetUrl: string },
  SyncError
> {
  const sourceUrl =
    options.sourceDatabaseUrl ??
    process.env.PRODUCTION_DATABASE_URL ??
    process.env.DATABASE_URL;
  const targetUrl = options.targetDatabaseUrl ?? process.env.STAGING_DATABASE_URL;

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

function runStagingDatabasePipe(
  sourceUrl: string,
  targetUrl: string,
): Promise<{ durationMs: number }> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const dump = spawn(
      "pg_dump",
      [
        sourceUrl,
        `--schema=${PUBLIC_SCHEMA}`,
        "--no-owner",
        "--no-acl",
        "--clean",
        "--if-exists",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    const restore = spawn(
      "psql",
      [targetUrl, "--single-transaction", "-v", "ON_ERROR_STOP=1"],
      { stdio: ["pipe", "pipe", "pipe"] },
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
      schema: PUBLIC_SCHEMA,
    });
  }

  if (process.env.ALLOW_STAGING_DB_SYNC !== "true") {
    return err({
      reason: "Set ALLOW_STAGING_DB_SYNC=true to run a staging database sync",
    });
  }

  const hasPgDump = await commandExists("pg_dump");
  const hasPsql = await commandExists("psql");
  if (!hasPgDump || !hasPsql) {
    return err({
      reason: "pg_dump and psql must be installed on the host running this job",
    });
  }

  try {
    const { durationMs } = await runStagingDatabasePipe(sourceUrl, targetUrl);
    return ok({
      action: "synced",
      sourceHost: source.host,
      targetHost: target.host,
      schema: PUBLIC_SCHEMA,
      durationMs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Staging sync failed";
    return err({ reason: message });
  }
}
