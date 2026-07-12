import { inArray } from "drizzle-orm";
import { db } from "../../db/client";
import { creators } from "../../db/schema";
import { getTopBooksByViews } from "../../features/book-views/services";
import { getTopCreatorsByViews } from "../../features/creator-views/services";
import type {
  WeeklyNewsletterTrending,
  WeeklyNewsletterTrendingBookItem,
  WeeklyNewsletterTrendingCreatorItem,
} from "../../features/dashboard/admin/planner/newsletter/types";

export const TRENDING_LIMIT = 3;

export async function getTrendingForRange(
  rangeStart: Date,
  rangeEnd: Date,
): Promise<WeeklyNewsletterTrending> {
  const range = { from: rangeStart, to: rangeEnd };

  const [booksResult, artistsResult, publishersResult] = await Promise.all([
    getTopBooksByViews(range, 1, TRENDING_LIMIT),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "artist"),
    getTopCreatorsByViews(range, 1, TRENDING_LIMIT, "publisher"),
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

  const books: WeeklyNewsletterTrendingBookItem[] =
    booksResult[1]?.books.map((book) => ({
      bookId: book.bookId,
      bookSlug: book.slug,
      title: book.title,
      coverUrl: book.coverUrl,
      artistName: book.artistName,
      publisherName: book.publisherName,
    })) ?? [];

  const creatorRows = [
    ...(artistsResult[1]?.creators ?? []),
    ...(publishersResult[1]?.creators ?? []),
  ];
  const instagramBySlug = await loadCreatorInstagramBySlug(
    creatorRows.map((row) => row.slug),
  );

  const toTrendingCreator = (row: {
    displayName: string;
    slug: string;
    type: "artist" | "publisher";
    coverUrl: string | null;
  }): WeeklyNewsletterTrendingCreatorItem => ({
    displayName: row.displayName,
    slug: row.slug,
    type: row.type,
    coverUrl: row.coverUrl,
    instagram: instagramBySlug.get(row.slug) ?? null,
  });

  const artists =
    artistsResult[1]?.creators
      .filter((c) => c.type === "artist")
      .map(toTrendingCreator) ?? [];

  const publishers =
    publishersResult[1]?.creators
      .filter((c) => c.type === "publisher")
      .map(toTrendingCreator) ?? [];

  return { books, artists, publishers };
}

async function loadCreatorInstagramBySlug(
  slugs: string[],
): Promise<Map<string, string | null>> {
  const unique = [...new Set(slugs.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const rows = await db.query.creators.findMany({
    where: inArray(creators.slug, unique),
    columns: { slug: true, instagram: true },
  });

  return new Map(rows.map((row) => [row.slug, row.instagram ?? null]));
}
