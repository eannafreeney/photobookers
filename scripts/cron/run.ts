/**
 * Run a production cron job without loading the Hono web app.
 *
 *   ENV=production npx tsx scripts/cron/run.ts ceo-metrics-email
 *   DRY_RUN=1 npx tsx scripts/cron/run.ts weekly-botd-newsletter
 *   DATE=2026-07-07 FORCE=1 npx tsx scripts/cron/run.ts ceo-metrics-email
 *
 * Optional env: DRY_RUN, FORCE, DATE, WEEK_START, MONTH, TO, CREATOR_ID, ALL_PREPARED
 */
import "../env";
import {
  CRON_JOB_NAMES,
  isCronJobName,
  parseCronRunnerOptionsFromEnv,
  runCronJob,
} from "../../src/jobs/cronRunners";

const jobName = process.argv[2]?.trim();

if (!jobName || jobName === "--help" || jobName === "-h") {
  console.log(`Usage: npx tsx scripts/cron/run.ts <job>

Jobs:
${CRON_JOB_NAMES.map((name) => `  - ${name}`).join("\n")}

Optional env: DRY_RUN, FORCE, DATE, WEEK_START, MONTH, TO, CREATOR_ID, USER_ID, ALL_PREPARED`);
  process.exit(jobName ? 0 : 1);
}

if (!isCronJobName(jobName)) {
  console.error(`Unknown cron job: ${jobName}`);
  console.error(`Valid jobs: ${CRON_JOB_NAMES.join(", ")}`);
  process.exit(1);
}

let options;
try {
  options = parseCronRunnerOptionsFromEnv();
} catch (error) {
  const message = error instanceof Error ? error.message : "Invalid cron options";
  console.error(message);
  process.exit(1);
}

const [error, result] = await runCronJob(jobName, options);

if (error) {
  console.error(`[${jobName}] failed:`, error.reason);
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, job: jobName, ...result }, null, 2));

const action = typeof result.action === "string" ? result.action : undefined;
if (action === "skipped") {
  process.exit(0);
}

process.exit(0);
