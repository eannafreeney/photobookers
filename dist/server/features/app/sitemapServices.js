import { and, eq, isNotNull, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import {
  artistOfTheWeek,
  bookFairs,
  bookOfTheDay,
  bookStores,
  books,
  creatorInterviews,
  creators,
  publisherOfTheWeek
} from "../../db/schema.js";
import { DISCOVER_TAGS } from "../../constants/discover.js";
import { tagBooksUrl } from "../../lib/tags.js";
import { toDateString, toWeekStart, toWeekString } from "../../lib/utils.js";
const STATIC_PAGES = [
  { loc: "/featured", changefreq: "daily", priority: 1 },
  { loc: "/books", changefreq: "daily", priority: 0.9 },
  { loc: "/artists", changefreq: "weekly", priority: 0.8 },
  { loc: "/publishers", changefreq: "weekly", priority: 0.8 },
  { loc: "/creators", changefreq: "weekly", priority: 0.8 },
  { loc: "/fairs", changefreq: "weekly", priority: 0.7 },
  { loc: "/interviews", changefreq: "weekly", priority: 0.7 },
  { loc: "/book-of-the-day", changefreq: "daily", priority: 0.7 },
  { loc: "/artist-of-the-week", changefreq: "weekly", priority: 0.6 },
  { loc: "/publisher-of-the-week", changefreq: "weekly", priority: 0.6 },
  { loc: "/about", changefreq: "monthly", priority: 0.5 },
  { loc: "/contact", changefreq: "monthly", priority: 0.4 },
  { loc: "/terms", changefreq: "yearly", priority: 0.2 },
  { loc: "/privacy", changefreq: "yearly", priority: 0.2 },
  { loc: "/this-week", changefreq: "weekly", priority: 0.8 },
  { loc: "/newsletter", changefreq: "weekly", priority: 0.6 },
  { loc: "/stores", changefreq: "weekly", priority: 0.7 }
];
const creatorsWithPublishedBooks = sql`EXISTS (
  SELECT 1 FROM ${books}
  WHERE (${books.artistId} = ${creators.id} OR ${books.publisherId} = ${creators.id})
  AND ${books.publicationStatus} = 'published'
)`;
const publishedBookConditions = and(
  eq(books.publicationStatus, "published"),
  eq(books.approvalStatus, "approved"),
  or(isNull(books.releaseDate), lte(books.releaseDate, /* @__PURE__ */ new Date()))
);
function formatLastmod(date) {
  if (!date) return void 0;
  return date.toISOString().slice(0, 10);
}
async function getSitemapEntries() {
  const [
    bookRows,
    creatorRows,
    interviewRows,
    fairRows,
    storeRows,
    botdRows,
    aotwRows,
    potwRows
  ] = await Promise.all([
    db.select({
      slug: books.slug,
      updatedAt: books.updatedAt
    }).from(books).where(publishedBookConditions),
    db.select({
      slug: creators.slug,
      updatedAt: creators.updatedAt
    }).from(creators).where(creatorsWithPublishedBooks),
    db.select({
      slug: creatorInterviews.creatorSlug,
      completedAt: creatorInterviews.completedAt
    }).from(creatorInterviews).where(
      and(
        eq(creatorInterviews.status, "published"),
        isNotNull(creatorInterviews.promoImageUrl)
      )
    ),
    db.select({
      slug: bookFairs.slug,
      updatedAt: bookFairs.updatedAt
    }).from(bookFairs).where(
      and(
        eq(bookFairs.status, "published"),
        eq(bookFairs.approvalStatus, "approved")
      )
    ),
    db.select({
      slug: bookStores.slug,
      updatedAt: bookStores.updatedAt
    }).from(bookStores).where(
      and(
        eq(bookStores.status, "published"),
        eq(bookStores.approvalStatus, "approved")
      )
    ),
    db.query.bookOfTheDay.findMany({
      columns: { date: true, updatedAt: true },
      where: lte(bookOfTheDay.date, /* @__PURE__ */ new Date())
    }),
    db.query.artistOfTheWeek.findMany({
      columns: { weekStart: true, updatedAt: true },
      where: lte(artistOfTheWeek.weekStart, toWeekStart(/* @__PURE__ */ new Date()))
    }),
    db.query.publisherOfTheWeek.findMany({
      columns: { weekStart: true, updatedAt: true },
      where: lte(publisherOfTheWeek.weekStart, toWeekStart(/* @__PURE__ */ new Date()))
    })
  ]);
  const staticEntries = STATIC_PAGES.map((page) => ({
    ...page
  }));
  const bookEntries = bookRows.map((book) => ({
    loc: `/books/${book.slug}`,
    lastmod: formatLastmod(book.updatedAt),
    changefreq: "weekly",
    priority: 0.8
  }));
  const creatorEntries = creatorRows.map((creator) => ({
    loc: `/creators/${creator.slug}`,
    lastmod: formatLastmod(creator.updatedAt),
    changefreq: "weekly",
    priority: 0.7
  }));
  const interviewEntries = interviewRows.map((interview) => ({
    // matches /interviews/view/[slug].tsx
    loc: `/interviews/view/${interview.slug}`,
    lastmod: formatLastmod(interview.completedAt),
    changefreq: "monthly",
    priority: 0.6
  }));
  const fairEntries = fairRows.map((fair) => ({
    loc: `/fairs/${fair.slug}`,
    lastmod: formatLastmod(fair.updatedAt),
    changefreq: "weekly",
    priority: 0.65
  }));
  const storeEntries = storeRows.map((store) => ({
    loc: `/stores/${store.slug}`,
    lastmod: formatLastmod(store.updatedAt),
    changefreq: "monthly",
    priority: 0.65
  }));
  const tagEntries = DISCOVER_TAGS.map((tag) => ({
    loc: tagBooksUrl(tag),
    changefreq: "weekly",
    priority: 0.5
  }));
  const botdEntries = botdRows.map((row) => ({
    loc: `/book-of-the-day/${toDateString(row.date)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.65
  }));
  const aotwEntries = aotwRows.map((row) => ({
    loc: `/artist-of-the-week/${toWeekString(row.weekStart)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.6
  }));
  const potwEntries = potwRows.map((row) => ({
    loc: `/publisher-of-the-week/${toWeekString(row.weekStart)}`,
    lastmod: formatLastmod(row.updatedAt),
    changefreq: "monthly",
    priority: 0.6
  }));
  return [
    ...staticEntries,
    ...bookEntries,
    ...creatorEntries,
    ...interviewEntries,
    ...fairEntries,
    ...storeEntries,
    ...tagEntries,
    ...botdEntries,
    ...aotwEntries,
    ...potwEntries
  ];
}
export {
  getSitemapEntries
};
