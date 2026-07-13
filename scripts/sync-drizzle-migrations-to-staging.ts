/**
 * Copy drizzle.__drizzle_migrations from production to staging.
 *
 * Staging's weekly public-schema sync brings over migrated tables/columns but used to
 * leave migration history behind, so `npm run db:migrate` would re-apply old migrations.
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
