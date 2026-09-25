import { eq, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import { books, printerBooks, printers } from "../../../db/schema";
import { err, ok } from "../../../lib/result";
import { invalidateBookCache } from "../../app/services";
import { generateUniquePrinterSlug } from "../admin/printers/services";

export async function listPrinterOptions() {
  const rows = await db.query.printers.findMany({
    columns: { id: true, name: true },
    orderBy: (printers, { asc }) => [asc(printers.name)],
  });
  return rows.map((printer) => ({ id: printer.id, label: printer.name }));
}

/** Match an existing printer, or create an unpublished one from a new name. */
export async function resolveBookPrinter(formData: {
  printer_id?: string;
  new_printer_name?: string;
}) {
  const { printer_id, new_printer_name } = formData;
  if (!printer_id && !new_printer_name) return ok(null);

  if (printer_id) {
    const printer = await db.query.printers.findFirst({
      where: eq(printers.id, printer_id),
      columns: { id: true },
    });
    if (!printer) return err({ reason: "Invalid printer" });
    return ok(printer);
  }

  const name = new_printer_name!.trim();
  if (name.length < 2) {
    return err({ reason: "Printer name must be at least 2 characters" });
  }

  const existing = await db.query.printers.findFirst({
    where: sql`lower(${printers.name}) = lower(${name})`,
    columns: { id: true },
  });
  if (existing) return ok(existing);

  const slug = await generateUniquePrinterSlug(name);
  const [created] = await db
    .insert(printers)
    .values({
      name,
      slug,
      // ponytail: name-only stub. Admin fills email/city/country before publish.
      email: "",
      city: "",
      country: "",
      status: "draft",
    })
    .returning({ id: printers.id });
  if (!created) return err({ reason: "Failed to create printer" });
  return ok(created);
}

/** The book form stores one printer. Replaces any previous link for this book. */
export async function setBookPrinter(bookId: string, printerId: string | null) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(printerBooks).where(eq(printerBooks.bookId, bookId));
      if (printerId) {
        await tx.insert(printerBooks).values({
          bookId,
          printerId,
          sortOrder: 0,
        });
      }
    });

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
      columns: { slug: true },
    });
    if (book?.slug) invalidateBookCache(book.slug);
    return ok(true);
  } catch (error) {
    console.error("Failed to set book printer", error);
    return err({ reason: "Failed to save printer", cause: error });
  }
}
