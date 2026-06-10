import { and, eq, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client";
import {
  artistOfTheWeek,
  bookOfTheDay,
  books,
  creatorInterviews,
  creators,
  publisherOfTheWeek,
} from "../../db/schema";
import { DISCOVER_TAGS } from "../../constants/discover";
import { toDateString, toWeekStart, toWeekString } from "../../lib/utils";

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: number;
};

const STATIC_PAGES: Array<
  Pick<SitemapEntry, "loc" | "changefreq" | "priority">
> = [
  { loc: "/featured", changefreq: "daily", priority: 1.0 },
  { loc: "/books", changefreq: "daily", priority: 0.9 },
  { loc: "/artists", changefreq: "weekly", priority: 0.8 },
  { loc: "/publishers", changefreq: "weekly", priority: 0.8 },
  { loc: "/interviews", changefreq: "weekly", priority: 0.7 },
  { loc: "/book-of-the-day", changefreq: "daily", priority: 0.7 },
  { loc: "/artist-of-the-week", changefreq: "weekly", priority: 0.6 },
  { loc: "/publisher-of-the-week", changefreq: "weekly", priority: 0.6 },
  { loc: "/about", changefreq: "monthly", priority: 0.5 },
  { loc: "/contact", changefreq: "monthly", priority: 0.4 },
  { loc: "/terms", changefreq: "yearly" as never, priority: 0.2 },
  { loc: "/privacy", changefreq: "yearly" as never, priority: 0.2 },
  { loc: "/this-week", changefreq: "weekly", priority: 0.8 },
];

// Same rule used in getAllCreatorsForBrowse
const creatorsWithPublishedBooks = sql`EXISTS (
  SELECT 1 FROM ${books}
  WHERE (${books.artistId} = ${creators.id} OR ${books.publisherId} = ${creators.id})
  AND ${books.publicationStatus} = 'published'
)`;

// Same visibility rules as getLatestBooks / book detail pages
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
);

function formatLastmod(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  return date.toISOString().slice(0, 10); // "2026-06-04"
}

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const [bookRows, creatorRows, interviewRows, botdRows, aotwRows, potwRows] =
    await Promise.all([
      db
        .select({
          slug: books.slug,
          updatedAt: books.updatedAt,
        })
        .from(books)
        .where(publishedBookConditions),

      db
        .select({
          slug: creators.slug,
          updatedAt: creators.updatedAt,
        })
        .from(creators)
        .where(creatorsWithPublishedBooks),

      db
        .select({
          slug: creatorInterviews.creatorSlug,
          completedAt: creatorInterviews.completedAt,
        })
        .from(creatorInterviews)
        .where(
          and(
            eq(creatorInterviews.status, "published"),
            isNotNull(creatorInterviews.promoImageUrl),
          ),
        ),
      db.query.bookOfTheDay.findMany({
        columns: { date: true, updatedAt: true },
        where: lte(bookOfTheDay.date, new Date()),
      }),
      db.query.artistOfTheWeek.findMany({
        columns: { weekStart: true, updatedAt: true },
        where: lte(artistOfTheWeek.weekStart, toWeekStart(new Date())),
      }),
      db.query.publisherOfTheWeek.findMany({
        columns: { weekStart: true, updatedAt: true },
        where: lte(publisherOfTheWeek.weekStart, toWeekStart(new Date())),
      }),
    ]);

  const staticEntries: SitemapEntry[] = STATIC_PAGES.map((page) => ({
    ...page,
  }));

  const bookEntries: SitemapEntry[] = bookRows.map((book) => ({
    loc: `/books/${book.slug}`,
    lastmod: formatLastmod(book.updatedAt),
    changefreq: "weekly",
    priority: 0.8,
  }));

  const creatorEntries: SitemapEntry[] = creatorRows.map((creator) => ({
    loc: `/creators/${creator.slug}`,
    lastmod: formatLastmod(creator.updatedAt),
    changefreq: "weekly",
    priority: 0.7,
  }));

  const interviewEntries: SitemapEntry[] = interviewRows.map((interview) => ({
    // matches /interviews/view/[slug].tsx
    loc: `/interviews/view/${interview.slug}`,
    lastmod: formatLastmod(interview.completedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const tagEntries: SitemapEntry[] = DISCOVER_TAGS.map((tag) => ({
    // matches links like /books/tags/still%20life
    loc: `/books/tags/${encodeURIComponent(tag.toLowerCase())}`,
    changefreq: "weekly",
    priority: 0.5,
  }));

  const botdEntries: SitemapEntry[] = botdRows.map((row) => ({
    loc: `/book-of-the-day/${toDateString(row.date)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.65,
  }));

  const aotwEntries: SitemapEntry[] = aotwRows.map((row) => ({
    loc: `/artist-of-the-week/${toWeekString(row.weekStart)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  const potwEntries: SitemapEntry[] = potwRows.map((row) => ({
    loc: `/publisher-of-the-week/${toWeekString(row.weekStart)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...bookEntries,
    ...creatorEntries,
    ...interviewEntries,
    ...tagEntries,
    ...botdEntries,
    ...aotwEntries,
    ...potwEntries,
  ];
}
