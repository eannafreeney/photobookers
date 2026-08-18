import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { and, eq, isNotNull, notExists } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators, users } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";

// Edit the template below, then run:
//   npx tsx scripts/sendBroadcastEmail.ts --audience=fans --dry-run
//   npx tsx scripts/sendBroadcastEmail.ts --audience=artists --to=you@example.com
//   ENV=production npx tsx scripts/sendBroadcastEmail.ts --audience=fans,artists
//
// --audience is required: fans, artists, or both (comma-separated).
// Progress is saved per audience, e.g. tmp/broadcast-sent-fans.csv, so a new
// campaign is not skipped by an old one. Re-run to resume after a failure.

const SUBJECT = "You’re a Collector now";

const EMAIL_HTML = `
  <p>Hi there,</p>
<p>Many of you wrote to say that being just a“fan” didn’t quite fit. You’re right. Collectors are a pivotal part of the photobook world, and Photobookers should treat you that way!</p>
<p>Your account is now a collector account. And now the fun part! You can:</p>
<ul>
  <li>Build your own shelf of photobooks from the books you favourited.</li>
  <li>Share that shelf publicly with friends and others on photobookers</li>
  <li>Make your own lists (e.g. “My Favourite Photobooks”), and publish them for all to see.</li>
</ul>
<p>Each Collector now has their own personal dashboard. You can access it here:</p>
<p>
  <a href="https://www.photobookers.com/dashboard">Your dashboard</a>
</p>
<p>There, you can see your shelf, your lists, and your profile.</p>
<p>Thank you for the feedback, and for sharing the journey.</p>
<p>Feedback welcome - what do you think? What would you like to see?</p>
<p>Have fun!
  All the best,<br />
  Eanna, Founder
</p>
`;

type Audience = "fans" | "artists";

const OVERRIDE_TO = process.argv
  .find((a) => a.startsWith("--to="))
  ?.split("=")[1]
  ?.trim()
  .toLowerCase();
const DRY_RUN = process.argv.includes("--dry-run");
const AUDIENCES = parseAudiences();
const SENT_LOG_PATH = `tmp/broadcast-sent-${AUDIENCES.join("-")}.csv`;

function parseAudiences(): Audience[] {
  const raw = process.argv
    .find((a) => a.startsWith("--audience="))
    ?.split("=")[1];
  const parts = raw?.split(",").map((s) => s.trim()) ?? [];
  const valid = [...new Set(parts)].filter(
    (p): p is Audience => p === "fans" || p === "artists",
  );
  if (valid.length === 0) {
    console.error(
      "Required: --audience=fans, --audience=artists, or --audience=fans,artists",
    );
    process.exit(1);
  }
  return valid.sort();
}

type SentRow = { email: string; sentAt: string };

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

function collectEmails(rows: { email: string | null }[], into: Set<string>) {
  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (email) into.add(email);
  }
}

async function getFanEmails(): Promise<{ email: string | null }[]> {
  return db
    .select({ email: users.email })
    .from(users)
    .where(
      and(
        eq(users.isAdmin, false),
        eq(users.mustResetPassword, false),
        isNotNull(users.acceptsTerms),
        notExists(
          db
            .select({ id: creators.id })
            .from(creators)
            .where(
              and(
                eq(creators.ownerUserId, users.id),
                eq(creators.status, "verified"),
              ),
            ),
        ),
      ),
    );
}

async function getArtistEmails(): Promise<{ email: string | null }[]> {
  const rows = await db
    .select({ ownerEmail: users.email, creatorEmail: creators.email })
    .from(creators)
    .leftJoin(users, eq(creators.ownerUserId, users.id))
    .where(eq(creators.type, "artist"));

  return rows.flatMap((row) => [
    { email: row.ownerEmail },
    { email: row.creatorEmail },
  ]);
}

async function getEmails(audiences: Audience[]): Promise<string[]> {
  const emails = new Set<string>();
  if (audiences.includes("fans")) collectEmails(await getFanEmails(), emails);
  if (audiences.includes("artists")) {
    collectEmails(await getArtistEmails(), emails);
  }
  return [...emails].sort();
}

async function run() {
  const emails = await getEmails(AUDIENCES);
  const sentLog = await loadSentLog();
  const alreadySent = new Set(sentLog.map((r) => r.email.trim().toLowerCase()));
  const pending = emails.filter((e) => !alreadySent.has(e));
  const targets = OVERRIDE_TO ? [OVERRIDE_TO] : pending;

  console.log(
    `Audience: ${AUDIENCES.join(", ")}. Found ${emails.length} unique email addresses. Log: ${SENT_LOG_PATH}`,
  );
  if (!OVERRIDE_TO) {
    console.log(
      `Already sent: ${alreadySent.size}. Pending: ${pending.length}.`,
    );
  }

  if (DRY_RUN) console.log("Dry run — no emails will be sent.");
  if (OVERRIDE_TO) console.log(`All sends redirected to ${OVERRIDE_TO}`);

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
