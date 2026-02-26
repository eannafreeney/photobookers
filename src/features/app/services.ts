import { and, count, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators } from "../../db/schema";
import { getPagination } from "../../lib/pagination";
import { getBooksOrderBy } from "../../lib/booksOrderBy";

export const getBooksByCreatorSlug = async (
  slug: string,
  currentPage: number = 1,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc" = "newest",
  defaultLimit = 12,
) => {
  // 1. Fetch creator without books
  const creator = await db.query.creators.findFirst({
    where: eq(creators.slug, slug),
  });

  if (!creator) {
    return {
      creator: null,
      books: [],
      artists: [],
      totalPages: 0,
      page: 1,
      limit: defaultLimit,
    };
  }

  // 2. Count books for this creator (by type)
  const bookColumn =
    creator.type === "publisher" ? books.publisherId : books.artistId;
  const [{ value: totalCount = 0 }] = await db
    .select({ value: count() })
    .from(books)
    .where(
      and(
        eq(bookColumn, creator.id),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
      ),
    );

  const { page, limit, offset, totalPages } = getPagination(
    currentPage,
    totalCount,
    defaultLimit,
  );

  // 3. Fetch one page of books
  const foundBooks = await db.query.books.findMany({
    columns: {
      id: true,
      title: true,
      slug: true,
      coverUrl: true,
      artistId: true,
      publisherId: true,
    },
    where: and(
      eq(bookColumn, creator.id),
      eq(books.publicationStatus, "published"),
    ),
    orderBy: getBooksOrderBy(sortBy),
    limit,
    offset,
    with: {
      artist: {
        columns: {
          id: true,
          displayName: true,
          slug: true,
        },
      },
    },
  });

  return {
    creator,
    books: foundBooks,
    totalPages,
    page,
  };
};

export const getBookBySlug = async (
  bookSlug: string,
  status: "published" | "draft" = "published",
) => {
  try {
    const book = await db.query.books.findFirst({
      where: and(eq(books.slug, bookSlug), eq(books.publicationStatus, status)),
      with: {
        publisher: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
        artist: true,
      },
    });

    if (!book) return null;

    // Handle images - could be relation (bookImages[]) or field (string[])
    const galleryImages =
      book.images && Array.isArray(book.images) && book.images.length > 0
        ? typeof book.images[0] === "string"
          ? [] // If it's the string array field, we'll use bookImages relation instead
          : book.images.map((img: any) => ({ imageUrl: img.imageUrl }))
        : [];

    return {
      book: { ...book, images: galleryImages },
    };
  } catch (error) {
    console.error("Failed to get book by slug", error);
    return null;
  }
};

export const getBooksByTag = async (
  tag: string,
  currentPage: number,
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc",
  defaultLimit = 12,
) => {
  try {
    const tagCondition = sql`EXISTS (
      SELECT 1 FROM unnest(${books.tags}) AS t
      WHERE LOWER(t) = LOWER(${tag})
    )`;

    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(and(eq(books.publicationStatus, "published"), tagCondition));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await db.query.books.findMany({
      where: (books, { and, eq, sql }) =>
        and(
          eq(books.publicationStatus, "published"),
          sql`EXISTS (
            SELECT 1 FROM unnest(${books.tags}) AS t
            WHERE LOWER(t) = LOWER(${tag})
          )`,
        ),
      with: {
        artist: true,
        publisher: true,
      },
      orderBy: getBooksOrderBy(sortBy),
      limit: limit,
      offset: offset,
    });
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books by tag", error);
    return null;
  }
};

export const getLatestBooks = async (
  currentPage: number,
  defaultLimit = 12,
) => {
  try {
    const [{ value: totalCount = 0 }] = await db
      .select({ value: count() })
      .from(books)
      .where(eq(books.publicationStatus, "published"));

    const { page, limit, offset, totalPages } = getPagination(
      currentPage,
      totalCount,
      defaultLimit,
    );

    const foundBooks = await db.query.books.findMany({
      with: {
        artist: true,
        images: {
          orderBy: (bookImages, { asc }) => [asc(bookImages.sortOrder)],
        },
      },
      orderBy: (books, { desc }) => [desc(books.createdAt)],
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        // lte(books.releaseDate, new Date()),
      ),
      limit: limit,
      offset: offset,
    });
    return { books: foundBooks, totalPages, page };
  } catch (error) {
    console.error("Failed to get books", error);
    return null;
  }
};
