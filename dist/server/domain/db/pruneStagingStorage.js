import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { err, ok } from "../../lib/result.js";
import { withSslModeForSync } from "./syncStagingFromProduction.js";
const STAGING_BUCKET = "images";
const BOOKS_PREFIX = "books/";
const BOOK_COVERS_PREFIX = "books/covers/";
const STORAGE_DELETE_BATCH_SIZE = 100;
const DEFAULT_KEEP_BOOK_COUNT = 10;
function trim(value) {
  return value?.trim() ?? "";
}
function resolveKeepBookCount(value) {
  const count = value ?? Number(process.env.STAGING_SYNC_KEEP_BOOKS ?? DEFAULT_KEEP_BOOK_COUNT);
  if (!Number.isInteger(count) || count < 0) {
    return err({ reason: "STAGING_SYNC_KEEP_BOOKS must be a non-negative integer" });
  }
  return ok(count);
}
function resolvePruneConfig(options = {}) {
  const targetDatabaseUrl = trim(
    options.targetDatabaseUrl ?? process.env.STAGING_DATABASE_URL
  );
  const stagingSupabaseUrl = trim(
    options.stagingSupabaseUrl ?? process.env.STAGING_SUPABASE_URL
  );
  const stagingServiceRoleKey = trim(
    options.stagingServiceRoleKey ?? process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY
  );
  const keepBookCount = resolveKeepBookCount(options.keepBookCount);
  if (keepBookCount[0]) return keepBookCount;
  if (!targetDatabaseUrl) {
    return err({ reason: "Missing STAGING_DATABASE_URL" });
  }
  if (!stagingSupabaseUrl) {
    return err({ reason: "Missing STAGING_SUPABASE_URL" });
  }
  if (!stagingServiceRoleKey) {
    return err({ reason: "Missing STAGING_SUPABASE_SERVICE_ROLE_KEY" });
  }
  return ok({
    targetDatabaseUrl,
    stagingSupabaseUrl,
    stagingServiceRoleKey,
    keepBookCount: keepBookCount[1]
  });
}
function buildRetainedBookPrefixes(bookIds) {
  const retained = /* @__PURE__ */ new Set();
  for (const bookId of bookIds) {
    retained.add(`${BOOKS_PREFIX}${bookId}/`);
    retained.add(`${BOOK_COVERS_PREFIX}${bookId}/`);
  }
  return [...retained].sort();
}
function collectDeletedBookStoragePaths(existingPaths, retainedPrefixes) {
  let retainedCount = 0;
  const deletedPaths = existingPaths.filter((path) => {
    const shouldRetain = retainedPrefixes.some((prefix) => path.startsWith(prefix));
    if (shouldRetain) {
      retainedCount += 1;
    }
    return !shouldRetain;
  });
  return { retainedCount, deletedPaths };
}
async function fetchSampledBookIds(sql, keepBookCount) {
  const rows = await sql`
    with sampled_books as (
      select id
      from public.books
      where publication_status = 'published'
      order by created_at desc nulls last, id desc
      limit ${keepBookCount}
    )
    select id
    from sampled_books
    order by id asc
  `;
  return rows.map((row) => row.id);
}
async function fetchExistingBookStoragePaths(sql) {
  const rows = await sql`
    select name
    from storage.objects
    where bucket_id = ${STAGING_BUCKET}
      and name like ${`${BOOKS_PREFIX}%`}
    order by name asc
  `;
  return rows.map((row) => row.name);
}
async function deleteStoragePaths(paths, stagingSupabaseUrl, stagingServiceRoleKey) {
  if (paths.length === 0) return;
  const supabase = createClient(stagingSupabaseUrl, stagingServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  for (let i = 0; i < paths.length; i += STORAGE_DELETE_BATCH_SIZE) {
    const batch = paths.slice(i, i + STORAGE_DELETE_BATCH_SIZE);
    const { error } = await supabase.storage.from(STAGING_BUCKET).remove(batch);
    if (error) {
      throw new Error(`Failed to delete staging storage objects: ${error.message}`);
    }
  }
}
async function pruneStagingStorage(options = {}) {
  const resolved = resolvePruneConfig(options);
  if (resolved[0]) return resolved;
  const {
    targetDatabaseUrl,
    stagingSupabaseUrl,
    stagingServiceRoleKey,
    keepBookCount
  } = resolved[1];
  const sql = postgres(withSslModeForSync(targetDatabaseUrl), {
    max: 1,
    prepare: false
  });
  try {
    const sampledBookIds = await fetchSampledBookIds(sql, keepBookCount);
    const retainedPrefixes = buildRetainedBookPrefixes(sampledBookIds);
    const existingPaths = await fetchExistingBookStoragePaths(sql);
    const { retainedCount, deletedPaths } = collectDeletedBookStoragePaths(
      existingPaths,
      retainedPrefixes
    );
    if (!options.dryRun) {
      await deleteStoragePaths(
        deletedPaths,
        stagingSupabaseUrl,
        stagingServiceRoleKey
      );
    }
    return ok({
      action: options.dryRun ? "dry_run" : "pruned",
      bucket: STAGING_BUCKET,
      prefix: BOOKS_PREFIX,
      keepBookCount,
      sampledBooks: sampledBookIds.length,
      retainedPaths: retainedCount,
      scannedPaths: existingPaths.length,
      deletedPaths: deletedPaths.length
    });
  } catch (error) {
    return err({
      reason: error instanceof Error ? error.message : "Failed to prune staging storage"
    });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
export {
  buildRetainedBookPrefixes,
  collectDeletedBookStoragePaths,
  pruneStagingStorage
};
