import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { isNotNull } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators, users } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";

// Edit the template below, then run:
//   npx tsx scripts/sendBroadcastEmail.ts --dry-run
//   npx tsx scripts/sendBroadcastEmail.ts --to=you@example.com
//   ENV=production npx tsx scripts/sendBroadcastEmail.ts
//
// Sends up to 70 emails per day. Progress is saved to tmp/broadcast-sent.csv.
// Re-run the same command each day until everyone is done.
// To record emails already sent (e.g. your first 50), add rows to that file:
//   email,sentAt
//   someone@example.com,2026-06-05T12:00:00.000Z

const SUBJECT = "Photobookers app";

const EMAIL_HTML = `
  <p>Hi,</p>
  <p>Just a quick note to let you know that the Photobookers app is now live on iOS.</p>
  <p>You can download it from the App Store here: <a href="https://apps.apple.com/us/app/photobookers/id6771879476">Photobookers</a>.</p>
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 16px 0;">
    <tr>
      <td style="padding-right: 8px;">
        <img src="https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/app-launch/460x996bb.webp" alt="Photobookers app screenshot 1" width="120" style="display: block; width: 120px; height: auto;" />
      </td>
      <td style="padding-right: 8px;">
        <img src="https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/app-launch/460x996bb%20(1).webp" alt="Photobookers app screenshot 2" width="120" style="display: block; width: 120px; height: auto;" />
      </td>
      <td style="padding-right: 8px;">
        <img src="https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/app-launch/460x996bb%20(2).webp" alt="Photobookers app screenshot 3" width="120" style="display: block; width: 120px; height: auto;" />
      </td>
      <td>
        <img src="https://dbmbrwmygpnhjyyccbjp.supabase.co/storage/v1/object/public/app-launch/460x996bb%20(3).webp" alt="Photobookers app screenshot 4" width="120" style="display: block; width: 120px; height: auto;" />
      </td>
    </tr>
  </table>

  <p>
    All the best,<br />
    Eanna
  </p>
`;

const DAILY_LIMIT = 70;
const SENT_LOG_PATH = "tmp/broadcast-sent.csv";

const OVERRIDE_TO = process.argv
  .find((a) => a.startsWith("--to="))
  ?.split("=")[1]
  ?.trim()
  .toLowerCase();
const DRY_RUN = process.argv.includes("--dry-run");

type SentRow = { email: string; sentAt: string };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function loadSentLog(): Promise<SentRow[]> {
  try {
    const raw = await fs.readFile(SENT_LOG_PATH, "utf8");
    return parse(raw, { columns: true, skip_empty_lines: true }) as SentRow[];
  } catch {
    return [];
  }
}

async function appendSentLog(email: string) {
  await fs.mkdir("tmp", { recursive: true });
  const rows = await loadSentLog();
  rows.push({ email, sentAt: new Date().toISOString() });
  await fs.writeFile(
    SENT_LOG_PATH,
    stringify(rows, { header: true, columns: ["email", "sentAt"] }),
    "utf8",
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getAllEmails(): Promise<string[]> {
  const [userRows, creatorRows] = await Promise.all([
    db.select({ email: users.email }).from(users),
    db
      .select({ email: creators.email })
      .from(creators)
      .where(isNotNull(creators.email)),
  ]);

  const emails = new Set<string>();
  for (const row of [...userRows, ...creatorRows]) {
    const email = row.email?.trim().toLowerCase();
    if (email) emails.add(email);
  }

  return [...emails].sort();
}

async function run() {
  const emails = await getAllEmails();
  const sentLog = await loadSentLog();
  const alreadySent = new Set(sentLog.map((r) => r.email.trim().toLowerCase()));
  const sentToday = sentLog.filter((r) => r.sentAt.startsWith(todayKey())).length;
  const remainingToday = Math.max(0, DAILY_LIMIT - sentToday);

  const pending = emails.filter((e) => !alreadySent.has(e));
  const targets = OVERRIDE_TO ? [OVERRIDE_TO] : pending.slice(0, remainingToday);

  console.log(`Found ${emails.length} unique email addresses.`);
  if (!OVERRIDE_TO) {
    console.log(
      `Already sent: ${alreadySent.size}. Sent today: ${sentToday}/${DAILY_LIMIT}. Remaining today: ${remainingToday}. Pending total: ${pending.length}.`,
    );
  }

  if (DRY_RUN) console.log("Dry run — no emails will be sent.");
  if (OVERRIDE_TO) console.log(`All sends redirected to ${OVERRIDE_TO}`);
  if (!OVERRIDE_TO && remainingToday === 0) {
    console.log("Daily limit reached. Run again tomorrow.");
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const to = targets[i];
    console.log(`[${i + 1}/${targets.length}] ${to}`);

    if (DRY_RUN) continue;

    const [sendErr] = await sendEmail(to, SUBJECT, EMAIL_HTML);
    if (sendErr) {
      console.error(`  failed: ${sendErr.reason}`);
      failed++;
      continue;
    }

    if (!OVERRIDE_TO) await appendSentLog(to);
    sent++;
    await sleep(400);
  }

  if (!DRY_RUN) {
    const left = OVERRIDE_TO ? 0 : pending.length - sent;
    console.log(`Done. sent=${sent}, failed=${failed}, still pending=${left}.`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
