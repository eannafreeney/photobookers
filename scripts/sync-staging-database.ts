import "./env";
import { pruneStagingStorage } from "../src/domain/db/pruneStagingStorage";
import { runStagingDatabaseSync } from "../src/domain/db/syncStagingFromProduction";

const dryRun = process.argv.includes("--dry-run");

const [syncError, syncResult] = await runStagingDatabaseSync({ dryRun });
if (syncError) {
  console.error(syncError.reason);
  process.exit(1);
}

const [pruneError, pruneResult] = await pruneStagingStorage({ dryRun });
if (pruneError) {
  console.error(pruneError.reason);
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      databaseSync: syncResult,
      storagePrune: pruneResult,
    },
    null,
    2,
  ),
);
