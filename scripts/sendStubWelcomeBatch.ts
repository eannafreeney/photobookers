import "./env";
import { client } from "../src/db/client";
import {
  countWelcomeEmailsSentOnDate,
  loadEligibleStubs,
  resolveDailyWelcomeLimit,
} from "../src/features/stub-outreach/services";
import { sendStubWelcomeEmail } from "../src/features/stub-outreach/welcomeEmail";

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const OVERRIDE_TO =
  process.argv.find((arg) => arg.startsWith("--to="))?.split("=")[1]?.trim() ??
  "";
const dailyLimitArg = process.argv.find((arg) => arg.startsWith("--daily-limit="));
const dailyLimit = dailyLimitArg
  ? Number(dailyLimitArg.split("=")[1])
  : resolveDailyWelcomeLimit();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (dailyLimit === undefined || Number.isNaN(dailyLimit) || dailyLimit <= 0) {
    throw new Error(
      "Daily limit required. Pass --daily-limit=300 or set STUB_OUTREACH_DAILY_WELCOME_LIMIT.",
    );
  }

  const runDate = new Date();
  const sentToday = await countWelcomeEmailsSentOnDate(runDate);
  const remainingToday = Math.max(0, dailyLimit - sentToday);

  const [loadError, eligible] = await loadEligibleStubs();
  if (loadError) throw new Error(loadError.reason);

  const pending = eligible
    .filter((stub) => !stub.welcomeEmailSent)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const targets = OVERRIDE_TO ? pending : pending.slice(0, remainingToday);

  console.log(
    `Eligible stubs with email: ${eligible.length}. Welcome pending: ${pending.length}.`,
  );
  console.log(
    `Daily welcome limit: ${dailyLimit}. Sent today: ${sentToday}. Remaining today: ${remainingToday}.`,
  );
  if (DRY_RUN) console.log("Dry run — no emails will be sent.");
  if (OVERRIDE_TO) console.log(`All sends redirected to ${OVERRIDE_TO}`);

  if (!OVERRIDE_TO && remainingToday === 0) {
    console.log("Daily limit reached. Run again tomorrow.");
    await client.end();
    return;
  }

  if (targets.length === 0) {
    console.log("Nothing to send.");
    await client.end();
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const stub = targets[i];
    const recipient = OVERRIDE_TO || stub.email?.trim() || "";
    console.log(
      `[${i + 1}/${targets.length}] ${stub.displayName} -> ${recipient}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    if (DRY_RUN) continue;

    const [sendError] = await sendStubWelcomeEmail(stub, {
      to: OVERRIDE_TO || undefined,
    });
    if (sendError) {
      console.error(`  failed: ${sendError.reason}`);
      failed++;
      continue;
    }

    sent++;
    await sleep(400);
  }

  const stillPending = pending.length - sent;
  console.log(
    DRY_RUN
      ? `Dry run complete. Would send ${targets.length} welcome email(s) today.`
      : `Done. sent=${sent}, failed=${failed}, still pending=${stillPending}.`,
  );

  await client.end();
}

run().catch(async (error) => {
  console.error("Failed to send stub welcome batch:", error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
