import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { books } from "../../db/schema";
import { sendEmail } from "../../lib/sendEmail";
import { err, ok, type Result } from "../../lib/result";
import {
  bookLiveEmailSubject,
  buildBookLiveEmailHtml,
} from "../../features/dashboard/books/emails";

type LiveEmailError = { reason: string; cause?: unknown };

type BookLiveRecipient = {
  email: string;
  displayName: string;
  instagram?: string | null;
  addedBy: "owner" | "contributor";
};

async function getBookLiveRecipients(
  bookId: string,
): Promise<Result<BookLiveRecipient[], LiveEmailError>> {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { submittedByUserId: true },
      with: {
        artist: {
          columns: { displayName: true, email: true, instagram: true },
        },
        publisher: {
          columns: { displayName: true, email: true, instagram: true },
        },
        creatorUser: {
          columns: { email: true, firstName: true, lastName: true },
        },
      },
    });
    if (!book) return err({ reason: "Book not found" });

    const recipients = new Map<string, BookLiveRecipient>();

    for (const creator of [book.artist, book.publisher]) {
      if (!creator) continue;
      const email = creator.email?.trim();
      if (!email || recipients.has(email)) continue;
      recipients.set(email, {
        email,
        displayName: creator.displayName,
        instagram: creator.instagram,
        addedBy: "owner",
      });
    }

    if (recipients.size === 0) {
      const fallbackEmail = book.creatorUser?.email?.trim();
      if (fallbackEmail) {
        const name =
          [book.creatorUser.firstName, book.creatorUser.lastName]
            .filter(Boolean)
            .join(" ")
            .trim() || "there";
        recipients.set(fallbackEmail, {
          email: fallbackEmail,
          displayName: name,
          // Contributor submissions set submittedByUserId; owner voice otherwise.
          addedBy: book.submittedByUserId ? "contributor" : "owner",
        });
      }
    }

    return ok([...recipients.values()]);
  } catch (error) {
    console.error("getBookLiveRecipients", error);
    return err({ reason: "Failed to load book contacts", cause: error });
  }
}

/** Sends the one-time “your book is live” email with cover + share copy. */
export async function sendBookLiveEmailIfNeeded(
  bookId: string,
): Promise<Result<{ sent: boolean }, LiveEmailError>> {
  try {
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        approvalStatus: true,
        publicationStatus: true,
        liveEmailSentAt: true,
      },
      with: {
        artist: { columns: { displayName: true } },
      },
    });

    if (!book) return err({ reason: "Book not found" });
    if (book.publicationStatus !== "published") return ok({ sent: false });
    if (book.approvalStatus !== "approved") return ok({ sent: false });
    if (book.liveEmailSentAt) return ok({ sent: false });
    if (!book.coverUrl?.trim()) return ok({ sent: false });

    const [recipientsError, recipients] = await getBookLiveRecipients(bookId);
    if (recipientsError) return err(recipientsError);
    if (recipients.length === 0) return ok({ sent: false });

    const subject = bookLiveEmailSubject(book.title);
    const htmlParams = {
      bookTitle: book.title,
      artistName: book.artist?.displayName ?? null,
      bookSlug: book.slug,
      coverUrl: book.coverUrl,
    };

    for (const recipient of recipients) {
      const html = buildBookLiveEmailHtml({
        recipientName: recipient.displayName,
        ...htmlParams,
        instagram: recipient.instagram,
        addedBy: recipient.addedBy,
      });
      const [emailError] = await sendEmail(recipient.email, subject, html);
      if (emailError) {
        console.error("sendBookLiveEmailIfNeeded", emailError);
        return err(emailError);
      }
    }

    await db
      .update(books)
      .set({ liveEmailSentAt: new Date() })
      .where(eq(books.id, bookId));

    return ok({ sent: true });
  } catch (error) {
    console.error("sendBookLiveEmailIfNeeded", error);
    return err({ reason: "Failed to send book live email", cause: error });
  }
}
