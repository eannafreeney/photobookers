import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { books, creators, follows, users } from "../../db/schema";
import { buildNewBookNotificationHtml } from "./emails";

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
