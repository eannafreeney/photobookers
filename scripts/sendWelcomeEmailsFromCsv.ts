import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { and, eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { creators } from "../src/db/schema";
import { sendEmail } from "../src/lib/sendEmail";
import {
  createAuthUser,
  createUserWithAuthId,
} from "../src/features/dashboard/admin/users/services";
import { assignUserAsCreatorOwnerAdmin } from "../src/features/dashboard/admin/claims/services";
import { generateWelcomeEmailForCreator } from "../src/features/dashboard/admin/creators/emails";
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
const SITE_URL = "https://photobookers.com";

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

  const selectedWindow = rows.slice(START, START + LIMIT);
  const rowsToProcess = selectedWindow.filter(
    (r) => (r.email ?? "").trim().length > 0,
  );

  console.log(
    `Loaded ${rows.length} rows; window=${selectedWindow.length} (start=${START}, limit=${LIMIT}); ${rowsToProcess.length} rows in window have email.`,
  );
  if (DRY_RUN) {
    console.log("Dry run mode enabled: emails will not be sent.");
  }

  const report: ReportRow[] = [];

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    const artistName = (row.artist_name ?? "").trim();
    const profileUrl = (row.profile_url ?? "").trim();
    const recipientEmail = (row.email ?? "").trim().toLowerCase();
    const targetEmail = OVERRIDE_TO || recipientEmail;

    console.log(
      `[${i + 1}/${rowsToProcess.length}] ${artistName} -> ${targetEmail}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    // GET CREATOR SLUG
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

    // GET ARTIST BY SLUG
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

    const temporaryPassword = crypto.randomUUID();

    // CREATE AUTH USER IN SUPABASE
    const [createAuthError, authData] = await createAuthUser(
      temporaryPassword,
      {
        email: targetEmail,
        firstName: undefined,
        lastName: undefined,
        // creatorId: creator.id,
      },
    );

    if (createAuthError || !authData) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: "Failed to create auth user",
      });
      continue;
    }

    // GET AUTH USER ID
    const authUserId = authData.data.user.id;

    // CREATE APP USER ROW (MUST RESET PASSWORD)
    const [createUserErr] = await createUserWithAuthId(
      authUserId,
      {
        email: targetEmail,
        firstName: undefined,
        lastName: undefined,
        // creatorId: creator.id,
      },
      { mustResetPassword: true },
    );

    if (createUserErr) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: `Failed to create app user: ${createUserErr.reason}`,
      });
      continue;
    }

    // ASSIGN USER AS OWNER OF CREATOR
    const [assignErr] = await assignUserAsCreatorOwnerAdmin(
      authUserId,
      creator.id,
    );

    if (assignErr) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "failed",
        reason: `Failed to assign owner: ${assignErr.reason}`,
      });
      continue;
    }

    // GENERATE LOGIN LINK
    const loginLink = `${SITE_URL}/auth/login?email=${encodeURIComponent(targetEmail)}&password=${encodeURIComponent(temporaryPassword)}`;

    // GENERATE WELCOME EMAIL
    const html = generateWelcomeEmailForCreator(creator as any, loginLink);

    // SEND EMAIL
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

    // MARK WELCOME EMAIL AS SENT
    const [markErr] = await markWelcomeEmailSentAdmin(creator.id);
    if (markErr) {
      report.push({
        artist_name: artistName || creator.displayName,
        profile_url: profileUrl,
        email: targetEmail,
        status: "sent",
        reason: `sent, but markWelcomeEmailSentAdmin failed: ${markErr.reason}`,
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
