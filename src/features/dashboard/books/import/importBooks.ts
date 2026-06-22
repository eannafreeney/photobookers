import { sql } from "drizzle-orm";
import { Book, Creator } from "../../../../db/schema";
import { AuthUser } from "../../../../../types";
import {
  createStubCreatorProfileAdmin,
  resolvePublisher,
  findCreatorByDisplayName,
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

async function resolveArtistByName(
  artistName: string,
  userId: string,
): Promise<[string | null, Creator | null]> {
  const [err, existing] = await findCreatorByDisplayName(artistName, "artist");
  if (err) return [err.reason, null];
  if (existing) return [null, existing];

  const [createErr, created] = await createStubCreatorProfileAdmin(
    artistName,
    userId,
    "artist",
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve artist", null];
  }
  return [null, created];
}

async function resolvePublisherByName(
  publisherName: string,
  user: AuthUser,
): Promise<[string | null, Creator | null]> {
  const [err, existing] = await findCreatorByDisplayName(publisherName, "publisher");
  if (err) return [err.reason, null];
  if (existing) return [null, existing];

  const [createErr, created] = await createStubCreatorProfileAdmin(
    publisherName,
    user.id,
    "publisher",
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve publisher", null];
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
