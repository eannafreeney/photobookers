/**
 * Copy drizzle.__drizzle_migrations from production to staging.
 *
 * Use only after a schema dump that did not include the drizzle schema.
 * Do not run this before `db:migrate` — it marks production-applied SQL as
 * done on staging without executing it (e.g. 0079 skipped the table rename).
 *
 * The weekly staging sync already copies public + drizzle together.
 */
import "./env";
import { syncDrizzleMigrationHistoryFromProduction } from "../src/domain/db/syncStagingFromProduction";

const [error, result] = await syncDrizzleMigrationHistoryFromProduction();
if (error) {
  console.error(error.reason);
  process.exit(1);
}

console.log(
  `Synced ${result?.copied ?? 0} Drizzle migration rows from production to staging`,
);
