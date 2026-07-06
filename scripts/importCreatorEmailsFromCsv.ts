import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import { and, eq } from "drizzle-orm";
import { db, client } from "../src/db/client";
import { creators } from "../src/db/schema";
import {
  meetsMinConfidence,
  slugFromProfileUrl,
} from "./creatorCsvUtils";

type InputRow = {
  artist_name?: string;
  profile_url?: string;
  official_website?: string;
  email?: string;
  confidence?: string;
};

type ReportRow = {
  artist_name: string;
  slug: string;
  email: string;
  website: string;
  confidence: string;
  status: "updated" | "skipped" | "failed";
  reason: string;
};

const inputArg = process.argv
  .find((arg) => arg.startsWith("--input="))
  ?.split("=")[1];
const positionalArgs = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--"));
const INPUT_PATH =
  inputArg ?? positionalArgs.at(-1) ?? "tmp/suggested-creator-emails.csv";
const OUTPUT_PATH =
  process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] ??
  "tmp/import-creator-emails-results.csv";
const args = new Set(process.argv.slice(2));
const isDryRun = !args.has("--write");
const forceOverwrite = args.has("--force");
const updateWebsite = args.has("--update-website");
const minConfidenceArg = process.argv
  .find((arg) => arg.startsWith("--min-confidence="))
  ?.split("=")[1] as "high" | "medium" | "low" | undefined;

async function run() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  if (
    !raw.includes("artist_name") ||
    !raw.includes("profile_url") ||
    raw.includes("__PAGEZERO")
  ) {
    throw new Error(
      `File does not look like a creator emails CSV: ${INPUT_PATH}. Use --input=tmp/suggested-creator-emails.csv`,
    );
  }

  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
  }) as InputRow[];

  const report: ReportRow[] = [];
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(
    `Loaded ${rows.length} row(s) from ${INPUT_PATH}.${minConfidenceArg ? ` min-confidence=${minConfidenceArg}.` : ""} ${isDryRun ? "Dry run." : "Writing to DB."}`,
  );

  for (const row of rows) {
    const artistName = (row.artist_name ?? "").trim();
    const email = (row.email ?? "").trim().toLowerCase();
    const website = (row.official_website ?? "").trim();
    const confidence = (row.confidence ?? "").trim().toLowerCase();
    const slug = slugFromProfileUrl(row.profile_url);

    const base = {
      artist_name: artistName,
      slug: slug ?? "",
      email,
      website,
      confidence,
    };

    if (!email) {
      skipped++;
      report.push({ ...base, status: "skipped", reason: "no email in csv" });
      continue;
    }

    if (minConfidenceArg && !meetsMinConfidence(confidence, minConfidenceArg)) {
      skipped++;
      report.push({
        ...base,
        status: "skipped",
        reason: `confidence below ${minConfidenceArg}`,
      });
      continue;
    }

    if (!slug) {
      failed++;
      report.push({
        ...base,
        status: "failed",
        reason: "invalid profile_url",
      });
      continue;
    }

    const creator = await db.query.creators.findFirst({
      where: and(eq(creators.slug, slug), eq(creators.type, "artist")),
      columns: {
        id: true,
        displayName: true,
        email: true,
        website: true,
      },
    });

    if (!creator) {
      failed++;
      report.push({ ...base, status: "failed", reason: "creator not found" });
      continue;
    }

    const emailUnchanged = creator.email?.trim().toLowerCase() === email;
    const websiteUnchanged =
      !updateWebsite ||
      !website ||
      creator.website?.trim() === website;

    if (!forceOverwrite && emailUnchanged && websiteUnchanged) {
      skipped++;
      report.push({ ...base, status: "skipped", reason: "already set" });
      continue;
    }

    if (!forceOverwrite && creator.email?.trim() && creator.email.trim().toLowerCase() !== email) {
      skipped++;
      report.push({
        ...base,
        status: "skipped",
        reason: `creator already has email ${creator.email}`,
      });
      continue;
    }

    const patch: { email?: string; website?: string } = { email };
    if (updateWebsite && website && (forceOverwrite || !creator.website?.trim())) {
      patch.website = website;
    }

    if (isDryRun) {
      console.log(
        `[dry-run] ${creator.displayName} (${slug}) -> ${email}${patch.website ? `, website=${patch.website}` : ""}`,
      );
      report.push({ ...base, status: "updated", reason: "dry-run" });
      continue;
    }

    await db.update(creators).set(patch).where(eq(creators.id, creator.id));
    updated++;
    console.log(`[updated] ${creator.displayName} (${slug}) -> ${email}`);
    report.push({ ...base, status: "updated", reason: "imported" });
  }

  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(
    OUTPUT_PATH,
    stringify(report, {
      header: true,
      columns: [
        "artist_name",
        "slug",
        "email",
        "website",
        "confidence",
        "status",
        "reason",
      ],
    }),
    "utf8",
  );

  console.log(
    `Done. updated=${updated}, skipped=${skipped}, failed=${failed}. Report: ${OUTPUT_PATH}`,
  );
  if (isDryRun) {
    console.log("Re-run with --write to persist. Add --update-website to import sites.");
  }

  await client.end();
}

run().catch(async (error) => {
  console.error("Failed to import creator emails:", error);
  try {
    await client.end();
  } catch {}
  process.exit(1);
});
