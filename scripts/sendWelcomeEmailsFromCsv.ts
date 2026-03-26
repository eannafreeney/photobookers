import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";
import {
  generateWelcomeEmailForCreator,
} from "../src/features/dashboard/admin/creators/emails";
import { markWelcomeEmailSentAdmin } from "../src/features/dashboard/admin/creators/services";

type InputRow = {
  artist_name?: string;
  profile_url?: string;
  email?: string;
};

type ReportRow = {
  artist_name: string;
  profile_url: string;
  email: string;
  status: "sent" | "skipped" | "failed";
  reason: string;
};

const INPUT_PATH = process.argv[2] ?? "tmp/stub-artists-emails.csv";
const OUTPUT_PATH = process.argv[3] ?? "tmp/welcome-email-results.csv";
const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const START_ARG = process.argv.find((a) => a.startsWith("--start="));
const TO_ARG = process.argv.find((a) => a.startsWith("--to="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 100;
const START = START_ARG ? Number(START_ARG.split("=")[1]) : 0;
const OVERRIDE_TO = TO_ARG ? TO_ARG.split("=")[1]?.trim().toLowerCase() : "";
const DRY_RUN = process.argv.includes("--dry-run");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugFromProfileUrl(profileUrl?: string): string | null {
  if (!profileUrl) return null;
  try {
    const url = new URL(profileUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "creators");
    if (idx < 0) return null;
    return parts[idx + 1] ?? null;
  } catch {
    return null;
  }
}

async function run() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as InputRow[];

  const withEmail = rows.filter((r) => (r.email ?? "").trim().length > 0);
  const selected = withEmail.slice(START, START + LIMIT);

  console.log(
    `Loaded ${rows.length} rows; ${withEmail.length} have email; processing ${selected.length} starting at index ${START}.`,
  );
  if (DRY_RUN) {
    console.log("Dry run mode enabled: emails will not be sent.");
  }

  const report: ReportRow[] = [];

  for (let i = 0; i < selected.length; i++) {
    const row = selected[i];
    const artistName = (row.artist_name ?? "").trim();
    const profileUrl = (row.profile_url ?? "").trim();
    const recipientEmail = (row.email ?? "").trim().toLowerCase();
    const targetEmail = OVERRIDE_TO || recipientEmail;

    console.log(
      `[${i + 1}/${selected.length}] ${artistName} -> ${targetEmail}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    const slug = slugFromProfileUrl(profileUrl);
    if (!slug) {
      report.push({
        artist_name: artistName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: "Missing or invalid profile_url slug",
      });
      continue;
    }

    const creatorRows = await db
      .select({
        id: creators.id,
        slug: creators.slug,
        type: creators.type,
        displayName: creators.displayName,
      })
      .from(creators)
      .where(and(eq(creators.slug, slug), eq(creators.type, "artist")))
      .limit(1);

    const creator = creatorRows[0];

    if (!creator) {
      report.push({
        artist_name: artistName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: "Creator not found by slug",
      });
      continue;
    }

    if (DRY_RUN) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "skipped",
        reason: "dry-run",
      });
      continue;
    }

    const html = generateWelcomeEmailForCreator(creator as any);
    const subject = `Hi ${creator.displayName}! Invitation to Photobookers`;
    const [sendErr] = await sendEmail(targetEmail, subject, html);

    if (sendErr) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: `sendEmail failed: ${sendErr.reason}`,
      });
      continue;
    }

    const [markErr] = await markWelcomeEmailSentAdmin(creator.id);
    if (markErr) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: `markWelcomeEmailSentAdmin failed: ${markErr.reason}`,
      });
      continue;
    }

    report.push({
      artist_name: artistName || creator.displayName,
      profile_url: profileUrl,
      email: targetEmail,
      status: "sent",
      reason: "sent and marked",
    });

    // Keep moderate pacing to avoid provider throttling.
    await sleep(400);
  }

  const csv = stringify(report, {
    header: true,
    columns: ["artist_name", "profile_url", "email", "status", "reason"],
  });
  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(OUTPUT_PATH, csv, "utf8");

  const sent = report.filter((r) => r.status === "sent").length;
  const skipped = report.filter((r) => r.status === "skipped").length;
  const failed = report.filter((r) => r.status === "failed").length;
  console.log(
    `Done. sent=${sent}, skipped=${skipped}, failed=${failed}. Report: ${OUTPUT_PATH}`,
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
