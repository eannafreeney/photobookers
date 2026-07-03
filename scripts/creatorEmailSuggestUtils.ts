import { load } from "cheerio";
import { z } from "zod";

export type CreatorEmailInputRow = {
  artist_name: string;
  book_name?: string;
  profile_url?: string;
  publisher_name?: string;
  publisher_profile_url?: string;
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
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; PhotobookersEmailResearch/1.0; +https://photobookers.com)";
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

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
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
      !email.endsWith(".webp")
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
    if (addr) emails.add(addr);
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
  const queries = [
    [row.artist_name, row.book_name, "official website", "photographer"]
      .filter(Boolean)
      .join(" "),
    [row.artist_name, row.book_name, "contact"].filter(Boolean).join(" "),
  ];

  for (const query of queries) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const searchHtml = await fetchHtml(searchUrl);
    if (!searchHtml) continue;

    const $ = load(searchHtml);
    const candidates: string[] = [];
    $("a.result__a").each((_, el) => {
      const href = ($(el).attr("href") || "").trim();
      const url = resolveDuckDuckGoUrl(href);
      if (url) candidates.push(url);
    });

    for (const candidate of candidates.slice(0, 8)) {
      const html = await fetchHtml(candidate);
      if (!html) continue;

      const lower = html.toLowerCase();
      const nameParts = row.artist_name
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      const hasName = nameParts.every((part) => lower.includes(part));
      const hasBook = row.book_name
        ? lower.includes(row.book_name.toLowerCase())
        : true;

      if (hasName || hasBook) {
        return { website: candidate, notes: "Website found via search" };
      }

      await sleep(120);
    }
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
  emailDomain: string,
  publisherName?: string,
): boolean {
  if (!publisherName?.trim()) return false;
  const normalizedDomain = normalizeDomainForMatch(emailDomain);
  const tokens = normalizeNameTokens(publisherName);
  if (tokens.length === 0) return false;
  return tokens.some((token) => normalizedDomain.includes(token));
}

export function pickEmailHeuristic(
  emails: string[],
  website: string,
  publisherName?: string,
): Pick<
  CreatorEmailOutputRow,
  "email" | "email_type" | "confidence" | "notes"
> {
  const filteredEmails = emails.filter((email) => {
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

  return {
    email: chosen,
    email_type: classifyEmail(chosen),
    confidence: domainMatch ? "high" : "medium",
    notes: domainMatch
      ? "Heuristic: email domain matches website domain"
      : "Heuristic: email found but domain does not match website",
  };
}

async function collectEmailsFromSite(
  website: string,
): Promise<{
  emails: string[];
  sourceUrl: string;
  pageSnippets: Array<{ url: string; text: string }>;
}> {
  const root = await fetchHtml(website);
  if (!root) {
    return { emails: [], sourceUrl: "", pageSnippets: [] };
  }

  const pages = [
    website,
    ...extractRelevantLinks(website, root),
    ...guessedContactLinks(website),
  ].slice(0, MAX_PAGES_PER_SITE);

  const found = new Set<string>();
  const pageSnippets: Array<{ url: string; text: string }> = [];
  let sourceUrl = website;

  for (const pageUrl of pages) {
    const html = await fetchHtml(pageUrl);
    if (!html) continue;

    const emails = extractEmails(html);
    if (emails.length > 0 && !sourceUrl) sourceUrl = pageUrl;
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
    };
  }

  const emailData = await collectEmailsFromSite(foundSite.website);
  return {
    website: foundSite.website,
    websiteNotes: foundSite.notes,
    candidateEmails: emailData.emails,
    sourceUrl: emailData.sourceUrl,
    pageSnippets: emailData.pageSnippets,
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
}
