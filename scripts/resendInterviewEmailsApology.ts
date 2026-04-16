import "./env";
import fs from "node:fs/promises";
import { stringify } from "csv/sync";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { creatorInterviews } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";
import { generateInterviewInviteResendEmail } from "../src/features/dashboard/admin/creators/emails";

// One-off script to resend interview invites with an apology to all creators
// who were already sent an invite (status = 'sent', not yet completed).
//
// Usage:
//   npx tsx scripts/resendInterviewEmailsApology.ts --dry-run
//   npx tsx scripts/resendInterviewEmailsApology.ts --to=you@example.com
//   npx tsx scripts/resendInterviewEmailsApology.ts

const OUTPUT_PATH = "tmp/interview-resend-results.csv";
const TO_ARG = process.argv.find((a) => a.startsWith("--to="));
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
  const rows = await db.query.creatorInterviews.findMany({
    where: eq(creatorInterviews.status, "sent"),
    with: { creator: true },
  });

  console.log(`Found ${rows.length} pending interview invites to resend.`);
  if (DRY_RUN) console.log("Dry run — no emails will be sent.");

  const report: ReportRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const interview = rows[i];
    const creator = interview.creator;

    if (!creator) {
      report.push({ creator_name: "unknown", email: interview.recipientEmail, status: "failed", reason: "Creator not found" });
      continue;
    }

    const recipientEmail = OVERRIDE_TO || interview.recipientEmail;
    console.log(
      `[${i + 1}/${rows.length}] ${creator.displayName} -> ${recipientEmail}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    if (DRY_RUN) {
      report.push({ creator_name: creator.displayName, email: recipientEmail, status: "skipped", reason: "dry-run" });
      continue;
    }

    const interviewLink = `${SITE_URL}/interviews/${interview.inviteToken}`;
    const profileUrl = `${SITE_URL}/creators/${creator.slug}`;
    const html = generateInterviewInviteResendEmail({
      creatorName: creator.displayName,
      interviewLink,
      profileUrl,
    });

    const [sendErr] = await sendEmail(
      recipientEmail,
      `Interview invitation — ${creator.displayName} (corrected)`,
      html,
    );

    if (sendErr) {
      report.push({ creator_name: creator.displayName, email: recipientEmail, status: "failed", reason: `sendEmail failed: ${sendErr.reason}` });
      continue;
    }

    report.push({ creator_name: creator.displayName, email: recipientEmail, status: "sent", reason: "resent with apology" });
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
