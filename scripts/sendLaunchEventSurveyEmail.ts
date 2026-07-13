import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";

// Interest survey for verified creators — online book launch events.
//
// 1. Set SURVEY_URL below (Tally, Google Forms, etc.)
// 2. Test:
//      npx tsx scripts/sendLaunchEventSurveyEmail.ts --dry-run
//      npx tsx scripts/sendLaunchEventSurveyEmail.ts --to=you@example.com
// 3. Send for real (uses .env.production when ENV=production):
//      ENV=production npx tsx scripts/sendLaunchEventSurveyEmail.ts
//
// Sends one email per creator (not BCC). Progress is saved to
// tmp/launch-event-survey-sent.csv — safe to re-run; already-sent addresses are skipped.
// Daily cap matches sendBroadcastEmail.ts (70/day).

const SUBJECT = "Quick question: online book launches on Photobookers?";

const DAILY_LIMIT = 70;
const SENT_LOG_PATH = "tmp/launch-event-survey-sent.csv";

const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const TO_ARG = process.argv.find((a) => a.startsWith("--to="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 500;
const OVERRIDE_TO = TO_ARG ? TO_ARG.split("=")[1]?.trim().toLowerCase() : "";
const DRY_RUN = process.argv.includes("--dry-run");

type SentRow = { email: string; creatorName: string; sentAt: string };

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateLaunchEventSurveyEmail(creatorName: string) {
  return `
    <p>Hi ${creatorName},</p>
    <p>I hope you are well.</p>
    <p>
      I am exploring a new idea for Photobookers: <strong>online book launch events</strong>,
      where an artist could present a new photobook or have a conversation with their publisher,
      with audience Q&amp;A. I think this could be a great way to connect with your audience and
      brign awareness to your new book.
    </p>
    <p>
      Photobookers would handle discovery and promotion; the event itself would run on Zoom or
      YouTube rather than us building video hosting from scratch. I would stay off camera —
      you and your publisher (or collaborator) would be the show. I would be on hand to manage the event and ensure it runs smoothly.
    </p>
    <p>
      I am testing whether this is something creators actually want <em>before</em> building
      anything. If you have a current or upcoming book, I would especially love to hear from you.
    </p>
    <p>
      Just reply to this email with a quick yes, no, or maybe — even one sentence helps.
    </p>
    <p>
      All the best,<br />
      Eanna<br />
      Photobookers
    </p>
  `;
}

async function loadSentLog(): Promise<SentRow[]> {
  try {
    const raw = await fs.readFile(SENT_LOG_PATH, "utf8");
    return parse(raw, { columns: true, skip_empty_lines: true }) as SentRow[];
  } catch {
    return [];
  }
}

async function appendSentLog(email: string, creatorName: string) {
  await fs.mkdir("tmp", { recursive: true });
  const rows = await loadSentLog();
  rows.push({ email, creatorName, sentAt: new Date().toISOString() });
  await fs.writeFile(
    SENT_LOG_PATH,
    stringify(rows, {
      header: true,
      columns: ["email", "creatorName", "sentAt"],
    }),
    "utf8",
  );
}

async function run() {
  const rows = await db.query.creators.findMany({
    where: eq(creators.status, "verified"),
    with: { owner: true },
    limit: LIMIT,
    orderBy: (c, { desc }) => [desc(c.verifiedAt)],
  });

  const eligible = rows
    .map((creator) => {
      const email = (creator.email ?? creator.owner?.email ?? "")
        .trim()
        .toLowerCase();
      return { creator, email };
    })
    .filter((row) => row.email.length > 0);

  const sentLog = await loadSentLog();
  const alreadySent = new Set(sentLog.map((r) => r.email.trim().toLowerCase()));
  const sentToday = sentLog.filter((r) =>
    r.sentAt.startsWith(todayKey()),
  ).length;
  const remainingToday = Math.max(0, DAILY_LIMIT - sentToday);

  const pending = eligible.filter((row) => !alreadySent.has(row.email));
  const targets = OVERRIDE_TO
    ? eligible.slice(
        0,
        Math.min(eligible.length, remainingToday || eligible.length),
      )
    : pending.slice(0, remainingToday);

  console.log(
    `Verified creators: ${rows.length}. With email: ${eligible.length}. Already sent: ${alreadySent.size}.`,
  );
  if (!OVERRIDE_TO) {
    console.log(
      `Sent today: ${sentToday}/${DAILY_LIMIT}. Remaining today: ${remainingToday}. Pending: ${pending.length}.`,
    );
  }
  if (DRY_RUN) console.log("Dry run — no emails will be sent.");
  if (OVERRIDE_TO) console.log(`All sends redirected to ${OVERRIDE_TO}`);
  if (!OVERRIDE_TO && !DRY_RUN && remainingToday === 0) {
    console.log("Daily limit reached. Run again tomorrow.");
    return;
  }

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const { creator, email } = targets[i];
    const to = OVERRIDE_TO || email;

    console.log(
      `[${i + 1}/${targets.length}] ${creator.displayName} -> ${to}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    if (DRY_RUN) continue;

    const html = generateLaunchEventSurveyEmail(creator.displayName);
    const [sendErr] = await sendEmail(to, SUBJECT, html);

    if (sendErr) {
      console.error(`  failed: ${sendErr.reason}`);
      failed++;
      continue;
    }

    if (!OVERRIDE_TO) await appendSentLog(email, creator.displayName);
    sent++;
    await sleep(400);
  }

  if (!DRY_RUN) {
    const left = OVERRIDE_TO ? 0 : pending.length - sent;
    console.log(`Done. sent=${sent}, failed=${failed}, still pending=${left}.`);
    if (!OVERRIDE_TO && left > 0) {
      console.log(
        `Re-run tomorrow to send the next batch (max ${DAILY_LIMIT}/day).`,
      );
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
