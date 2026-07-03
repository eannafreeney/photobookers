import "./env";
import { runStagingDatabaseSync } from "../src/domain/db/syncStagingFromProduction";

const dryRun = process.argv.includes("--dry-run");

const [error, result] = await runStagingDatabaseSync({ dryRun });
if (error) {
  console.error(error.reason);
  process.exit(1);
}

console.log(JSON.stringify(result, null, 2));
