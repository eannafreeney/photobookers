const DEFAULT_MAX_CHARS = 220;
function interviewPullQuote(answer, maxChars = DEFAULT_MAX_CHARS) {
  const text = answer?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= maxChars) return text;
  const window = text.slice(0, maxChars);
  const sentenceEnd = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("! "),
    window.lastIndexOf("? ")
  );
  if (sentenceEnd >= maxChars * 0.5) {
    return window.slice(0, sentenceEnd + 1);
  }
  const wordEnd = window.lastIndexOf(" ");
  const cut = wordEnd > 0 ? window.slice(0, wordEnd) : window;
  return `${trimDanglingWords(cut).replace(/[,;:]$/, "")}\u2026`;
}
const DANGLING_WORDS = /* @__PURE__ */ new Set([
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
  "with"
]);
function trimDanglingWords(text) {
  const words = text.split(" ");
  while (words.length > 1 && DANGLING_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  return words.join(" ");
}
export {
  interviewPullQuote
};
