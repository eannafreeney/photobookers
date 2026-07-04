import "./env";
import fs from "node:fs/promises";
import { parse, stringify } from "csv/sync";
import {
  type CreatorEmailInputRow,
  type CreatorEmailOutputRow,
  mergeEmailPick,
  pickEmailHeuristic,
  runCreatorEmailSuggestSelfCheck,
  scrapeCreatorEmailContext,
  sleep,
  suggestEmailWithAi,
} from "./creatorEmailSuggestUtils";

const DEFAULT_INPUT = "tmp/stub-artists.csv";
const DEFAULT_OUTPUT = "tmp/suggested-creator-emails.csv";

const args = process.argv.slice(2);
const argSet = new Set(args);
const inputPath = args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_INPUT;
const outputPath =
  args.find((arg) => arg.startsWith("--output="))?.split("=")[1] ??
  DEFAULT_OUTPUT;
const limitArg = args.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const aiMode =
  args.find((arg) => arg.startsWith("--ai="))?.split("=")[1] ?? "fallback";
const retryEmpty = argSet.has("--retry-empty");

const openAiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const OUTPUT_COLUMNS = [
  "artist_name",
  "book_name",
  "profile_url",
  "publisher_name",
  "publisher_profile_url",
  "official_website",
  "email",
  "email_type",
  "source_url",
  "confidence",
  "notes",
] as const;

function shouldUseAi(heuristic: Pick<CreatorEmailOutputRow, "email" | "confidence">) {
  if (aiMode === "never") return false;
  if (aiMode === "always") return true;
  return !heuristic.email || heuristic.confidence !== "high";
}

async function processRow(
  row: CreatorEmailInputRow,
): Promise<CreatorEmailOutputRow> {
  const scrape = await scrapeCreatorEmailContext(row);

  if (!scrape.website) {
    return {
      ...row,
      official_website: "",
      email: "",
      email_type: "unknown",
      source_url: "",
      confidence: "none",
      notes: scrape.websiteNotes,
    };
  }

  const heuristic = pickEmailHeuristic(
    scrape.candidateEmails,
    scrape.website,
    row.publisher_name,
    { foundOnContactPage: scrape.foundOnContactPage },
  );

  if (!shouldUseAi(heuristic)) {
    return {
      ...row,
      official_website: scrape.website,
      email: heuristic.email,
      email_type: heuristic.email_type,
      source_url: scrape.sourceUrl,
      confidence: heuristic.confidence,
      notes: `${scrape.websiteNotes}; ${heuristic.notes}`,
    };
  }

  if (!openAiKey) {
    throw new Error("OPENAI_API_KEY is required unless --ai=never");
  }

  const ai = await suggestEmailWithAi({
    row,
    scrape,
    apiKey: openAiKey,
    model: openAiModel,
  });

  const chosen = mergeEmailPick(heuristic, ai, scrape.sourceUrl);

  return {
    ...row,
    official_website: scrape.website,
    email: chosen.email,
    email_type: chosen.email_type,
    source_url: chosen.source_url || scrape.sourceUrl,
    confidence: chosen.email ? chosen.confidence : "none",
    notes: [scrape.websiteNotes, heuristic.notes, ai.notes]
      .filter(Boolean)
      .join("; "),
  };
}

async function loadRows(): Promise<CreatorEmailInputRow[]> {
  const raw = await fs.readFile(inputPath, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CreatorEmailInputRow[];

  if (!retryEmpty) return rows;

  return rows.filter((row) => !(row as CreatorEmailInputRow & { email?: string }).email?.trim());
}

async function main() {
  if (argSet.has("--self-check")) {
    runCreatorEmailSuggestSelfCheck();
    console.log("Self-check passed.");
    return;
  }

  const rows = await loadRows();
  const work = limit > 0 ? rows.slice(0, limit) : rows;

  console.log(
    `Loaded ${rows.length} row(s) from ${inputPath}. Processing ${work.length} with ai=${aiMode}.`,
  );

  const out: CreatorEmailOutputRow[] = [];

  for (let i = 0; i < work.length; i++) {
    const row = work[i];
    console.log(`[${i + 1}/${work.length}] ${row.artist_name}`);

    try {
      const result = await processRow(row);
      out.push(result);
      console.log(
        `  -> ${result.email || "(none)"} [${result.confidence}] ${result.email_type}`,
      );
    } catch (error) {
      console.error(`  !! failed:`, error);
      out.push({
        ...row,
        official_website: "",
        email: "",
        email_type: "unknown",
        source_url: "",
        confidence: "none",
        notes: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    await sleep(180);
  }

  await fs.mkdir(outputPath.split("/").slice(0, -1).join("/") || ".", {
    recursive: true,
  });
  const csv = stringify(out, {
    header: true,
    columns: [...OUTPUT_COLUMNS],
  });
  await fs.writeFile(outputPath, csv, "utf8");

  const found = out.filter((row) => row.email).length;
  console.log(`Done. Wrote ${out.length} row(s) to ${outputPath} (${found} with email).`);
}

main().catch((error) => {
  console.error("Failed to suggest creator emails:", error);
  process.exit(1);
});
