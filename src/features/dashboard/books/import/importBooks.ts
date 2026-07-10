import { and, eq, sql } from "drizzle-orm";
import { Book, Creator, books } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import {
  createStubCreatorProfile,
  resolvePublisher,
  findCreatorByDisplayName,
} from "../../admin/creators/services";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser,
} from "../services";
import { rowToBookFormData } from "./rowToBookFormData";
import type { ValidatedCsvBookRow } from "./schema";
import { db } from "../../../../db/client";

export type ImportBookResult = {
  rowNumber: number;
  title: string;
  success: boolean;
  bookId?: string;
  error?: string;
};

type CreatorCache = Map<string, Creator>;

/**
 * Batch resolve all unique creators (artists and publishers) from CSV rows.
 * This prevents N+1 queries by resolving all creators upfront.
 * 
 * For 100 rows with 20 unique artists: 20 queries instead of 100.
 */
async function batchResolveCreators(
  rows: ValidatedCsvBookRow[],
  user: AuthUser,
): Promise<{
  artistCache: CreatorCache;
  publisherCache: CreatorCache;
  errors: Array<{ rowNumber: number; error: string }>;
}> {
  const creatorType = user.creator!.type;
  const artistCache: CreatorCache = new Map();
  const publisherCache: CreatorCache = new Map();
  const errors: Array<{ rowNumber: number; error: string }> = [];

  // Extract unique artist and publisher names
  const uniqueArtists = new Set<string>();
  const uniquePublishers = new Set<string>();

  for (const row of rows) {
    if (creatorType === "publisher") {
      // Publisher imports need artist names
      if (row.artist?.trim()) {
        uniqueArtists.add(row.artist.trim());
      }
    } else {
      // Artist imports may have publisher names
      if (row.publisher?.trim()) {
        uniquePublishers.add(row.publisher.trim());
      }
    }
  }

  // Batch resolve artists
  for (const artistName of uniqueArtists) {
    const [err, existing] = await findCreatorByDisplayName(artistName, "artist");
    
    if (err) {
      // Log error but don't fail the whole batch
      console.error(`Failed to find artist "${artistName}":`, err.reason);
      continue;
    }
    
    if (existing) {
      artistCache.set(artistName.toLowerCase(), existing);
    } else {
      // Create stub for missing artist
      const [createErr, created] = await createStubCreatorProfile(
        artistName,
        user.id,
        "artist",
      );
      
      if (createErr || !created) {
        console.error(`Failed to create artist "${artistName}":`, createErr?.reason);
        continue;
      }
      
      artistCache.set(artistName.toLowerCase(), created);
    }
  }

  // Batch resolve publishers
  for (const publisherName of uniquePublishers) {
    const [err, existing] = await findCreatorByDisplayName(publisherName, "publisher");
    
    if (err) {
      console.error(`Failed to find publisher "${publisherName}":`, err.reason);
      continue;
    }
    
    if (existing) {
      publisherCache.set(publisherName.toLowerCase(), existing);
    } else {
      // Create stub for missing publisher
      const [createErr, created] = await createStubCreatorProfile(
        publisherName,
        user.id,
        "publisher",
      );
      
      if (createErr || !created) {
        console.error(`Failed to create publisher "${publisherName}":`, createErr?.reason);
        continue;
      }
      
      publisherCache.set(publisherName.toLowerCase(), created);
    }
  }

  return { artistCache, publisherCache, errors };
}

/**
 * Resolve creators for a single row using the pre-built cache.
 * Falls back to database queries if not found in cache.
 */
async function resolveCreatorsForImportRow(
  row: ValidatedCsvBookRow,
  user: AuthUser,
  artistCache: CreatorCache,
  publisherCache: CreatorCache,
): Promise<[string | null, Creator | null, Creator | null]> {
  const creatorType = user.creator!.type;
  const formData = rowToBookFormData(row, creatorType);

  if (creatorType === "publisher") {
    // Additional validation for publisher imports
    if (!row.artist?.trim()) {
      return ["Artist name is required for publisher imports", null, null];
    }
    
    // Try cache first
    const artistKey = row.artist.trim().toLowerCase();
    const cachedArtist = artistCache.get(artistKey);
    let artist = cachedArtist ?? null;
    
    // Fallback to database query if not in cache
    if (!artist) {
      const [artistError, resolvedArtist] = await resolveArtistByName(
        row.artist,
        user.id,
      );
      if (artistError || !resolvedArtist) {
        return [artistError ?? "Could not resolve artist", null, null];
      }
      artist = resolvedArtist;
      // Add to cache for next time
      artistCache.set(artistKey, artist);
    }
    
    return [null, artist, user.creator!];
  }

  // Artist imports
  let publisher: Creator | null = null;
  if (row.publisher?.trim()) {
    // Try cache first
    const publisherKey = row.publisher.trim().toLowerCase();
    const cachedPublisher = publisherCache.get(publisherKey);
    publisher = cachedPublisher ?? null;
    
    // Fallback to database query if not in cache
    if (!publisher) {
      const [publisherError, resolvedPublisher] = await resolvePublisherByName(
        row.publisher,
        user,
      );
      if (publisherError) return [publisherError, null, null];
      publisher = resolvedPublisher;
      // Add to cache for next time
      if (publisher) {
        publisherCache.set(publisherKey, publisher);
      }
    }
  } else {
    // Use existing resolvePublisher for form-based logic
    const [publisherError, resolvedPublisher] = await resolvePublisher(
      formData,
      user,
    );
    if (publisherError) return [publisherError.reason, null, null];
    publisher = resolvedPublisher;
  }

  return [null, user.creator!, publisher];
}

/**
 * Helper function to resolve a single artist by name.
 * Used as fallback when artist is not in cache.
 */
async function resolveArtistByName(
  artistName: string,
  userId: string,
): Promise<[string | null, Creator | null]> {
  const trimmed = artistName.trim();
  
  if (!trimmed) {
    return ["Artist name is required", null];
  }
  
  const [err, existing] = await findCreatorByDisplayName(trimmed, "artist");
  if (err) return [err.reason, null];
  if (existing) return [null, existing];

  const [createErr, created] = await createStubCreatorProfile(
    trimmed,
    userId,
    "artist",
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve artist", null];
  }
  return [null, created];
}

/**
 * Helper function to resolve a single publisher by name.
 * Used as fallback when publisher is not in cache.
 */
async function resolvePublisherByName(
  publisherName: string,
  user: AuthUser,
): Promise<[string | null, Creator | null]> {
  const trimmed = publisherName.trim();
  
  if (!trimmed) {
    return ["Publisher name is required", null];
  }
  
  const [err, existing] = await findCreatorByDisplayName(trimmed, "publisher");
  if (err) return [err.reason, null];
  if (existing) return [null, existing];

  const [createErr, created] = await createStubCreatorProfile(
    trimmed,
    user.id,
    "publisher",
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve publisher", null];
  }
  return [null, created];
}

/**
 * Import books from validated CSV rows.
 * Optimized with batch creator resolution to prevent N+1 queries.
 */
export async function importBooksFromRows(
  rows: ValidatedCsvBookRow[],
  user: AuthUser,
): Promise<{ results: ImportBookResult[]; createdBooks: Book[] }> {
  const moderation = await getNewBookModerationForUser(user);
  const results: ImportBookResult[] = [];
  const createdBooks: Book[] = [];

  // OPTIMIZATION: Batch resolve all unique creators upfront
  // This prevents N+1 queries (e.g., 100 rows with 20 unique artists = 20 queries instead of 100)
  const { artistCache, publisherCache } = await batchResolveCreators(rows, user);

  // Process each row
  for (const row of rows) {
    const [resolveError, artist, publisher] = await resolveCreatorsForImportRow(
      row,
      user,
      artistCache,
      publisherCache,
    );

    if (resolveError || !artist) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: resolveError ?? "Could not resolve creators",
      });
      continue;
    }

    // #16: Duplicate detection - Check if book already exists
    const existingBook = await db.query.books.findFirst({
      where: and(
        eq(books.title, row.title),
        eq(books.artistId, artist.id),
        eq(books.createdByUserId, user.id)
      ),
      columns: { id: true, title: true },
    });

    if (existingBook) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: "Book already exists with this title and artist (possible duplicate)",
      });
      continue;
    }

    const formData = rowToBookFormData(row, user.creator!.type);
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      moderation,
    );

    const book = await createBook(bookData);
    if (!book) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: "Failed to create book",
      });
      continue;
    }

    createdBooks.push(book);
    results.push({
      rowNumber: row.rowNumber,
      title: row.title,
      success: true,
      bookId: book.id,
    });
  }

  return { results, createdBooks };
}
