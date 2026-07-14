import type { MagazineMovementData } from "@/db/schema";
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
  editorsLetterTitle: string;
  editorsLetter: string[];
  facets: string[];
};

export type GeneratedBook = {
  bookId: string;
  movementId: string;
  blurb: string;
  artistPrompt?: string;
};

export type GeneratedCuration = {
  movements: MagazineMovementData[];
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
  movements: MagazineMovementData[];
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
    return ok(JSON.parse(content) as T);
  } catch (error) {
    console.error("magazine generate", error);
    return err({ reason: "OpenAI request errored or returned invalid JSON" });
  }
}

const THEME_SYSTEM = `You are the editor of Photobookers, a magazine that curates published photobooks into monthly themed issues. Invent ONE fresh, specific, evocative theme for a new issue about a subject or world that runs across many photobooks (e.g. night, water, labour, the domestic interior, ritual).

Return ONLY JSON with this shape:
{
  "theme": "one sentence describing the concept",
  "title": "short evocative issue title (1-4 words)",
  "subtitle": "one line, ~10 words",
  "kicker": "e.g. 'New issue'",
  "editorsLetterTitle": "short title for the editor's letter",
  "editorsLetter": ["2-3 short paragraphs, literary but concrete, second person welcome"],
  "facets": ["8-15 lowercase search keywords that would plausibly appear in a matching photobook's title, description or tags — mix the theme's concrete nouns, synonyms and settings"]
}
Do not mention specific books or photographers. Keep facets broad enough to retrieve dozens of books.`;

const CURATE_SYSTEM = `You are curating one issue of Photobookers magazine from a list of REAL candidate photobooks. You may ONLY use books from the provided list, referenced by their exact "id". Never invent a book or an id.

Select the 12-15 books that best fit the theme (the admin will trim further). Group them into exactly 3 movements that tell a small argument about the theme.

Return ONLY JSON:
{
  "movements": [
    { "id": "kebab-case-id", "kicker": "Movement I", "lead": "short accent phrase ending with a period.", "title": "the rest of the heading", "paragraphs": ["1-2 short paragraphs"] }
  ],
  "books": [
    { "bookId": "<exact id from the list>", "movementId": "<one of the movement ids>", "blurb": "40-60 words presenting the book within the theme", "artistPrompt": "one short question inviting the artist to respond (optional)" }
  ]
}
Every book's movementId must match a movement id. Order books by movement, strongest first.`;

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
  return chatJSON<GeneratedTheme>(THEME_SYSTEM, `${direction}${avoid}`, 0.9);
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
  return chatJSON<GeneratedCuration>(CURATE_SYSTEM, user, 0.7);
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
  const movementOrder = new Map(
    curation.movements.map((m, index) => [m.id, index]),
  );

  // Keep only books that reference a real candidate id and a real movement.
  const valid = curation.books.filter(
    (b) => candidateById.has(b.bookId) && movementOrder.has(b.movementId),
  );
  // De-dupe by book, order by movement then given order.
  const seen = new Set<string>();
  const ordered = valid
    .filter((b) => (seen.has(b.bookId) ? false : seen.add(b.bookId)))
    .sort(
      (a, b) =>
        (movementOrder.get(a.movementId) ?? 0) -
        (movementOrder.get(b.movementId) ?? 0),
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
    movements: curation.movements,
    books,
    candidateCount: candidates.length,
  });
}
