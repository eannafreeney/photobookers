import { inArray } from "drizzle-orm";
import { db } from "../../db/client.js";
import { creators } from "../../db/schema.js";
import { getTopBooksByViews } from "../../features/book-views/services.js";
import { getTopCreatorsByViews } from "../../features/creator-views/services.js";
const TRENDING_LIMIT = 3;
async function getTrendingForRange(rangeStart, rangeEnd) {
  const range = { from: rangeStart, to: rangeEnd };
  const [booksResult, artistsResult, publishersResult] = await Promise.all([
    getTopBooksByViews(range, 1, TRENDING_LIMIT),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "artist"),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "publisher")
  ]);
  if (booksResult[0]) {
    console.error("getTrendingForRange books", booksResult[0].reason);
  }
  if (artistsResult[0]) {
    console.error("getTrendingForRange artists", artistsResult[0].reason);
  }
  if (publishersResult[0]) {
    console.error("getTrendingForRange publishers", publishersResult[0].reason);
  }
  const books = booksResult[1]?.books.map((book) => ({
    bookId: book.bookId,
    bookSlug: book.slug,
    title: book.title,
    coverUrl: book.coverUrl,
    artistName: book.artistName,
    publisherName: book.publisherName
  })) ?? [];
  const creatorRows = [
    ...artistsResult[1]?.creators ?? [],
    ...publishersResult[1]?.creators ?? []
  ];
  const instagramBySlug = await loadCreatorInstagramBySlug(
    creatorRows.map((row) => row.slug)
  );
  const toTrendingCreator = (row) => ({
    displayName: row.displayName,
    slug: row.slug,
    type: row.type,
    coverUrl: row.coverUrl,
    instagram: instagramBySlug.get(row.slug) ?? null
  });
  const artists = artistsResult[1]?.creators.filter((c) => c.type === "artist").map(toTrendingCreator) ?? [];
  const publishers = publishersResult[1]?.creators.filter((c) => c.type === "publisher").map(toTrendingCreator) ?? [];
  return { books, artists, publishers };
}
async function loadCreatorInstagramBySlug(slugs) {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return /* @__PURE__ */ new Map();
  const rows = await db.query.creators.findMany({
    where: inArray(creators.slug, unique),
    columns: { slug: true, instagram: true }
  });
  return new Map(rows.map((row) => [row.slug, row.instagram ?? null]));
}
export {
  TRENDING_LIMIT,
  getTrendingForRange
};
