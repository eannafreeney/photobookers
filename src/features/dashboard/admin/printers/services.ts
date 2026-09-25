import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lte,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../../../db/client";
import { slugify } from "../../../../utils";
import {
  books,
  creators,
  printQuoteRecipients,
  printQuoteRequests,
  printerBooks,
  printerImages,
  printers,
  type NewPrinter,
  type UpdatePrinter,
} from "../../../../db/schema";
import { err, ok } from "../../../../lib/result";
import { sendEmail } from "../../../../lib/sendEmail";
import { isFeatureEnabled } from "../../../../lib/features";
import { appBaseUrl } from "../../../app/spotlightUrls";
import { printedBookLinks } from "../../../app/printers/rules";
import { printerIntroEmailHtml, printerIntroEmailSubject } from "./emails";

const printedBookColumns = {
  id: true,
  title: true,
  slug: true,
  coverUrl: true,
  publicationStatus: true,
  approvalStatus: true,
  releaseDate: true,
} as const;

export async function getPrintersAdmin() {
  try {
    const rows = await db
      .select()
      .from(printers)
      .orderBy(asc(printers.name));

    const recipientStats = await db
      .select({
        printerId: printQuoteRecipients.printerId,
        requests: count(),
        failed: sql<number>`count(*) filter (where ${printQuoteRecipients.emailError} is not null)::int`,
        people: sql<number>`count(distinct ${printQuoteRequests.userId})::int`,
      })
      .from(printQuoteRecipients)
      .innerJoin(
        printQuoteRequests,
        eq(printQuoteRequests.id, printQuoteRecipients.requestId),
      )
      .groupBy(printQuoteRecipients.printerId);

    const requestsByPrinter = new Map(
      recipientStats.map((row) => [row.printerId, row]),
    );

    return ok(
      rows.map((printer) => ({
        ...printer,
        requests: requestsByPrinter.get(printer.id)?.requests ?? 0,
        failed: requestsByPrinter.get(printer.id)?.failed ?? 0,
        people: requestsByPrinter.get(printer.id)?.people ?? 0,
      })),
    );
  } catch (error) {
    console.error("Failed to list printers", error);
    return err({ reason: "Failed to list printers", cause: error });
  }
}

export async function getRecentQuoteRequests() {
  try {
    const requests = await db.query.printQuoteRequests.findMany({
      orderBy: [desc(printQuoteRequests.createdAt)],
      limit: 30,
      with: {
        user: {
          columns: { email: true, firstName: true, lastName: true },
        },
        recipients: {
          with: {
            printer: { columns: { name: true } },
          },
        },
      },
    });
    return ok(requests);
  } catch (error) {
    console.error("Failed to list quote requests", error);
    return err({ reason: "Failed to list quote requests", cause: error });
  }
}

export async function getPrinterByIdAdmin(printerId: string) {
  try {
    const printer = await db.query.printers.findFirst({
      where: eq(printers.id, printerId),
      with: {
        images: { orderBy: [asc(printerImages.sortOrder)] },
        printedBooks: {
          orderBy: [asc(printerBooks.sortOrder), asc(printerBooks.createdAt)],
          with: {
            book: {
              columns: printedBookColumns,
              with: { artist: { columns: { displayName: true } } },
            },
          },
        },
      },
    });
    if (!printer) return err({ reason: "Printer not found" });
    const { printedBooks, ...rest } = printer;
    return ok({
      ...rest,
      printedBooks: printedBookLinks(printedBooks),
    });
  } catch (error) {
    console.error("Failed to get printer", error);
    return err({ reason: "Failed to get printer", cause: error });
  }
}

export async function generateUniquePrinterSlug(name: string, exceptId?: string) {
  const baseSlug = slugify(name) || "printer";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: printers.id })
      .from(printers)
      .where(eq(printers.slug, slug))
      .limit(1);

    if (existing.length === 0 || existing[0]?.id === exceptId) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createPrinterAdmin(
  data: Omit<NewPrinter, "id" | "createdAt" | "updatedAt">,
) {
  try {
    const [printer] = await db.insert(printers).values(data).returning();
    if (!printer) return err({ reason: "Failed to create printer" });
    return ok(printer);
  } catch (error) {
    console.error("Failed to create printer", error);
    return err({ reason: "Failed to create printer", cause: error });
  }
}

export async function deletePrinterAdmin(printerId: string) {
  try {
    const [printer] = await db
      .delete(printers)
      .where(eq(printers.id, printerId))
      .returning();
    if (!printer) return err({ reason: "Printer not found" });
    return ok(printer);
  } catch (error) {
    console.error("Failed to delete printer", error);
    return err({ reason: "Failed to delete printer", cause: error });
  }
}

export async function updatePrinterAdmin(
  printerId: string,
  updates: UpdatePrinter,
) {
  try {
    const [printer] = await db
      .update(printers)
      .set(updates)
      .where(eq(printers.id, printerId))
      .returning();
    if (!printer) return err({ reason: "Printer not found" });
    return ok(printer);
  } catch (error) {
    console.error("Failed to update printer", error);
    return err({ reason: "Failed to update printer", cause: error });
  }
}

export function updatePrinterCover(printerId: string, coverUrl: string) {
  return updatePrinterAdmin(printerId, { coverUrl });
}

export function updatePrinterBanner(printerId: string, bannerUrl: string) {
  return updatePrinterAdmin(printerId, { bannerUrl });
}

export async function addPrinterImages(
  printerId: string,
  urls: string[],
) {
  if (urls.length === 0) return ok([]);
  try {
    const [{ value: existing = 0 } = { value: 0 }] = await db
      .select({ value: count() })
      .from(printerImages)
      .where(eq(printerImages.printerId, printerId));

    const rows = await db
      .insert(printerImages)
      .values(
        urls.map((imageUrl, index) => ({
          printerId,
          imageUrl,
          sortOrder: existing + index,
        })),
      )
      .returning();
    return ok(rows);
  } catch (error) {
    console.error("Failed to save printer images", error);
    return err({ reason: "Failed to save printer images", cause: error });
  }
}

export async function sendPrinterIntroEmail(printerId: string) {
  try {
    const printer = await db.query.printers.findFirst({
      where: eq(printers.id, printerId),
    });
    if (!printer) return err({ reason: "Printer not found" });
    if (printer.introEmailSentAt) {
      return err({ reason: "Intro email already sent" });
    }

    const profileUrl = `${appBaseUrl()}/printers/${printer.slug}`;
    const [emailError] = await sendEmail(
      printer.email,
      printerIntroEmailSubject(),
      printerIntroEmailHtml({
        name: printer.name,
        profileUrl,
        profileIsPublic: isFeatureEnabled("printers"),
      }),
    );
    if (emailError) return err(emailError);

    const [updated] = await db
      .update(printers)
      .set({ introEmailSentAt: new Date() })
      .where(and(eq(printers.id, printerId), isNull(printers.introEmailSentAt)))
      .returning();
    if (!updated) return err({ reason: "Intro email already sent" });
    return ok(updated);
  } catch (error) {
    console.error("Failed to send printer intro email", error);
    return err({ reason: "Failed to send printer intro email", cause: error });
  }
}

async function listPrinterBooks(printerId: string) {
  const rows = await db.query.printerBooks.findMany({
    where: eq(printerBooks.printerId, printerId),
    orderBy: [asc(printerBooks.sortOrder), asc(printerBooks.createdAt)],
    with: {
      book: {
        columns: printedBookColumns,
        with: { artist: { columns: { displayName: true } } },
      },
    },
  });
  return printedBookLinks(rows);
}

export async function searchBooksForPrinter(printerId: string, query: string) {
  const q = query.trim();
  if (q.length < 2) return ok([]);

  try {
    const existing = await db.query.printerBooks.findMany({
      where: eq(printerBooks.printerId, printerId),
      columns: { bookId: true },
    });
    const existingIds = existing.map((row) => row.bookId);

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(ilike(creators.displayName, `%${q}%`));
    const creatorIds = creatorRows.map((row) => row.id);
    const match =
      creatorIds.length > 0
        ? or(
            ilike(books.title, `%${q}%`),
            inArray(books.artistId, creatorIds),
            inArray(books.publisherId, creatorIds),
          )
        : ilike(books.title, `%${q}%`);

    const rows = await db.query.books.findMany({
      where: and(
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
        or(isNull(books.releaseDate), lte(books.releaseDate, new Date())),
        match,
        existingIds.length > 0 ? notInArray(books.id, existingIds) : undefined,
      ),
      orderBy: (table, { asc: orderAsc }) => [orderAsc(table.title)],
      limit: 12,
      columns: { id: true, title: true, slug: true, coverUrl: true },
      with: { artist: { columns: { displayName: true } } },
    });

    return ok(
      rows.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        coverUrl: book.coverUrl,
        artistName: book.artist?.displayName ?? null,
      })),
    );
  } catch (error) {
    console.error("Failed to search books for printer", error);
    return err({ reason: "Failed to search books", cause: error });
  }
}

export async function addPrinterBook(printerId: string, bookId: string) {
  try {
    const existing = await db.query.printerBooks.findFirst({
      where: and(
        eq(printerBooks.printerId, printerId),
        eq(printerBooks.bookId, bookId),
      ),
      columns: { id: true },
    });
    if (existing) return ok(await listPrinterBooks(printerId));

    const book = await db.query.books.findFirst({
      where: and(
        eq(books.id, bookId),
        eq(books.publicationStatus, "published"),
        eq(books.approvalStatus, "approved"),
      ),
      columns: { id: true },
    });
    if (!book) return err({ reason: "Book not found" });

    const [position] = await db
      .select({
        value: sql<number>`coalesce(max(${printerBooks.sortOrder}), -1)`,
      })
      .from(printerBooks)
      .where(eq(printerBooks.printerId, printerId));

    await db.insert(printerBooks).values({
      printerId,
      bookId,
      sortOrder: Number(position?.value ?? -1) + 1,
    });
    return ok(await listPrinterBooks(printerId));
  } catch (error) {
    console.error("Failed to add printer book", error);
    return err({ reason: "Failed to add book", cause: error });
  }
}

export async function removePrinterBook(printerId: string, bookId: string) {
  try {
    await db
      .delete(printerBooks)
      .where(
        and(
          eq(printerBooks.printerId, printerId),
          eq(printerBooks.bookId, bookId),
        ),
      );
    return ok(await listPrinterBooks(printerId));
  } catch (error) {
    console.error("Failed to remove printer book", error);
    return err({ reason: "Failed to remove book", cause: error });
  }
}

export async function deletePrinterImage(printerId: string, imageId: string) {
  try {
    const [row] = await db
      .delete(printerImages)
      .where(
        and(eq(printerImages.id, imageId), eq(printerImages.printerId, printerId)),
      )
      .returning();
    if (!row) return err({ reason: "Image not found" });
    return ok(row);
  } catch (error) {
    console.error("Failed to delete printer image", error);
    return err({ reason: "Failed to delete printer image", cause: error });
  }
}
