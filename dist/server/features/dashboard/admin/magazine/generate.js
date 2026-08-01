import { z } from "zod";
import { err, ok } from "../../../../lib/result.js";
import { retrieveCandidates } from "./retrieval.js";
const MODEL = process.env.OPENAI_MAGAZINE_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o";
async function chatJSON(schema, system, user, temperature) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return err({ reason: "OPENAI_API_KEY is not set" });
  }
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("magazine generate", response.status, detail);
      return err({ reason: `OpenAI request failed (${response.status})` });
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return err({ reason: "OpenAI returned no content" });
    let raw;
    try {
      raw = JSON.parse(content);
    } catch {
      return err({ reason: "OpenAI returned invalid JSON" });
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      console.error(
        "magazine generate: response failed validation",
        `model=${MODEL}`,
        parsed.error.issues
      );
      return err({
        reason: `The model (${MODEL}) returned an unexpected shape \u2014 check OPENAI_MAGAZINE_MODEL, then try again.`
      });
    }
    return ok(parsed.data);
  } catch (error) {
    console.error("magazine generate", error);
    return err({ reason: "OpenAI request errored or returned invalid JSON" });
  }
}
const themeResponseSchema = z.object({
  theme: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  kicker: z.string().min(1),
  editorsLetter: z.array(z.string().min(1)).min(1),
  facets: z.array(z.string().min(1)).min(3)
});
const curationResponseSchema = z.object({
  books: z.array(
    z.object({
      bookId: z.string().min(1),
      blurb: z.string().min(1),
      artistPrompt: z.string().optional()
    })
  ).min(1)
});
const replacementResponseSchema = z.object({
  bookId: z.string().min(1),
  blurb: z.string().min(1),
  artistPrompt: z.string().optional()
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
  "facets": ["8-15 lowercase search keywords that would plausibly appear in a matching photobook's title, description or tags \u2014 mix the theme's concrete nouns, synonyms and settings"]
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
async function generateTheme(seed, usedThemes) {
  const avoid = usedThemes.length > 0 ? `

Avoid repeating these existing issues:
- ${usedThemes.join("\n- ")}` : "";
  const direction = seed?.trim() ? `The theme should relate to: "${seed.trim()}".` : `Surprise me with a strong theme.`;
  return chatJSON(themeResponseSchema, THEME_SYSTEM, `${direction}${avoid}`, 0.9);
}
async function curate(theme, candidates) {
  const list = candidates.map(
    (c) => `id: ${c.id}
title: ${c.title}
artist: ${c.artist ?? "unknown"}
tags: ${c.tags.join(", ")}
about: ${c.description.replace(/\s+/g, " ").slice(0, 240)}`
  ).join("\n---\n");
  const user = `THEME: ${theme.title} \u2014 ${theme.theme}
SUBTITLE: ${theme.subtitle}

CANDIDATE BOOKS (choose 12-15 by id):
${list}`;
  return chatJSON(curationResponseSchema, CURATE_SYSTEM, user, 0.7);
}
async function generateIssue(options = {}) {
  const [themeErr, theme] = await generateTheme(
    options.seed,
    options.usedThemes ?? []
  );
  if (themeErr) return err(themeErr);
  const candidates = await retrieveCandidates(
    theme.facets,
    options.candidateLimit ?? 40
  );
  if (candidates.length < 8) {
    return err({
      reason: `Only ${candidates.length} candidate books matched \u2014 theme too narrow, try another.`
    });
  }
  const [curateErr, curation] = await curate(theme, candidates);
  if (curateErr) return err(curateErr);
  const candidateById = new Map(candidates.map((c) => [c.id, c]));
  const valid = curation.books.filter((b) => candidateById.has(b.bookId));
  const seen = /* @__PURE__ */ new Set();
  const ordered = valid.filter(
    (b) => seen.has(b.bookId) ? false : seen.add(b.bookId)
  );
  if (ordered.length < 8) {
    return err({
      reason: `Curation returned only ${ordered.length} valid books \u2014 try generating again.`
    });
  }
  const books = ordered.map((b, index) => ({
    ...b,
    sortOrder: index,
    candidate: candidateById.get(b.bookId)
  }));
  return ok({
    model: MODEL,
    seed: options.seed ?? null,
    theme,
    books,
    candidateCount: candidates.length
  });
}
const REPLACE_SYSTEM = `You are re-curating ONE slot of a Photobookers magazine issue. From the REAL candidate list, pick exactly one replacement book \u2014 referenced by its exact "id", never invented \u2014 that best fits the issue theme. Favour a book that genuinely strengthens the issue, not just a near-duplicate of what it replaces.

Return ONLY JSON:
{
  "bookId": "<exact id from the list>",
  "blurb": "90-130 words presenting the book within the theme",
  "artistPrompt": "one short question inviting the artist to respond"
}`;
const BLURB_SYSTEM = `You write for Photobookers magazine. Rewrite the blurb for ONE book within the issue theme. 90-130 words, literary but concrete, present tense, no clich\xE9s. Do not invent facts about the book beyond what is provided.

Return ONLY JSON: { "blurb": "90-130 words" }`;
function formatCandidate(c) {
  return `id: ${c.id}
title: ${c.title}
artist: ${c.artist ?? "unknown"}
tags: ${c.tags.join(", ")}
about: ${c.description.replace(/\s+/g, " ").slice(0, 240)}`;
}
function themeBlock(issue) {
  return `THEME: ${issue.title} \u2014 ${issue.theme ?? ""}
SUBTITLE: ${issue.subtitle ?? ""}`;
}
const STOPWORDS = /* @__PURE__ */ new Set([
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
  "books"
]);
function tokenize(text) {
  return (text.toLowerCase().match(/[a-z]{4,}/g) ?? []).filter(
    (w) => !STOPWORDS.has(w)
  );
}
function issueFacets(issue) {
  const tags = issue.placements.flatMap(
    (p) => (p.book?.tags ?? []).map((t) => t.toLowerCase())
  );
  const words = [...tokenize(issue.title), ...tokenize(issue.subtitle ?? "")];
  return [.../* @__PURE__ */ new Set([...tags, ...words])];
}
async function findReplacementForBook(issue, bookId) {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return err({ reason: "Book is not in this issue" });
  const facets = issueFacets(issue);
  if (facets.length === 0) {
    return err({ reason: "Not enough theme signal to find a replacement" });
  }
  const currentIds = new Set(issue.placements.map((p) => p.bookId));
  const candidates = (await retrieveCandidates(facets, 60)).filter(
    (c) => !currentIds.has(c.id)
  );
  if (candidates.length === 0) {
    return err({ reason: "No alternative books matched this issue's theme" });
  }
  const user = `${themeBlock(issue)}

CANDIDATE BOOKS (choose ONE by id):
${candidates.map(formatCandidate).join("\n---\n")}`;
  const [error, pick] = await chatJSON(
    replacementResponseSchema,
    REPLACE_SYSTEM,
    user,
    0.6
  );
  if (error) return err(error);
  if (!candidates.some((c) => c.id === pick.bookId) || currentIds.has(pick.bookId)) {
    return err({ reason: "AI returned an invalid replacement \u2014 try again" });
  }
  return ok({
    bookId: pick.bookId,
    blurb: pick.blurb,
    artistPrompt: pick.artistPrompt ?? null
  });
}
const TITLE_SYSTEM = `You are the editor of Photobookers magazine. Given an existing issue's theme, invent ONE fresh, evocative issue TITLE (1-4 words) that fits the SAME theme. Do not change the theme \u2014 only the title. The new title must be clearly different from the current one.

Return ONLY JSON: { "title": "short evocative issue title (1-4 words)" }`;
const titleResponseSchema = z.object({ title: z.string().min(1) });
async function regenerateTitle(issue) {
  const user = `THEME: ${issue.theme ?? issue.title}
SUBTITLE: ${issue.subtitle ?? ""}
CURRENT TITLE (do not reuse): ${issue.title}`;
  return chatJSON(titleResponseSchema, TITLE_SYSTEM, user, 0.9);
}
async function regenerateBlurbForBook(issue, bookId) {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return err({ reason: "Book is not in this issue" });
  if (!placement.book) return err({ reason: "Book details unavailable" });
  const book = placement.book;
  const user = `${themeBlock(issue)}

BOOK:
title: ${book.title}
artist: ${book.artist?.displayName ?? "unknown"}
tags: ${(book.tags ?? []).join(", ")}`;
  return chatJSON(blurbResponseSchema, BLURB_SYSTEM, user, 0.7);
}
export {
  curate,
  findReplacementForBook,
  generateIssue,
  generateTheme,
  regenerateBlurbForBook,
  regenerateTitle
};
