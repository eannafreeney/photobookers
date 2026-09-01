import { toUtcStartOfDay } from "../../lib/utils";

const DEFAULT_MAX_CHARS = 220;

type InterviewWithQuote = {
  id: string;
  answers?: { q1?: string | null } | null;
};

/**
 * One homepage interview per UTC day. Prefers answers with a pull-quote, then
 * walks a stable id order so the slot rotates instead of always showing newest.
 */
export function pickDailyInterview<T extends InterviewWithQuote>(
  interviews: T[],
  day: Date = new Date(),
): T | undefined {
  if (interviews.length === 0) return undefined;
  const quoted = interviews.filter((row) => row.answers?.q1?.trim());
  const pool = (quoted.length > 0 ? quoted : interviews).toSorted((a, b) =>
    a.id.localeCompare(b.id),
  );
  const utcDay = Math.floor(toUtcStartOfDay(day).getTime() / 86_400_000);
  return pool[utcDay % pool.length];
}

/**
 * First readable chunk of an interview answer, cut on a sentence when one ends
 * near the limit and on a word otherwise, so a pull-quote never stops mid-word.
 */
export function interviewPullQuote(
  answer: string | null | undefined,
  maxChars: number = DEFAULT_MAX_CHARS,
): string | null {
  const text = answer?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= maxChars) return text;

  const window = text.slice(0, maxChars);

  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? "),
  );
  if (sentenceEnd >= maxChars * 0.5) {
    return window.slice(0, sentenceEnd + 1);
  }

  const wordEnd = window.lastIndexOf(" ");
  const cut = wordEnd > 0 ? window.slice(0, wordEnd) : window;
  return `${trimDanglingWords(cut).replace(/[,;:]$/, "")}…`;
}

/** "responding instinctively and emotionally to a" → drop the dangling tail. */
const DANGLING_WORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "at",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "of",
  "on",
  "or",
  "that",
  "the",
  "to",
  "with",
]);

function trimDanglingWords(text: string): string {
  const words = text.split(" ");
  while (
    words.length > 1 &&
    DANGLING_WORDS.has(words[words.length - 1]!.toLowerCase())
  ) {
    words.pop();
  }
  return words.join(" ");
}
