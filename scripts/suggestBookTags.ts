import "./env";
import fs from "node:fs/promises";
import { stringify } from "csv/sync";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { DISCOVER_TAGS } from "../src/constants/discover";
import { db } from "../src/db/client";
import { books } from "../src/db/schema";
import {
  filterGeoTags,
  filterThemeTags,
  mergeBookTags,
  runBookTagSuggestSelfCheck,
  tagsEqual,
} from "./bookTagSuggestUtils";

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 500;
const DEFAULT_OUTPUT = "tmp/suggested-book-tags.csv";

const args = process.argv.slice(2);
const argSet = new Set(args);
const isDryRun = !argSet.has("--write");
const bookIdArg = args.find((a) => a.startsWith("--book-id="))?.split("=")[1];
const limitArg = args.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : 0;
const outputPath =
  args.find((a) => a.startsWith("--output="))?.split("=")[1] ??
  DEFAULT_OUTPUT;

const openAiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

type BookRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  tags: string[] | null;
};

type SuggestionRow = {
  book_id: string;
  slug: string;
  title: string;
  existing_tags: string;
  suggested_theme_tags: string;
  suggested_geo_tags: string;
  merged_tags: string;
  changed: string;
};

const llmBookSchema = z.object({
  book_id: z.string(),
  theme_tags: z.array(z.string()).default([]),
  geo_tags: z.array(z.string()).default([]),
});

const llmResponseSchema = z.object({
  books: z.array(llmBookSchema),
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function bookText(book: BookRow): string {
  const description = book.description?.trim();
  if (description) {
    return `Title: ${book.title}\nDescription: ${description}`;
  }
  return `Title: ${book.title}`;
}

function buildPrompt(batch: BookRow[]): string {
  const discoverList = DISCOVER_TAGS.join(", ");
  const bookBlocks = batch
    .map(
      (book) =>
        `[book_id=${book.id}]\n${bookText(book)}`,
    )
    .join("\n\n");

  return `You tag photobooks for a discovery catalog.

For each book, return:
1. theme_tags — 0 to 3 tags chosen ONLY from this exact list: ${discoverList}
2. geo_tags — lowercase city and country tags when a location is clearly central to the book's subject (not passing mentions, artist names, or publisher locations unless the book is about that place). When a city is mentioned, include both the city tag and its country tag.

Rules:
- Use lowercase tags; multi-word tags use spaces (e.g. "new york", "still life" is theme-only).
- Do not repeat tags within a book.
- Return JSON only: {"books":[{"book_id":"...","theme_tags":[],"geo_tags":[]}]}

Books:

${bookBlocks}`;
}

async function suggestTagsForBatch(
  batch: BookRow[],
): Promise<Map<string, { themeTags: string[]; geoTags: string[] }>> {
  if (!openAiKey) {
    throw new Error("OPENAI_API_KEY is required");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAiModel,
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You classify photobooks into theme and geographic tags. Respond with valid JSON only.",
        },
        { role: "user", content: buildPrompt(batch) },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${body}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error(`OpenAI returned invalid JSON: ${content.slice(0, 200)}`);
  }

  const validated = llmResponseSchema.parse(parsed);
  const byId = new Map<string, { themeTags: string[]; geoTags: string[] }>();

  for (const row of validated.books) {
    byId.set(row.book_id, {
      themeTags: filterThemeTags(row.theme_tags),
      geoTags: filterGeoTags(row.geo_tags),
    });
  }

  return byId;
}

async function getPublishedBooks(): Promise<BookRow[]> {
  const rows = await db
    .select({
      id: books.id,
      slug: books.slug,
      title: books.title,
      description: books.description,
      tags: books.tags,
    })
    .from(books)
    .where(eq(books.publicationStatus, "published"));

  const filtered = bookIdArg
    ? rows.filter((row) => row.id === bookIdArg)
    : rows;

  if (bookIdArg && filtered.length === 0) {
    throw new Error(`No published book found for --book-id=${bookIdArg}`);
  }

  return limit > 0 ? filtered.slice(0, limit) : filtered;
}

async function writeCsv(rows: SuggestionRow[]) {
  await fs.mkdir(outputPath.split("/").slice(0, -1).join("/") || ".", {
    recursive: true,
  });
  const csv = stringify(rows, {
    header: true,
    columns: [
      "book_id",
      "slug",
      "title",
      "existing_tags",
      "suggested_theme_tags",
      "suggested_geo_tags",
      "merged_tags",
      "changed",
    ],
  });
  await fs.writeFile(outputPath, csv, "utf8");
}

async function main() {
  if (argSet.has("--self-check")) {
    runBookTagSuggestSelfCheck();
    console.log("Self-check passed.");
    return;
  }

  const targets = await getPublishedBooks();
  console.log(
    `Found ${targets.length} published book(s) to ${isDryRun ? "preview" : "update"}.`,
  );

  const csvRows: SuggestionRow[] = [];
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const batchTotal = Math.ceil(targets.length / BATCH_SIZE);
    console.log(`Batch ${batchNum}/${batchTotal} (${batch.length} books)...`);

    let suggestions: Map<string, { themeTags: string[]; geoTags: string[] }>;
    try {
      suggestions = await suggestTagsForBatch(batch);
    } catch (error) {
      errors += batch.length;
      console.error(`Batch ${batchNum} failed:`, error);
      continue;
    }

    for (const book of batch) {
      const suggestion = suggestions.get(book.id) ?? {
        themeTags: [],
        geoTags: [],
      };
      const merged = mergeBookTags(
        book.tags,
        suggestion.themeTags,
        suggestion.geoTags,
      );
      const changed = !tagsEqual(book.tags, merged);

      const row: SuggestionRow = {
        book_id: book.id,
        slug: book.slug,
        title: book.title,
        existing_tags: (book.tags ?? []).join("; "),
        suggested_theme_tags: suggestion.themeTags.join("; "),
        suggested_geo_tags: suggestion.geoTags.join("; "),
        merged_tags: merged.join("; "),
        changed: changed ? "yes" : "no",
      };
      csvRows.push(row);

      if (isDryRun) {
        if (changed) {
          console.log(
            `[dry-run] ${book.slug}: +${suggestion.themeTags.join(", ") || "(none)"} theme, +${suggestion.geoTags.join(", ") || "(none)"} geo`,
          );
        }
        continue;
      }

      if (!changed) {
        unchanged++;
        continue;
      }

      await db
        .update(books)
        .set({ tags: merged })
        .where(eq(books.id, book.id));

      updated++;
      console.log(`[updated] ${book.slug} -> ${merged.join(", ")}`);
    }

    if (i + BATCH_SIZE < targets.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  await writeCsv(csvRows);
  console.log(`Wrote ${csvRows.length} row(s) to ${outputPath}`);

  if (isDryRun) {
    const changedCount = csvRows.filter((row) => row.changed === "yes").length;
    console.log(
      `Dry run complete. ${changedCount} book(s) would change. Re-run with --write to persist.`,
    );
  } else {
    console.log(
      `Done. Updated ${updated} book(s), ${unchanged} unchanged, ${errors} error(s).`,
    );
  }
}

main().catch((error) => {
  console.error("Failed to suggest book tags:", error);
  process.exit(1);
});
