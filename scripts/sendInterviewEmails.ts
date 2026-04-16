import "./env";
import fs from "node:fs/promises";
import { stringify } from "csv/sync";
import { eq, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../src/db/client";
import { creators, creatorInterviews } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";
import { generateInterviewInviteEmail } from "../src/features/dashboard/admin/creators/emails";

// Usage:
//   npx tsx scripts/sendInterviewEmails.ts
//   npx tsx scripts/sendInterviewEmails.ts --dry-run
//   npx tsx scripts/sendInterviewEmails.ts --limit=10
//   npx tsx scripts/sendInterviewEmails.ts --to=you@example.com   (redirect all to yourself for testing)

const OUTPUT_PATH = "tmp/interview-email-results.csv";
const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const TO_ARG = process.argv.find((a) => a.startsWith("--to="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 500;
const OVERRIDE_TO = TO_ARG ? TO_ARG.split("=")[1]?.trim().toLowerCase() : "";
const DRY_RUN = process.argv.includes("--dry-run");
const SITE_URL = "https://photobookers.com";

type ReportRow = {
  creator_name: string;
  email: string;
  status: "sent" | "skipped" | "failed";
  reason: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const rows = await db.query.creators.findMany({
    where: isNull(creators.interviewEmailSent),
    with: { owner: true },
    limit: LIMIT,
  });

  const eligible = rows.filter(
    (c) => (c.email ?? c.owner?.email ?? "").trim().length > 0,
  );

  console.log(
    `Found ${rows.length} creators without interview email sent; ${eligible.length} have a resolvable email.`,
  );
  if (DRY_RUN) console.log("Dry run — no emails will be sent.");

  const report: ReportRow[] = [];

  for (let i = 0; i < eligible.length; i++) {
    const creator = eligible[i];
    const recipientEmail =
      OVERRIDE_TO || (creator.email ?? creator.owner?.email ?? "");

    console.log(
      `[${i + 1}/${eligible.length}] ${creator.displayName} -> ${recipientEmail}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    if (DRY_RUN) {
      report.push({
        creator_name: creator.displayName,
        email: recipientEmail,
        status: "skipped",
        reason: "dry-run",
      });
      continue;
    }

    const inviteToken = nanoid(32);

    try {
      await db.insert(creatorInterviews).values({
        creatorId: creator.id,
        recipientEmail,
        inviteToken,
        interviewType: "introduction",
        status: "sent",
        invitedAt: new Date(),
      });
    } catch (e) {
      report.push({
        creator_name: creator.displayName,
        email: recipientEmail,
        status: "failed",
        reason: `DB insert failed: ${e}`,
      });
      continue;
    }

    const interviewLink = `${SITE_URL}/interviews/${inviteToken}`;
    const html = generateInterviewInviteEmail({
      creatorName: creator.displayName,
      interviewLink,
      profileUrl: `https://photobookers.com/creators/${creator.slug}`,
    });

    const [sendErr] = await sendEmail(
      recipientEmail,
      `Interview invitation — ${creator.displayName}`,
      html,
    );

    if (sendErr) {
      report.push({
        creator_name: creator.displayName,
        email: recipientEmail,
        status: "failed",
        reason: `sendEmail failed: ${sendErr.reason}`,
      });
      continue;
    }

    await db
      .update(creators)
      .set({ interviewEmailSent: new Date() })
      .where(eq(creators.id, creator.id));

    report.push({
      creator_name: creator.displayName,
      email: recipientEmail,
      status: "sent",
      reason: "sent and marked",
    });

    await sleep(400);
  }

  await fs.mkdir("tmp", { recursive: true });
  const csv = stringify(report, {
    header: true,
    columns: ["creator_name", "email", "status", "reason"],
  });
  await fs.writeFile(OUTPUT_PATH, csv, "utf8");

  const sent = report.filter((r) => r.status === "sent").length;
  const skipped = report.filter((r) => r.status === "skipped").length;
  const failed = report.filter((r) => r.status === "failed").length;
  console.log(
    `Done. sent=${sent}, skipped=${skipped}, failed=${failed}. Report: ${OUTPUT_PATH}`,
  );
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
