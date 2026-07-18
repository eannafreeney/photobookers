import { z } from "zod";
import type { MagazineIssueView } from "@/domain/magazine/queries";
import { err, ok, type Result } from "@/lib/result";
import { retrieveCandidates, type CandidateBook } from "./retrieval";

// A stronger model than the spotlight-blurb default: the curation step needs
// judgement + structure, not just a rephrase. Configurable, falls back to the
// shared model, then to a sensible default.
const MODEL =
  process.env.OPENAI_MAGAZINE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";

export type GeneratedTheme = {
  theme: string;
  title: string;
  subtitle: string;
  kicker: string;
  editorsLetter: string[];
  facets: string[];
};

export type GeneratedBook = {
  bookId: string;
  blurb: string;
  artistPrompt?: string;
};

export type GeneratedCuration = {
  books: GeneratedBook[];
};

export type GeneratedIssueBook = GeneratedBook & {
  sortOrder: number;
  candidate: CandidateBook;
};

export type GeneratedIssue = {
  model: string;
  seed: string | null;
  theme: GeneratedTheme;
  books: GeneratedIssueBook[];
  candidateCount: number;
};

type GenerateOptions = {
  /** Optional theme direction from the admin ("night", "water"…). */
  seed?: string | null;
  /** Existing issue titles/themes to avoid repeating. */
  usedThemes?: string[];
  /** How many candidates to retrieve for curation. */
  candidateLimit?: number;
};

async function chatJSON<T>(
  schema: z.ZodType<T>,
  system: string,
  user: string,
  temperature: number,
): Promise<Result<T, { reason: string }>> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return err({ reason: "OPENAI_API_KEY is not set" });
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("magazine generate", response.status, detail);
      return err({ reason: `OpenAI request failed (${response.status})` });
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return err({ reason: "OpenAI returned no content" });

    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      return err({ reason: "OpenAI returned invalid JSON" });
    }
    // Validate the shape so a weaker/mis-configured model (e.g. a missing
    // OPENAI_MAGAZINE_MODEL falling back to a mini model) fails loudly here
    // instead of silently saving an issue with empty editorial fields.
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "magazine generate: response failed validation",
        `model=${MODEL}`,
        parsed.error.issues,
      );
      return err({
        reason: `The model (${MODEL}) returned an unexpected shape — check OPENAI_MAGAZINE_MODEL, then try again.`,
      });
    }
    return ok(parsed.data);
  } catch (error) {
    console.error("magazine generate", error);
    return err({ reason: "OpenAI request errored or returned invalid JSON" });
  }
}

// Response schemas: the exact shape each prompt promises. Strings/arrays are
// required and non-empty so blank editorial content is treated as a failure.
const themeResponseSchema = z.object({
  theme: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  kicker: z.string().min(1),
  editorsLetter: z.array(z.string().min(1)).min(1),
  facets: z.array(z.string().min(1)).min(3),
});

const curationResponseSchema = z.object({
  books: z
    .array(
      z.object({
        bookId: z.string().min(1),
        blurb: z.string().min(1),
        artistPrompt: z.string().optional(),
      }),
    )
    .min(1),
});

const replacementResponseSchema = z.object({
  bookId: z.string().min(1),
  blurb: z.string().min(1),
  artistPrompt: z.string().optional(),
});

const blurbResponseSchema = z.object({ blurb: z.string().min(1) });

const THEME_SYSTEM = `You are the editor of Photobookers, a magazine that curates published photobooks into monthly themed issues. Invent ONE fresh, specific, evocative theme for a new issue about a subject or world that runs across many photobooks (e.g. night, water, labour, the domestic interior, ritual).

Return ONLY JSON with this shape:
{
  "theme": "one sentence describing the concept",
  "title": "short evocative issue title (1-4 words)",
  "subtitle": "one line, ~10 words",
  "kicker": "e.g. 'New issue'",
  "editorsLetter": ["2-3 short paragraphs, literary but concrete, second person welcome"],
  "facets": ["8-15 lowercase search keywords that would plausibly appear in a matching photobook's title, description or tags — mix the theme's concrete nouns, synonyms and settings"]
}
Do not mention specific books or photographers. Keep facets broad enough to retrieve dozens of books.`;

const CURATE_SYSTEM = `You are curating one issue of Photobookers magazine from a list of REAL candidate photobooks. You may ONLY use books from the provided list, referenced by their exact "id". Never invent a book or an id.

Select the 12-15 books that best fit the theme (the admin will trim further).

Return ONLY JSON:
{
  "books": [
    { "bookId": "<exact id from the list>", "blurb": "90-130 words presenting the book within the theme: what it shows, how it feels, why it belongs in this issue", "artistPrompt": "one short question inviting the artist to respond (optional)" }
  ]
}
Order books strongest first.`;

export async function generateTheme(
  seed: string | null | undefined,
  usedThemes: string[],
): Promise<Result<GeneratedTheme, { reason: string }>> {
  const avoid =
    usedThemes.length > 0
      ? `\n\nAvoid repeating these existing issues:\n- ${usedThemes.join("\n- ")}`
      : "";
  const direction = seed?.trim()
    ? `The theme should relate to: "${seed.trim()}".`
    : `Surprise me with a strong theme.`;
  return chatJSON(themeResponseSchema, THEME_SYSTEM, `${direction}${avoid}`, 0.9);
}

export async function curate(
  theme: GeneratedTheme,
  candidates: CandidateBook[],
): Promise<Result<GeneratedCuration, { reason: string }>> {
  const list = candidates
    .map(
      (c) =>
        `id: ${c.id}\ntitle: ${c.title}\nartist: ${c.artist ?? "unknown"}\ntags: ${c.tags.join(", ")}\nabout: ${c.description.replace(/\s+/g, " ").slice(0, 240)}`,
    )
    .join("\n---\n");
  const user = `THEME: ${theme.title} — ${theme.theme}\nSUBTITLE: ${theme.subtitle}\n\nCANDIDATE BOOKS (choose 12-15 by id):\n${list}`;
  return chatJSON(curationResponseSchema, CURATE_SYSTEM, user, 0.7);
}

/** Full pipeline: theme → retrieve real books → curate → assembled draft. */
export async function generateIssue(
  options: GenerateOptions = {},
): Promise<Result<GeneratedIssue, { reason: string }>> {
  const [themeErr, theme] = await generateTheme(
    options.seed,
    options.usedThemes ?? [],
  );
  if (themeErr) return err(themeErr);

  const candidates = await retrieveCandidates(
    theme.facets,
    options.candidateLimit ?? 40,
  );
  if (candidates.length < 8) {
    return err({
      reason: `Only ${candidates.length} candidate books matched — theme too narrow, try another.`,
    });
  }

  const [curateErr, curation] = await curate(theme, candidates);
  if (curateErr) return err(curateErr);

  const candidateById = new Map(candidates.map((c) => [c.id, c]));

  // Keep only books that reference a real candidate id.
  const valid = curation.books.filter((b) => candidateById.has(b.bookId));
  // De-dupe by book, keeping the model's given order.
  const seen = new Set<string>();
  const ordered = valid.filter((b) =>
    seen.has(b.bookId) ? false : seen.add(b.bookId),
  );

  if (ordered.length < 8) {
    return err({
      reason: `Curation returned only ${ordered.length} valid books — try generating again.`,
    });
  }

  const books: GeneratedIssueBook[] = ordered.map((b, index) => ({
    ...b,
    sortOrder: index,
    candidate: candidateById.get(b.bookId)!,
  }));

  return ok({
    model: MODEL,
    seed: options.seed ?? null,
    theme,
    books,
    candidateCount: candidates.length,
  });
}

// ---------------------------------------------------------------------------
// Per-book AI actions used by the admin editor: swap one book for a fresh
// catalogue pick, and rewrite a single blurb at the longer length.
// ---------------------------------------------------------------------------

const REPLACE_SYSTEM = `You are re-curating ONE slot of a Photobookers magazine issue. From the REAL candidate list, pick exactly one replacement book — referenced by its exact "id", never invented — that best fits the issue theme. Favour a book that genuinely strengthens the issue, not just a near-duplicate of what it replaces.

Return ONLY JSON:
{
  "bookId": "<exact id from the list>",
  "blurb": "90-130 words presenting the book within the theme",
  "artistPrompt": "one short question inviting the artist to respond"
}`;

const BLURB_SYSTEM = `You write for Photobookers magazine. Rewrite the blurb for ONE book within the issue theme. 90-130 words, literary but concrete, present tense, no clichés. Do not invent facts about the book beyond what is provided.

Return ONLY JSON: { "blurb": "90-130 words" }`;

export type ReplacementResult = {
  bookId: string;
  blurb: string;
  artistPrompt: string | null;
};

function formatCandidate(c: CandidateBook): string {
  return `id: ${c.id}\ntitle: ${c.title}\nartist: ${c.artist ?? "unknown"}\ntags: ${c.tags.join(", ")}\nabout: ${c.description.replace(/\s+/g, " ").slice(0, 240)}`;
}

function themeBlock(issue: MagazineIssueView): string {
  return `THEME: ${issue.title} — ${issue.theme ?? ""}\nSUBTITLE: ${issue.subtitle ?? ""}`;
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "over",
  "under",
  "your",
  "about",
  "photobook",
  "book",
  "books",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter(
    (w) => !STOPWORDS.has(w),
  );
}

/** Retrieval facets for a swap: the issue's own book tags + theme words. */
function issueFacets(issue: MagazineIssueView): string[] {
  const tags = issue.placements.flatMap((p) =>
    (p.book?.tags ?? []).map((t) => t.toLowerCase()),
  );
  const words = [...tokenize(issue.title), ...tokenize(issue.subtitle ?? "")];
  return [...new Set([...tags, ...words])];
}

/** Find a fresh replacement (book + blurb) for one book, grounded in the catalogue. */
export async function findReplacementForBook(
  issue: MagazineIssueView,
  bookId: string,
): Promise<Result<ReplacementResult, { reason: string }>> {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return err({ reason: "Book is not in this issue" });

  const facets = issueFacets(issue);
  if (facets.length === 0) {
    return err({ reason: "Not enough theme signal to find a replacement" });
  }

  const currentIds = new Set(issue.placements.map((p) => p.bookId));
  const candidates = (await retrieveCandidates(facets, 60)).filter(
    (c) => !currentIds.has(c.id),
  );
  if (candidates.length === 0) {
    return err({ reason: "No alternative books matched this issue's theme" });
  }

  const user = `${themeBlock(issue)}\n\nCANDIDATE BOOKS (choose ONE by id):\n${candidates.map(formatCandidate).join("\n---\n")}`;
  const [error, pick] = await chatJSON(
    replacementResponseSchema,
    REPLACE_SYSTEM,
    user,
    0.6,
  );
  if (error) return err(error);

  // Guard against invented ids or re-picking a book already in the issue.
  if (
    !candidates.some((c) => c.id === pick.bookId) ||
    currentIds.has(pick.bookId)
  ) {
    return err({ reason: "AI returned an invalid replacement — try again" });
  }

  return ok({
    bookId: pick.bookId,
    blurb: pick.blurb,
    artistPrompt: pick.artistPrompt ?? null,
  });
}

const TITLE_SYSTEM = `You are the editor of Photobookers magazine. Given an existing issue's theme, invent ONE fresh, evocative issue TITLE (1-4 words) that fits the SAME theme. Do not change the theme — only the title. The new title must be clearly different from the current one.

Return ONLY JSON: { "title": "short evocative issue title (1-4 words)" }`;

const titleResponseSchema = z.object({ title: z.string().min(1) });

/** Generate a fresh title for an issue while keeping its theme unchanged. */
export async function regenerateTitle(
  issue: MagazineIssueView,
): Promise<Result<{ title: string }, { reason: string }>> {
  const user = `THEME: ${issue.theme ?? issue.title}\nSUBTITLE: ${issue.subtitle ?? ""}\nCURRENT TITLE (do not reuse): ${issue.title}`;
  return chatJSON(titleResponseSchema, TITLE_SYSTEM, user, 0.9);
}

/** Rewrite a single book's blurb at the longer length. */
export async function regenerateBlurbForBook(
  issue: MagazineIssueView,
  bookId: string,
): Promise<Result<{ blurb: string }, { reason: string }>> {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return err({ reason: "Book is not in this issue" });
  if (!placement.book) return err({ reason: "Book details unavailable" });

  const book = placement.book;
  const user = `${themeBlock(issue)}\n\nBOOK:\ntitle: ${book.title}\nartist: ${book.artist?.displayName ?? "unknown"}\ntags: ${(book.tags ?? []).join(", ")}`;

  return chatJSON(blurbResponseSchema, BLURB_SYSTEM, user, 0.7);
}
