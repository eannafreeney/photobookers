import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators, follows, users } from "../../db/schema";
import {
  buildCreatorPostNotificationHtml,
  buildNewBookNotificationHtml,
} from "./emails";
import {
  getPostsDueForFollowerNotification,
  markPostNotificationsSent,
} from "../../domain/posts/services";
import { formatShelfOwnerName } from "../../domain/shelf/utils";
import { sql } from "drizzle-orm";

export type EmailToSend = { to: string; subject: string; html: string };

/** Build one batch of emails for all books due today (one email per follower per book). */
export async function buildFollowerNotificationEmails(): Promise<{
  emails: EmailToSend[];
  bookIds: string[];
}> {
  const dueBooks = await getBooksDueForFollowerNotification();
  const emails: EmailToSend[] = [];
  const bookIds: string[] = [];
  for (const book of dueBooks) {
    if (!book.creatorId) continue;
    const toList = await getFollowerEmailsByCreatorId(book.creatorId);
    const subject = `${book.creatorDisplayName} released a new book: ${book.title}`;
    const html = buildNewBookNotificationHtml(
      book.creatorDisplayName,
      book.title,
      book.slug,
      book.coverUrl,
    );
    for (const to of toList) {
      emails.push({ to, subject, html });
    }
    bookIds.push(book.id);
  }
  return { emails, bookIds };
}

export async function markFollowerNotificationsSent(bookIds: string[]) {
  if (bookIds.length === 0) return;
  await db
    .update(books)
    .set({ notifyFollowersSentAt: new Date() })
    .where(inArray(books.id, bookIds));
}

/** Build emails for unsent unified posts (creator-followers or user-followers). */
export async function buildCreatorPostNotificationEmails(): Promise<{
  emails: EmailToSend[];
  postIds: string[];
}> {
  const duePosts = await getPostsDueForFollowerNotification();
  const emails: EmailToSend[] = [];
  const postIds: string[] = [];

  for (const post of duePosts) {
    const creator = post.user.creators[0] ?? null;
    let toList: string[] = [];
    let displayName: string;
    let profileSlug: string;
    let linkPath: string;

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
      // No audience yet — mark sent so it doesn't retry forever.
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
      linkPath,
    );
    for (const to of toList) {
      emails.push({ to, subject, html });
    }
    postIds.push(post.id);
  }

  return { emails, postIds };
}

export async function markCreatorPostNotificationsSent(postIds: string[]) {
  await markPostNotificationsSent(postIds);
}

/** Books that should trigger "notify followers" today (scheduled date = today, not yet sent). */
export async function getBooksDueForFollowerNotification() {
  const today = sql`CURRENT_DATE`;
  return db
    .select({
      id: books.id,
      title: books.title,
      coverUrl: books.coverUrl,
      slug: books.slug,
      creatorId: books.notifyFollowersCreatorId,
      creatorDisplayName: creators.displayName,
    })
    .from(books)
    .innerJoin(creators, eq(books.notifyFollowersCreatorId, creators.id))
    .where(
      and(
        eq(books.notifyFollowersOnRelease, true),
        isNull(books.notifyFollowersSentAt),
        sql`DATE(${books.notifyFollowersScheduledDate}) = ${today}`,
        eq(books.publicationStatus, "published"),
        eq(books.availabilityStatus, "available"),
      ),
    );
}

/** Follower emails for a creator (targetType = 'creator'). */
export async function getFollowerEmailsByCreatorId(
  creatorId: string,
): Promise<string[]> {
  const rows = await db
    .select({ email: users.email })
    .from(follows)
    .innerJoin(users, eq(follows.followerUserId, users.id))
    .where(
      and(
        eq(follows.targetCreatorId, creatorId),
        eq(follows.targetType, "creator"),
      ),
    );
  return rows.map((r) => r.email).filter(Boolean);
}

/** Follower emails for a user/shelf (targetType = 'user'). */
export async function getFollowerEmailsByUserId(
  userId: string,
): Promise<string[]> {
  const rows = await db
    .select({ email: users.email })
    .from(follows)
    .innerJoin(users, eq(follows.followerUserId, users.id))
    .where(
      and(eq(follows.targetUserId, userId), eq(follows.targetType, "user")),
    );
  return rows.map((r) => r.email).filter(Boolean);
}
