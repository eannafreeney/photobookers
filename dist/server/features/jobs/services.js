import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { books, creatorMessages, creators, follows, users } from "../../db/schema.js";
import {
  buildCreatorPostNotificationHtml,
  buildNewBookNotificationHtml
} from "./emails.js";
async function buildFollowerNotificationEmails() {
  const dueBooks = await getBooksDueForFollowerNotification();
  const emails = [];
  const bookIds = [];
  for (const book of dueBooks) {
    if (!book.creatorId) continue;
    const toList = await getFollowerEmailsByCreatorId(book.creatorId);
    const subject = `${book.creatorDisplayName} released a new book: ${book.title}`;
    const html = buildNewBookNotificationHtml(
      book.creatorDisplayName,
      book.title,
      book.slug,
      book.coverUrl
    );
    for (const to of toList) {
      emails.push({ to, subject, html });
    }
    bookIds.push(book.id);
  }
  return { emails, bookIds };
}
async function markFollowerNotificationsSent(bookIds) {
  if (bookIds.length === 0) return;
  await db.update(books).set({ notifyFollowersSentAt: /* @__PURE__ */ new Date() }).where(inArray(books.id, bookIds));
}
async function getPostsDueForFollowerNotification() {
  return db.select({
    id: creatorMessages.id,
    body: creatorMessages.body,
    imageUrls: creatorMessages.imageUrls,
    creatorId: creatorMessages.creatorId,
    creatorDisplayName: creators.displayName,
    creatorSlug: creators.slug
  }).from(creatorMessages).innerJoin(creators, eq(creatorMessages.creatorId, creators.id)).where(isNull(creatorMessages.notifyFollowersSentAt)).orderBy(creatorMessages.createdAt);
}
async function buildCreatorPostNotificationEmails() {
  const duePosts = await getPostsDueForFollowerNotification();
  const emails = [];
  const postIds = [];
  for (const post of duePosts) {
    const toList = await getFollowerEmailsByCreatorId(post.creatorId);
    if (toList.length === 0) {
      postIds.push(post.id);
      continue;
    }
    const subject = `New post from ${post.creatorDisplayName}`;
    const html = buildCreatorPostNotificationHtml(
      post.creatorDisplayName,
      post.creatorSlug,
      post.body,
      post.imageUrls?.[0] ?? null
    );
    for (const to of toList) {
      emails.push({ to, subject, html });
    }
    postIds.push(post.id);
  }
  return { emails, postIds };
}
async function markCreatorPostNotificationsSent(postIds) {
  if (postIds.length === 0) return;
  await db.update(creatorMessages).set({ notifyFollowersSentAt: /* @__PURE__ */ new Date() }).where(inArray(creatorMessages.id, postIds));
}
async function getBooksDueForFollowerNotification() {
  const today = sql`CURRENT_DATE`;
  return db.select({
    id: books.id,
    title: books.title,
    coverUrl: books.coverUrl,
    slug: books.slug,
    creatorId: books.notifyFollowersCreatorId,
    creatorDisplayName: creators.displayName
  }).from(books).innerJoin(creators, eq(books.notifyFollowersCreatorId, creators.id)).where(
    and(
      eq(books.notifyFollowersOnRelease, true),
      isNull(books.notifyFollowersSentAt),
      sql`DATE(${books.notifyFollowersScheduledDate}) = ${today}`,
      eq(books.publicationStatus, "published"),
      eq(books.availabilityStatus, "available")
    )
  );
}
async function getFollowerEmailsByCreatorId(creatorId) {
  const rows = await db.select({ email: users.email }).from(follows).innerJoin(users, eq(follows.followerUserId, users.id)).where(
    and(
      eq(follows.targetCreatorId, creatorId),
      eq(follows.targetType, "creator")
    )
  );
  return rows.map((r) => r.email).filter(Boolean);
}
export {
  buildCreatorPostNotificationEmails,
  buildFollowerNotificationEmails,
  getBooksDueForFollowerNotification,
  getFollowerEmailsByCreatorId,
  getPostsDueForFollowerNotification,
  markCreatorPostNotificationsSent,
  markFollowerNotificationsSent
};
