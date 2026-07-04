import { load } from "cheerio";
import { z } from "zod";

export type CreatorEmailInputRow = {
  artist_name: string;
  book_name?: string;
  profile_url?: string;
  publisher_name?: string;
  publisher_profile_url?: string;
  official_website?: string;
  website?: string;
};

export type CreatorEmailOutputRow = CreatorEmailInputRow & {
  official_website: string;
  email: string;
  email_type: "artist" | "manager" | "gallery" | "publisher" | "unknown";
  source_url: string;
  confidence: "high" | "medium" | "low" | "none";
  notes: string;
};

export type ScrapeResult = {
  website: string;
  websiteNotes: string;
  candidateEmails: string[];
  sourceUrl: string;
  pageSnippets: Array<{ url: string; text: string }>;
  foundOnContactPage: boolean;
};

const BLOCKED_HOST_PATTERNS = [
  /(^|\.)photobookers\.com$/i,
  /(^|\.)instagram\.com$/i,
  /(^|\.)facebook\.com$/i,
  /(^|\.)twitter\.com$/i,
  /(^|\.)x\.com$/i,
  /(^|\.)linkedin\.com$/i,
  /(^|\.)wikipedia\.org$/i,
  /(^|\.)youtube\.com$/i,
  /(^|\.)amazon\./i,
  /(^|\.)goodreads\.com$/i,
  /(^|\.)192\.com$/i,
];

const PLACEHOLDER_EMAILS = new Set([
  "user@domain.com",
  "you@example.com",
  "name@example.com",
  "email@example.com",
  "test@example.com",
]);
const USER_AGENT =
  "Mozilla/5.0 (compatible; PhotobookersEmailResearch/1.0; +https://photobookers.com)";

type EmailPick = Pick<
  CreatorEmailOutputRow,
  "email" | "email_type" | "confidence" | "source_url" | "notes"
>;
const MAX_PAGES_PER_SITE = 10;
const MAX_SNIPPET_CHARS = 2500;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const OBFUSCATED_EMAIL_REGEX =
  /([A-Z0-9._%+-]+)\s*(?:\(|\[)?\s*at\s*(?:\)|\])?\s*([A-Z0-9.-]+)\s*(?:\(|\[)?\s*dot\s*(?:\)|\])?\s*([A-Z]{2,})/gi;

const llmRowSchema = z.object({
  email: z.string().default(""),
  email_type: z
    .enum(["artist", "manager", "gallery", "publisher", "unknown"])
    .default("unknown"),
  confidence: z.enum(["high", "medium", "low", "none"]).default("none"),
  source_url: z.string().default(""),
  notes: z.string().default(""),
});

const llmResponseSchema = z.object({
  result: llmRowSchema,
});

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeUrl(input?: string): string | null {
  if (!input) return null;
  try {
    return new URL(
      input.startsWith("http") ? input : `https://${input}`,
    ).toString();
  } catch {
    return null;
  }
}

function resolveDuckDuckGoUrl(rawHref: string): string | null {
  const normalized = normalizeUrl(rawHref);
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (
      url.hostname.endsWith("duckduckgo.com") &&
      url.pathname.startsWith("/l/")
    ) {
      const uddg = url.searchParams.get("uddg");
      if (uddg) {
        return normalizeUrl(decodeURIComponent(uddg));
      }
    }
  } catch {
    return normalized;
  }

  return normalized;
}

function getHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function getDomain(url: string): string | null {
  return getHost(url);
}

function isBlockedHost(host: string): boolean {
  return BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

function isBlockedUrl(url: string): boolean {
  const host = getHost(url);
  return !host || isBlockedHost(host);
}

export function isPlaceholderEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized || PLACEHOLDER_EMAILS.has(normalized)) return true;
  const domain = normalized.split("@")[1] || "";
  return (
    domain === "example.com" ||
    domain === "example.org" ||
    domain === "domain.com" ||
    domain.endsWith(".example")
  );
}

function artistNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3);
}

function sharedHostNamePrefix(host: string, artistName: string): number {
  const lastName = artistNameTokens(artistName).at(-1) || "";
  const normalizedHost = host.replace(/[^a-z0-9]/g, "");
  if (!lastName || !normalizedHost) return 0;

  const max = Math.min(lastName.length, normalizedHost.length);
  for (let len = max; len >= 3; len--) {
    const hostPrefix = normalizedHost.slice(0, len);
    const namePrefix = lastName.slice(0, len);
    if (hostPrefix === namePrefix) return len;
  }
  return 0;
}

function isBookstoreProductUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      /\/products?\//.test(path) ||
      /\/books?\//.test(path) ||
      /\/shop\//.test(path)
    );
  } catch {
    return false;
  }
}

function hostMatchesArtist(host: string, artistName: string): boolean {
  const normalizedHost = host.replace(/[^a-z0-9]/g, "");
  const tokens = artistNameTokens(artistName);
  if (tokens.length === 0) return false;
  const matched = tokens.filter((token) => normalizedHost.includes(token));
  return matched.length >= Math.min(2, tokens.length);
}

function scoreWebsiteCandidate(
  url: string,
  html: string,
  row: CreatorEmailInputRow,
): number {
  const host = getHost(url);
  if (!host || isBlockedHost(host)) return -1;

  const lower = html.toLowerCase();
  const nameParts = row.artist_name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const hasName = nameParts.every((part) => lower.includes(part));
  const hasBook = row.book_name
    ? lower.includes(row.book_name.toLowerCase())
    : false;

  let score = 0;
  if (hostMatchesArtist(host, row.artist_name)) score += 5;
  if (sharedHostNamePrefix(host, row.artist_name) >= 3) score += 4;
  if (hasName) score += 2;
  if (hasBook) score += 1;
  if (/(contact|about|portfolio|photography|gallery)/i.test(host)) score += 1;
  if (isBookstoreProductUrl(url)) score -= 4;
  if (matchesPublisherIdentity(host, row.publisher_name)) score -= 4;
  return score;
}

function knownWebsiteFromRow(row: CreatorEmailInputRow): string | null {
  for (const value of [row.official_website, row.website]) {
    const url = normalizeUrl(value);
    if (url && !isBlockedUrl(url)) return url;
  }
  return null;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": USER_AGENT },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function extractEmails(html: string): string[] {
  const emails = new Set<string>();
  const $ = load(html);

  for (const match of html.match(EMAIL_REGEX) || []) {
    const email = match.trim().toLowerCase();
    if (
      !email.endsWith(".png") &&
      !email.endsWith(".jpg") &&
      !email.endsWith(".webp") &&
      !isPlaceholderEmail(email)
    ) {
      emails.add(email);
    }
  }

  for (const match of html.matchAll(OBFUSCATED_EMAIL_REGEX)) {
    const local = match[1]?.trim().toLowerCase();
    const domain = match[2]?.trim().toLowerCase();
    const tld = match[3]?.trim().toLowerCase();
    if (local && domain && tld) {
      emails.add(`${local}@${domain}.${tld}`);
    }
  }

  $("a[href^='mailto:']").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    const addr = href
      .replace(/^mailto:/i, "")
      .split("?")[0]
      .trim()
      .toLowerCase();
    if (addr && !isPlaceholderEmail(addr)) emails.add(addr);
  });

  return Array.from(emails);
}

function extractRelevantLinks(baseUrl: string, html: string): string[] {
  const $ = load(html);
  const links = new Set<string>();
  const keywords = [
    "contact",
    "about",
    "info",
    "bio",
    "imprint",
    "legal",
    "impressum",
  ];

  $("a[href]").each((_, el) => {
    const href = ($(el).attr("href") || "").trim();
    if (!href) return;
    const lower = href.toLowerCase();
    if (!keywords.some((keyword) => lower.includes(keyword))) return;

    try {
      links.add(new URL(href, baseUrl).toString());
    } catch {
      // ignore invalid URLs
    }
  });

  return Array.from(links).slice(0, MAX_PAGES_PER_SITE - 1);
}

function guessedContactLinks(website: string): string[] {
  const paths = [
    "/contact",
    "/about",
    "/info",
    "/impressum",
    "/legal",
    "/contact-us",
  ];
  const links = new Set<string>();
  for (const path of paths) {
    try {
      links.add(new URL(path, website).toString());
    } catch {
      // ignore invalid urls
    }
  }
  return Array.from(links);
}

function pageTextSnippet(html: string): string {
  const $ = load(html);
  $("script, style, noscript").remove();
  return ($("body").text() || $.root().text())
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SNIPPET_CHARS);
}

export async function findWebsite(
  row: CreatorEmailInputRow,
): Promise<{ website: string; notes: string }> {
  const knownWebsite = knownWebsiteFromRow(row);
  if (knownWebsite) {
    const html = await fetchHtml(knownWebsite);
    if (html) {
      return { website: knownWebsite, notes: "Using known website from export" };
    }
  }

  const queries = [
    [row.artist_name, "photographer", "contact", "-photobookers"]
      .filter(Boolean)
      .join(" "),
    [row.artist_name, row.book_name, "official website", "photographer"]
      .filter(Boolean)
      .join(" "),
    [row.artist_name, row.book_name, "contact"].filter(Boolean).join(" "),
  ];

  let best: { website: string; score: number } | null = null;

  for (const query of queries) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const searchHtml = await fetchHtml(searchUrl);
    if (!searchHtml) continue;

    const $ = load(searchHtml);
    const candidates: string[] = [];
    $("a.result__a").each((_, el) => {
      const href = ($(el).attr("href") || "").trim();
      const url = resolveDuckDuckGoUrl(href);
      if (url && !isBlockedUrl(url)) candidates.push(url);
    });

    for (const candidate of candidates.slice(0, 10)) {
      const html = await fetchHtml(candidate);
      if (!html) continue;

      const score = scoreWebsiteCandidate(candidate, html, row);
      if (score < 2) {
        await sleep(120);
        continue;
      }

      if (!best || score > best.score) {
        best = { website: candidate, score };
      }

      if (score >= 5) {
        return { website: candidate, notes: "Website found via search" };
      }

      await sleep(120);
    }
  }

  if (best) {
    return { website: best.website, notes: "Website found via search (weak match)" };
  }

  return { website: "", notes: "No confident website match" };
}

export function classifyEmail(email: string): CreatorEmailOutputRow["email_type"] {
  const local = email.split("@")[0] || "";
  if (/(booking|management|manager|agent)/i.test(local)) return "manager";
  if (/(gallery|studio)/i.test(local)) return "gallery";
  if (/(press|media|pr)/i.test(local)) return "publisher";
  return "artist";
}

function normalizeDomainForMatch(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeNameTokens(name: string): string[] {
  const stopwords = new Set([
    "press",
    "books",
    "book",
    "publishing",
    "publisher",
    "editions",
    "edition",
    "photo",
    "photography",
    "studio",
    "gallery",
  ]);

  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 6 && !stopwords.has(token));
}

function matchesPublisherIdentity(
  hostOrDomain: string,
  publisherName?: string,
): boolean {
  if (!publisherName?.trim()) return false;
  const normalizedDomain = normalizeDomainForMatch(hostOrDomain);
  const compactPublisher = publisherName
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/g, "");
  if (
    compactPublisher.length >= 6 &&
    normalizedDomain.includes(compactPublisher)
  ) {
    return true;
  }

  const tokens = normalizeNameTokens(publisherName);
  return tokens.some((token) => normalizedDomain.includes(token));
}

export function pickEmailHeuristic(
  emails: string[],
  website: string,
  publisherName?: string,
  options: { foundOnContactPage?: boolean } = {},
): Pick<
  CreatorEmailOutputRow,
  "email" | "email_type" | "confidence" | "notes"
> {
  const filteredEmails = emails.filter((email) => {
    if (isPlaceholderEmail(email)) return false;
    const domain = email.split("@")[1] || "";
    return !matchesPublisherIdentity(domain, publisherName);
  });

  if (filteredEmails.length === 0 && emails.length > 0) {
    return {
      email: "",
      email_type: "unknown",
      confidence: "none",
      notes: "All found emails matched publisher identity and were excluded",
    };
  }

  if (filteredEmails.length === 0) {
    return {
      email: "",
      email_type: "unknown",
      confidence: "none",
      notes: "No email found on checked pages",
    };
  }

  const domain = getDomain(website);
  const domainMatch = domain
    ? filteredEmails.find((email) => email.split("@")[1]?.includes(domain))
    : undefined;
  const chosen = domainMatch || filteredEmails[0];
  const confidence: CreatorEmailOutputRow["confidence"] = domainMatch
    ? "high"
    : options.foundOnContactPage
      ? "high"
      : "medium";

  return {
    email: chosen,
    email_type: classifyEmail(chosen),
    confidence,
    notes: domainMatch
      ? "Heuristic: email domain matches website domain"
      : options.foundOnContactPage
        ? "Heuristic: email found on contact/about page"
        : "Heuristic: email found but domain does not match website",
  };
}

async function collectEmailsFromSite(
  website: string,
): Promise<{
  emails: string[];
  sourceUrl: string;
  pageSnippets: Array<{ url: string; text: string }>;
  foundOnContactPage: boolean;
}> {
  const root = await fetchHtml(website);
  if (!root) {
    return {
      emails: [],
      sourceUrl: "",
      pageSnippets: [],
      foundOnContactPage: false,
    };
  }

  const pages = [
    website,
    ...extractRelevantLinks(website, root),
    ...guessedContactLinks(website),
  ].slice(0, MAX_PAGES_PER_SITE);

  const found = new Set<string>();
  const pageSnippets: Array<{ url: string; text: string }> = [];
  let sourceUrl = website;
  let foundOnContactPage = false;

  for (const pageUrl of pages) {
    const html = await fetchHtml(pageUrl);
    if (!html) continue;

    const emails = extractEmails(html);
    const isContactPage = /\/(contact|about|info|impressum|legal)(\/|$)/i.test(
      new URL(pageUrl).pathname,
    );
    if (isContactPage && emails.length > 0) {
      foundOnContactPage = true;
      sourceUrl = pageUrl;
    } else if (emails.length > 0 && !sourceUrl) {
      sourceUrl = pageUrl;
    }
    emails.forEach((email) => found.add(email));

    const text = pageTextSnippet(html);
    if (text.length > 80) {
      pageSnippets.push({ url: pageUrl, text });
    }

    await sleep(120);
  }

  return {
    emails: Array.from(found),
    sourceUrl,
    pageSnippets: pageSnippets.slice(0, 5),
    foundOnContactPage,
  };
}

export async function scrapeCreatorEmailContext(
  row: CreatorEmailInputRow,
): Promise<ScrapeResult> {
  const foundSite = await findWebsite(row);
  if (!foundSite.website) {
    return {
      website: "",
      websiteNotes: foundSite.notes,
      candidateEmails: [],
      sourceUrl: "",
      pageSnippets: [],
      foundOnContactPage: false,
    };
  }

  const emailData = await collectEmailsFromSite(foundSite.website);
  return {
    website: foundSite.website,
    websiteNotes: foundSite.notes,
    candidateEmails: emailData.emails,
    sourceUrl: emailData.sourceUrl,
    pageSnippets: emailData.pageSnippets,
    foundOnContactPage: emailData.foundOnContactPage,
  };
}

export function mergeEmailPick(
  heuristic: Pick<
    CreatorEmailOutputRow,
    "email" | "email_type" | "confidence" | "notes"
  >,
  ai: EmailPick,
  sourceUrl: string,
): EmailPick {
  if (ai.email) {
    return {
      email: ai.email,
      email_type: ai.email_type,
      confidence: ai.confidence,
      source_url: ai.source_url || sourceUrl,
      notes: ai.notes,
    };
  }

  if (heuristic.email && heuristic.confidence !== "none") {
    return {
      email: heuristic.email,
      email_type: heuristic.email_type,
      confidence: heuristic.confidence,
      source_url: sourceUrl,
      notes: heuristic.notes,
    };
  }

  return {
    email: "",
    email_type: "unknown",
    confidence: "none",
    source_url: sourceUrl,
    notes: ai.notes || heuristic.notes,
  };
}

export function emailAppearsInScrapedContent(
  email: string,
  candidateEmails: string[],
  pageSnippets: Array<{ url: string; text: string }>,
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;

  if (candidateEmails.includes(normalized)) return true;

  for (const snippet of pageSnippets) {
    if (snippet.text.toLowerCase().includes(normalized)) return true;
    if (extractEmails(snippet.text).includes(normalized)) return true;
  }

  return false;
}

export function buildEmailSuggestPrompt(params: {
  row: CreatorEmailInputRow;
  scrape: ScrapeResult;
}): string {
  const { row, scrape } = params;
  const snippetBlocks = scrape.pageSnippets
    .map(
      (snippet) =>
        `[page=${snippet.url}]\n${snippet.text}`,
    )
    .join("\n\n");

  return `Pick the best outreach email for a photobook artist profile.

Artist: ${row.artist_name}
Book: ${row.book_name ?? "(unknown)"}
Publisher: ${row.publisher_name ?? "(unknown)"}
Official website: ${scrape.website || "(not found)"}
Candidate emails found by scraper: ${scrape.candidateEmails.join(", ") || "(none)"}

Rules:
- Return email ONLY if it literally appears in the candidate list or in the page excerpts below.
- Never invent or guess an email address.
- Prefer direct artist contact over gallery/manager when both exist.
- Exclude publisher-owned emails when the artist has their own contact.
- If no reliable email exists, return an empty email and confidence "none".
- email_type must be one of: artist, manager, gallery, publisher, unknown.
- confidence must be one of: high, medium, low, none.

Return JSON only:
{"result":{"email":"","email_type":"unknown","confidence":"none","source_url":"","notes":""}}

Page excerpts:
${snippetBlocks || "(no page text captured)"}`;
}

export async function suggestEmailWithAi(params: {
  row: CreatorEmailInputRow;
  scrape: ScrapeResult;
  apiKey: string;
  model: string;
}): Promise<Pick<
  CreatorEmailOutputRow,
  "email" | "email_type" | "confidence" | "source_url" | "notes"
>> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.model,
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You choose outreach emails for photographers. Only return emails that appear in provided evidence. Respond with valid JSON only.",
        },
        {
          role: "user",
          content: buildEmailSuggestPrompt({
            row: params.row,
            scrape: params.scrape,
          }),
        },
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

  const validated = llmResponseSchema.parse(parsed).result;
  const email = validated.email.trim().toLowerCase();

  if (
    email &&
    !emailAppearsInScrapedContent(
      email,
      params.scrape.candidateEmails,
      params.scrape.pageSnippets,
    )
  ) {
    return {
      email: "",
      email_type: "unknown",
      confidence: "none",
      source_url: "",
      notes: `AI suggestion rejected (not in scraped evidence): ${validated.notes}`,
    };
  }

  return {
    email,
    email_type: email ? validated.email_type : "unknown",
    confidence: email ? validated.confidence : "none",
    source_url: validated.source_url || params.scrape.sourceUrl,
    notes: `AI: ${validated.notes}`,
  };
}

export function runCreatorEmailSuggestSelfCheck(): void {
  const picked = pickEmailHeuristic(
    ["info@gallery.com", "artist@artistphoto.com"],
    "https://artistphoto.com",
    "Some Publisher Press",
  );
  if (picked.email !== "artist@artistphoto.com") {
    throw new Error("pickEmailHeuristic should prefer non-publisher domain match");
  }

  const snippets = [
    {
      url: "https://example.com/contact",
      text: "Reach me at jane [at] example dot com for bookings.",
    },
  ];
  if (
    !emailAppearsInScrapedContent(
      "jane@example.com",
      [],
      snippets,
    )
  ) {
    throw new Error("emailAppearsInScrapedContent should accept obfuscated text");
  }

  if (
    emailAppearsInScrapedContent(
      "madeup@example.com",
      [],
      snippets,
    )
  ) {
    throw new Error("emailAppearsInScrapedContent should reject invented emails");
  }

  if (!isPlaceholderEmail("you@example.com")) {
    throw new Error("isPlaceholderEmail should reject example addresses");
  }

  const merged = mergeEmailPick(
    {
      email: "artist@artistphoto.com",
      email_type: "artist",
      confidence: "medium",
      notes: "heuristic",
    },
    {
      email: "gallery@gallery.com",
      email_type: "gallery",
      confidence: "high",
      source_url: "https://gallery.com/contact",
      notes: "ai",
    },
    "https://artistphoto.com",
  );
  if (merged.email !== "gallery@gallery.com") {
    throw new Error("mergeEmailPick should prefer AI email when present");
  }
}
