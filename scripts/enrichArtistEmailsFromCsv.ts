import "./env";
import fs from "node:fs/promises";
import { load } from "cheerio";
import { parse, stringify } from "csv/sync";

type InputRow = {
  artist_name: string;
  book_name?: string;
  profile_url?: string;
  publisher_name?: string;
  publisher_profile_url?: string;
};

type OutputRow = InputRow & {
  official_website: string;
  email: string;
  email_type: "artist" | "manager" | "gallery" | "publisher" | "unknown";
  source_url: string;
  confidence: "high" | "medium" | "low" | "none";
  notes: string;
};

const INPUT_PATH = process.argv[2] ?? "tmp/stub-artists.csv";
const OUTPUT_PATH = process.argv[3] ?? "tmp/stub-artists-emails.csv";
const LIMIT_ARG = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 0;

const USER_AGENT =
  "Mozilla/5.0 (compatible; PhotobookersEmailResearch/1.0; +https://photobookers.com)";
const MAX_PAGES_PER_SITE = 10;
const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const OBFUSCATED_EMAIL_REGEX =
  /([A-Z0-9._%+-]+)\s*(?:\(|\[)?\s*at\s*(?:\)|\])?\s*([A-Z0-9.-]+)\s*(?:\(|\[)?\s*dot\s*(?:\)|\])?\s*([A-Z]{2,})/gi;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractEmails(html: string): string[] {
  const emails = new Set<string>();
  const $ = load(html);
  // 1) plain-text regex
  const matches = html.match(EMAIL_REGEX) || [];
  for (const m of matches) {
    const e = m.trim().toLowerCase();
    if (!e.endsWith(".png") && !e.endsWith(".jpg") && !e.endsWith(".webp")) {
      emails.add(e);
    }
  }
  // 1.5) common obfuscation formats: name [at] domain [dot] com
  const obfuscatedMatches = html.matchAll(OBFUSCATED_EMAIL_REGEX);
  for (const match of obfuscatedMatches) {
    const local = match[1]?.trim().toLowerCase();
    const domain = match[2]?.trim().toLowerCase();
    const tld = match[3]?.trim().toLowerCase();
    if (local && domain && tld) {
      emails.add(`${local}@${domain}.${tld}`);
    }
  }
  // 2) mailto links
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
    if (!keywords.some((k) => lower.includes(k))) return;

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
  for (const p of paths) {
    try {
      links.add(new URL(p, website).toString());
    } catch {
      // ignore invalid urls
    }
  }
  return Array.from(links);
}

async function findWebsite(
  row: InputRow,
): Promise<{ website: string; notes: string }> {
  // Primary search
  const q1 = [
    row.artist_name,
    row.book_name,
    "official website",
    "photographer",
  ]
    .filter(Boolean)
    .join(" ");

  // Fallback search
  const q2 = [row.artist_name, row.book_name, "contact"]
    .filter(Boolean)
    .join(" ");

  for (const q of [q1, q2]) {
    const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const searchHtml = await fetchHtml(searchUrl);
    if (!searchHtml) continue;

    const $ = load(searchHtml);
    const candidates: string[] = [];
    $("a.result__a").each((_, el) => {
      const href = ($(el).attr("href") || "").trim();
      const url = resolveDuckDuckGoUrl(href);
      if (url) candidates.push(url);
    });

    for (const c of candidates.slice(0, 8)) {
      const html = await fetchHtml(c);
      if (!html) continue;

      const lower = html.toLowerCase();
      const nameParts = row.artist_name
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      const hasName = nameParts.every((p) => lower.includes(p));
      const hasBook = row.book_name
        ? lower.includes(row.book_name.toLowerCase())
        : true;

      if (hasName || hasBook) {
        return { website: c, notes: "Website found via search" };
      }

      await sleep(120);
    }
  }

  return { website: "", notes: "No confident website match" };
}

function classifyEmail(email: string): OutputRow["email_type"] {
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
    .filter((t) => t.length >= 6 && !stopwords.has(t));
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

function pickEmail(
  emails: string[],
  website: string,
  publisherName?: string,
): {
  email: string;
  type: OutputRow["email_type"];
  confidence: OutputRow["confidence"];
  notes: string;
} {
  const filteredEmails = emails.filter((email) => {
    const domain = email.split("@")[1] || "";
    return !matchesPublisherIdentity(domain, publisherName);
  });

  if (filteredEmails.length === 0 && emails.length > 0) {
    return {
      email: "",
      type: "unknown",
      confidence: "none",
      notes: "All found emails matched publisher identity and were excluded",
    };
  }

  if (filteredEmails.length === 0) {
    return {
      email: "",
      type: "unknown",
      confidence: "none",
      notes: "No email found on checked pages",
    };
  }

  const domain = getDomain(website);
  const domainMatch = domain
    ? filteredEmails.find((e) => e.split("@")[1]?.includes(domain))
    : undefined;
  const chosen = domainMatch || filteredEmails[0];

  return {
    email: chosen,
    type: classifyEmail(chosen),
    confidence: domainMatch ? "high" : "medium",
    notes: domainMatch
      ? "Email domain matches website domain"
      : "Email found but domain does not match website",
  };
}

async function collectEmailsFromSite(
  website: string,
): Promise<{ emails: string[]; sourceUrl: string }> {
  const root = await fetchHtml(website);
  if (!root) return { emails: [], sourceUrl: "" };

  const pages = [
    website,
    ...extractRelevantLinks(website, root),
    ...guessedContactLinks(website),
  ].slice(0, MAX_PAGES_PER_SITE);

  const found = new Set<string>();
  let source = website;

  for (const p of pages) {
    const html = await fetchHtml(p);
    if (!html) continue;
    const emails = extractEmails(html);
    if (emails.length > 0 && !source) source = p;
    emails.forEach((e) => found.add(e));
    await sleep(120);
  }

  return { emails: Array.from(found), sourceUrl: source };
}

async function run() {
  const raw = await fs.readFile(INPUT_PATH, "utf8");
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as InputRow[];

  const work = LIMIT > 0 ? rows.slice(0, LIMIT) : rows;
  console.log(`Loaded ${rows.length} rows. Processing ${work.length}...`);

  const out: OutputRow[] = [];

  for (let i = 0; i < work.length; i++) {
    const row = work[i];
    console.log(`[${i + 1}/${work.length}] ${row.artist_name}`);

    const foundSite = await findWebsite(row);
    if (!foundSite.website) {
      out.push({
        ...row,
        official_website: "",
        email: "",
        email_type: "unknown",
        source_url: "",
        confidence: "none",
        notes: foundSite.notes,
      });
      continue;
    }

    const emailData = await collectEmailsFromSite(foundSite.website);
    const picked = pickEmail(
      emailData.emails,
      foundSite.website,
      row.publisher_name,
    );

    out.push({
      ...row,
      official_website: foundSite.website,
      email: picked.email,
      email_type: picked.type,
      source_url: emailData.sourceUrl,
      confidence: picked.confidence,
      notes: `${foundSite.notes}; ${picked.notes}`,
    });

    await sleep(180);
  }

  const csv = stringify(out, {
    header: true,
    columns: [
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
    ],
  });

  await fs.mkdir("tmp", { recursive: true });
  await fs.writeFile(OUTPUT_PATH, csv, "utf8");
  console.log(`Done. Wrote ${out.length} rows to ${OUTPUT_PATH}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
