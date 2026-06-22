import { ilike } from "drizzle-orm";
import { db } from "../../../../db/client";
import { Book, Creator, creators } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import {
  createStubCreatorProfileAdmin,
  resolvePublisher,
} from "../../admin/creators/services";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser,
} from "../services";
import { notifyAdminBookPendingReview } from "../../admin/notifications/services";
import { rowToBookFormData } from "./rowToBookFormData";
import type { ValidatedCsvBookRow } from "./schema";

export type ImportBookResult = {
  rowNumber: number;
  title: string;
  success: boolean;
  bookId?: string;
  error?: string;
};

async function findCreatorByDisplayName(
  displayName: string,
  type: "artist" | "publisher",
): Promise<Creator | null> {
  const trimmed = displayName.trim();
  if (!trimmed) return null;

  const existing = await db
    .select()
    .from(creators)
    .where(ilike(creators.displayName, trimmed))
    .limit(10);

  return existing.find((c) => c.type === type) ?? null;
}

async function resolveArtistByName(
  artistName: string,
  userId: string,
): Promise<[string | null, Creator | null]> {
  const existing = await findCreatorByDisplayName(artistName, "artist");
  if (existing) return [null, existing];

  const [err, created] = await createStubCreatorProfileAdmin(
    artistName,
    userId,
    "artist",
  );
  if (err || !created) {
    return [err?.reason ?? "Failed to resolve artist", null];
  }
  return [null, created];
}

async function resolvePublisherByName(
  publisherName: string,
  user: AuthUser,
): Promise<[string | null, Creator | null]> {
  const existing = await findCreatorByDisplayName(publisherName, "publisher");
  if (existing) return [null, existing];

  const [err, created] = await createStubCreatorProfileAdmin(
    publisherName,
    user.id,
    "publisher",
  );
  if (err || !created) {
    return [err?.reason ?? "Failed to resolve publisher", null];
  }
  return [null, created];
}

async function resolveCreatorsForImportRow(
  row: ValidatedCsvBookRow,
  user: AuthUser,
): Promise<[string | null, Creator | null, Creator | null]> {
  const creatorType = user.creator!.type;
  const formData = rowToBookFormData(row, creatorType);

  if (creatorType === "publisher") {
    const [artistError, artist] = await resolveArtistByName(
      row.artist ?? "",
      user.id,
    );
    if (artistError || !artist) {
      return [artistError ?? "Could not resolve artist", null, null];
    }
    return [null, artist, user.creator!];
  }

  let publisher: Creator | null = null;
  if (row.publisher?.trim()) {
    const [publisherError, resolvedPublisher] = await resolvePublisherByName(
      row.publisher,
      user,
    );
    if (publisherError) return [publisherError, null, null];
    publisher = resolvedPublisher;
  } else {
    const [publisherError, resolvedPublisher] = await resolvePublisher(
      formData,
      user,
    );
    if (publisherError) return [publisherError.reason, null, null];
    publisher = resolvedPublisher;
  }

  return [null, user.creator!, publisher];
}

export async function importBooksFromRows(
  rows: ValidatedCsvBookRow[],
  user: AuthUser,
): Promise<{ results: ImportBookResult[]; createdBooks: Book[] }> {
  const moderation = await getNewBookModerationForUser(user);
  const results: ImportBookResult[] = [];
  const createdBooks: Book[] = [];

  for (const row of rows) {
    const [resolveError, artist, publisher] = await resolveCreatorsForImportRow(
      row,
      user,
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

    if (book.approvalStatus === "pending") {
      await notifyAdminBookPendingReview({
        bookId: book.id,
        title: book.title,
        actorUserId: user.id,
      });
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
