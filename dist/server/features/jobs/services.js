import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { books, creators, follows, users } from "../../db/schema.js";
import {
  buildCreatorPostNotificationHtml,
  buildNewBookNotificationHtml
} from "./emails.js";
import {
  getPostsDueForFollowerNotification,
  markPostNotificationsSent
} from "../../domain/posts/services.js";
import { formatShelfOwnerName } from "../../domain/shelf/utils.js";
import { sql } from "drizzle-orm";
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
async function buildCreatorPostNotificationEmails() {
  const duePosts = await getPostsDueForFollowerNotification();
  const emails = [];
  const postIds = [];
  for (const post of duePosts) {
    const creator = post.user.creators[0] ?? null;
    let toList = [];
    let displayName;
    let profileSlug;
    let linkPath;
    if (creator) {
      toList = await getFollowerEmailsByCreatorId(creator.id);
      displayName = creator.displayName;
      profileSlug = creator.slug;
      linkPath = `/creators/${creator.slug}`;
    } else if (post.user.shelfPublic && post.user.shelfSlug) {
      toList = await getFollowerEmailsByUserId(post.user.id);
      displayName = formatShelfOwnerName(post.user);
      profileSlug = post.user.shelfSlug;
      linkPath = `/shelf/${post.user.shelfSlug}`;
    } else {
      postIds.push(post.id);
      continue;
    }
    if (toList.length === 0) {
      postIds.push(post.id);
      continue;
    }
    const subject = `New post from ${displayName}`;
    const html = buildCreatorPostNotificationHtml(
      displayName,
      profileSlug,
      post.body,
      post.imageUrl,
      linkPath
    );
    for (const to of toList) {
      emails.push({ to, subject, html });
    }
    postIds.push(post.id);
  }
  return { emails, postIds };
}
async function markCreatorPostNotificationsSent(postIds) {
  await markPostNotificationsSent(postIds);
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
async function getFollowerEmailsByUserId(userId) {
  const rows = await db.select({ email: users.email }).from(follows).innerJoin(users, eq(follows.followerUserId, users.id)).where(
    and(eq(follows.targetUserId, userId), eq(follows.targetType, "user"))
  );
  return rows.map((r) => r.email).filter(Boolean);
}
export {
  buildCreatorPostNotificationEmails,
  buildFollowerNotificationEmails,
  getBooksDueForFollowerNotification,
  getFollowerEmailsByCreatorId,
  getFollowerEmailsByUserId,
  markCreatorPostNotificationsSent,
  markFollowerNotificationsSent
};
