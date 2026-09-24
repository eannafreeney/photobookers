import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "../../../../db/client";
import { slugify } from "../../../../utils";
import {
  printQuoteRecipients,
  printQuoteRequests,
  printerImages,
  printers,
  type NewPrinter,
  type UpdatePrinter,
} from "../../../../db/schema";
import { err, ok } from "../../../../lib/result";

export async function getPrintersAdmin() {
  try {
    const rows = await db
      .select()
      .from(printers)
      .orderBy(sql`${printers.sortOrder} ASC NULLS LAST`, asc(printers.name));

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
      with: { images: { orderBy: [asc(printerImages.sortOrder)] } },
    });
    if (!printer) return err({ reason: "Printer not found" });
    return ok(printer);
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

export async function updatePrinterLogo(printerId: string, logoUrl: string) {
  try {
    const [printer] = await db
      .update(printers)
      .set({ logoUrl })
      .where(eq(printers.id, printerId))
      .returning();
    if (!printer) return err({ reason: "Printer not found" });
    return ok(printer);
  } catch (error) {
    console.error("Failed to update printer logo", error);
    return err({ reason: "Failed to update printer logo", cause: error });
  }
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
