import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { eq, ilike } from "drizzle-orm";
import { db } from "../src/db/client";
import { bookStores } from "../src/db/schema";
import { createStoreUploadToken } from "../src/domain/stores/storeUploadToken";
import { generateStoreUploadInviteEmail } from "../src/features/store-upload/emails";
import { sendEmail } from "../src/lib/sendEmail";

/**
 * Reach out to bookstores from a spreadsheet of emails + mint upload links.
 *
 * CSV columns (any of):
 *   slug | store_slug | store_name | name | email
 *
 * Usage:
 *   npx tsx scripts/sendStoreUploadEmailsFromCsv.ts tmp/store-emails.csv
 *   npx tsx scripts/sendStoreUploadEmailsFromCsv.ts tmp/store-emails.csv --dry-run
 *   npx tsx scripts/sendStoreUploadEmailsFromCsv.ts tmp/store-emails.csv --links-only
 *   npx tsx scripts/sendStoreUploadEmailsFromCsv.ts tmp/store-emails.csv --to=you@example.com
 *   npx tsx scripts/sendStoreUploadEmailsFromCsv.ts tmp/store-emails.csv --limit=10 --start=0
 */

type InputRow = {
  slug?: string;
  store_slug?: string;
  store_name?: string;
  name?: string;
  email?: string;
};

type ReportRow = {
  store_name: string;
  slug: string;
  email: string;
  upload_url: string;
  status: "sent" | "skipped" | "failed";
  reason: string;
};

const INPUT_PATH = process.argv[2] ?? "tmp/store-emails.csv";
const OUTPUT_PATH = process.argv[3]?.startsWith("--")
  ? "tmp/store-upload-email-results.csv"
  : (process.argv[3] ?? "tmp/store-upload-email-results.csv");
const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const START_ARG = process.argv.find((a) => a.startsWith("--start="));
const TO_ARG = process.argv.find((a) => a.startsWith("--to="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 500;
const START = START_ARG ? Number(START_ARG.split("=")[1]) : 0;
const OVERRIDE_TO = TO_ARG ? TO_ARG.split("=")[1]?.trim().toLowerCase() : "";
const DRY_RUN = process.argv.includes("--dry-run");
const LINKS_ONLY = process.argv.includes("--links-only");
const SITE_URL = (
  process.env.SITE_URL ?? "https://photobookers.com"
).replace(/\/$/, "");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function rowSlug(row: InputRow): string {
  return (row.slug ?? row.store_slug ?? "").trim();
}

function rowName(row: InputRow): string {
  return (row.store_name ?? row.name ?? "").trim();
}

async function findStore(row: InputRow) {
  const slug = rowSlug(row);
  if (slug) {
    const bySlug = await db.query.bookStores.findFirst({
      where: eq(bookStores.slug, slug),
    });
    if (bySlug) return bySlug;
  }

  const name = rowName(row);
  if (!name) return null;

  const byName = await db.query.bookStores.findFirst({
    where: ilike(bookStores.name, name),
  });
  return byName ?? null;
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
    `Loaded ${rows.length} rows; window=${selectedWindow.length} (start=${START}, limit=${LIMIT}); ${rowsToProcess.length} have email.`,
  );
  if (DRY_RUN) console.log("Dry run — emails will not be sent.");
  if (LINKS_ONLY) console.log("Links only — minting URLs, no emails.");

  const report: ReportRow[] = [];

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i];
    const recipientEmail = (row.email ?? "").trim().toLowerCase();
    const targetEmail = OVERRIDE_TO || recipientEmail;
    const label = rowName(row) || rowSlug(row) || recipientEmail;

    console.log(
      `[${i + 1}/${rowsToProcess.length}] ${label} -> ${targetEmail}${OVERRIDE_TO ? " (override)" : ""}`,
    );

    const store = await findStore(row);
    if (!store) {
      report.push({
        store_name: rowName(row),
        slug: rowSlug(row),
        email: targetEmail,
        upload_url: "",
        status: "failed",
        reason: "No matching store (need slug or exact name)",
      });
      continue;
    }

    const token = createStoreUploadToken(store.id);
    const uploadUrl = `${SITE_URL}/store-upload/${token}`;
    const storePageUrl = `${SITE_URL}/stores/${store.slug}`;

    if (DRY_RUN || LINKS_ONLY) {
      report.push({
        store_name: store.name,
        slug: store.slug,
        email: targetEmail,
        upload_url: uploadUrl,
        status: "skipped",
        reason: DRY_RUN ? "dry-run" : "links-only",
      });
      continue;
    }

    const html = generateStoreUploadInviteEmail({
      storeName: store.name,
      uploadLink: uploadUrl,
      storePageUrl,
    });

    const [sendErr] = await sendEmail(
      targetEmail,
      `Photos for your Photobookers listing — ${store.name}`,
      html,
    );

    if (sendErr) {
      report.push({
        store_name: store.name,
        slug: store.slug,
        email: targetEmail,
        upload_url: uploadUrl,
        status: "failed",
        reason: `sendEmail failed: ${sendErr.reason}`,
      });
      continue;
    }

    report.push({
      store_name: store.name,
      slug: store.slug,
      email: targetEmail,
      upload_url: uploadUrl,
      status: "sent",
      reason: "ok",
    });

    await sleep(400);
  }

  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(OUTPUT_PATH, stringify(report, { header: true }));
  console.log(`Wrote ${report.length} rows to ${OUTPUT_PATH}`);

  const sent = report.filter((r) => r.status === "sent").length;
  const skipped = report.filter((r) => r.status === "skipped").length;
  const failed = report.filter((r) => r.status === "failed").length;
  console.log(`Done. sent=${sent} skipped=${skipped} failed=${failed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
