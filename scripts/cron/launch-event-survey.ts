/**
 * Daily batch: launch-event interest email to verified creators.
 * Run via .github/workflows/cron-launch-event-survey.yml (not manually).
 */
import "../env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { eq } from "drizzle-orm";
import { db } from "../../src/db/client";
import { creators } from "../../src/db/schema";
import { sendEmail } from "../../src/lib/sendEmail";

const SUBJECT = "Quick question: online book launches on Photobookers?";
const SENT_LOG_PATH = "tmp/launch-event-survey-sent.csv";
const RESULT_PATH = "tmp/launch-event-survey-last-run.json";
const DAILY_LIMIT = Number(process.env.LAUNCH_SURVEY_DAILY_LIMIT) || 30;

type SentRow = { email: string; creatorName: string; sentAt: string };

type LaunchSurveyResult = {
  sent: number;
  failed: number;
  pending: number;
  eligible: number;
  complete: boolean;
};

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

async function writeResult(result: LaunchSurveyResult) {
  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(RESULT_PATH, JSON.stringify(result, null, 2), "utf8");
}

async function run() {
  const rows = await db.query.creators.findMany({
    where: eq(creators.status, "verified"),
    with: { owner: true },
    limit: 500,
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
  const targets = pending.slice(0, remainingToday);

  console.log(
    `Verified creators: ${rows.length}. With email: ${eligible.length}. Already sent: ${alreadySent.size}.`,
  );
  console.log(
    `Sent today: ${sentToday}/${DAILY_LIMIT}. Remaining today: ${remainingToday}. Pending: ${pending.length}.`,
  );

  let sent = 0;
  let failed = 0;

  if (remainingToday === 0) {
    console.log("Daily limit reached. Run again tomorrow.");
    const result: LaunchSurveyResult = {
      sent: 0,
      failed: 0,
      pending: pending.length,
      eligible: eligible.length,
      complete: pending.length === 0,
    };
    await writeResult(result);
    return result;
  }

  for (let i = 0; i < targets.length; i++) {
    const { creator, email } = targets[i];

    console.log(`[${i + 1}/${targets.length}] ${creator.displayName} -> ${email}`);

    const html = generateLaunchEventSurveyEmail(creator.displayName);
    const [sendErr] = await sendEmail(email, SUBJECT, html);

    if (sendErr) {
      console.error(`  failed: ${sendErr.reason}`);
      failed++;
      continue;
    }

    await appendSentLog(email, creator.displayName);
    sent++;
    await sleep(400);
  }

  const left = pending.length - sent;
  const result: LaunchSurveyResult = {
    sent,
    failed,
    pending: left,
    eligible: eligible.length,
    complete: left === 0,
  };

  console.log(`Done. sent=${sent}, failed=${failed}, still pending=${left}.`);
  await writeResult(result);
  return result;
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
