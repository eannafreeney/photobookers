import { and, eq } from "drizzle-orm";
import { books } from "../../../../db/schema.js";
import {
  createStubCreatorProfile,
  resolvePublisher,
  findCreatorByDisplayName
} from "../../admin/creators/services.js";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser
} from "../services.js";
import { notifyAdminBookPendingReview } from "../../admin/notifications/services.js";
import { rowToBookFormData } from "./rowToBookFormData.js";
import { db } from "../../../../db/client.js";
async function batchResolveCreators(rows, user) {
  const creatorType = user.creator.type;
  const artistCache = /* @__PURE__ */ new Map();
  const publisherCache = /* @__PURE__ */ new Map();
  const errors = [];
  const uniqueArtists = /* @__PURE__ */ new Set();
  const uniquePublishers = /* @__PURE__ */ new Set();
  for (const row of rows) {
    if (creatorType === "publisher") {
      if (row.artist?.trim()) {
        uniqueArtists.add(row.artist.trim());
      }
    } else {
      if (row.publisher?.trim()) {
        uniquePublishers.add(row.publisher.trim());
      }
    }
  }
  for (const artistName of uniqueArtists) {
    const [err, existing] = await findCreatorByDisplayName(artistName, "artist");
    if (err) {
      console.error(`Failed to find artist "${artistName}":`, err.reason);
      continue;
    }
    if (existing) {
      artistCache.set(artistName.toLowerCase(), existing);
    } else {
      const [createErr, created] = await createStubCreatorProfile(
        artistName,
        user.id,
        "artist"
      );
      if (createErr || !created) {
        console.error(`Failed to create artist "${artistName}":`, createErr?.reason);
        continue;
      }
      artistCache.set(artistName.toLowerCase(), created);
    }
  }
  for (const publisherName of uniquePublishers) {
    const [err, existing] = await findCreatorByDisplayName(publisherName, "publisher");
    if (err) {
      console.error(`Failed to find publisher "${publisherName}":`, err.reason);
      continue;
    }
    if (existing) {
      publisherCache.set(publisherName.toLowerCase(), existing);
    } else {
      const [createErr, created] = await createStubCreatorProfile(
        publisherName,
        user.id,
        "publisher"
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
async function resolveCreatorsForImportRow(row, user, artistCache, publisherCache) {
  const creatorType = user.creator.type;
  const formData = rowToBookFormData(row, creatorType);
  if (creatorType === "publisher") {
    if (!row.artist?.trim()) {
      return ["Artist name is required for publisher imports", null, null];
    }
    const artistKey = row.artist.trim().toLowerCase();
    const cachedArtist = artistCache.get(artistKey);
    let artist = cachedArtist ?? null;
    if (!artist) {
      const [artistError, resolvedArtist] = await resolveArtistByName(
        row.artist,
        user.id
      );
      if (artistError || !resolvedArtist) {
        return [artistError ?? "Could not resolve artist", null, null];
      }
      artist = resolvedArtist;
      artistCache.set(artistKey, artist);
    }
    return [null, artist, user.creator];
  }
  let publisher = null;
  if (row.publisher?.trim()) {
    const publisherKey = row.publisher.trim().toLowerCase();
    const cachedPublisher = publisherCache.get(publisherKey);
    publisher = cachedPublisher ?? null;
    if (!publisher) {
      const [publisherError, resolvedPublisher] = await resolvePublisherByName(
        row.publisher,
        user
      );
      if (publisherError) return [publisherError, null, null];
      publisher = resolvedPublisher;
      if (publisher) {
        publisherCache.set(publisherKey, publisher);
      }
    }
  } else {
    const [publisherError, resolvedPublisher] = await resolvePublisher(
      formData,
      user
    );
    if (publisherError) return [publisherError.reason, null, null];
    publisher = resolvedPublisher;
  }
  return [null, user.creator, publisher];
}
async function resolveArtistByName(artistName, userId) {
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
    "artist"
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve artist", null];
  }
  return [null, created];
}
async function resolvePublisherByName(publisherName, user) {
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
    "publisher"
  );
  if (createErr || !created) {
    return [createErr?.reason ?? "Failed to resolve publisher", null];
  }
  return [null, created];
}
async function importBooksFromRows(rows, user) {
  const moderation = await getNewBookModerationForUser(user);
  const results = [];
  const createdBooks = [];
  const { artistCache, publisherCache } = await batchResolveCreators(rows, user);
  for (const row of rows) {
    const [resolveError, artist, publisher] = await resolveCreatorsForImportRow(
      row,
      user,
      artistCache,
      publisherCache
    );
    if (resolveError || !artist) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: resolveError ?? "Could not resolve creators"
      });
      continue;
    }
    const existingBook = await db.query.books.findFirst({
      where: and(
        eq(books.title, row.title),
        eq(books.artistId, artist.id),
        eq(books.createdByUserId, user.id)
      ),
      columns: { id: true, title: true }
    });
    if (existingBook) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: "Book already exists with this title and artist (possible duplicate)"
      });
      continue;
    }
    const formData = rowToBookFormData(row, user.creator.type);
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      moderation
    );
    const book = await createBook(bookData);
    if (!book) {
      results.push({
        rowNumber: row.rowNumber,
        title: row.title,
        success: false,
        error: "Failed to create book"
      });
      continue;
    }
    if (book.approvalStatus === "pending") {
      await notifyAdminBookPendingReview({
        bookId: book.id,
        title: book.title,
        actorUserId: user.id
      });
    }
    createdBooks.push(book);
    results.push({
      rowNumber: row.rowNumber,
      title: row.title,
      success: true,
      bookId: book.id
    });
  }
  return { results, createdBooks };
}
export {
  importBooksFromRows
};
