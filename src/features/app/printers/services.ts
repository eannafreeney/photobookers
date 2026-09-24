import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  printQuoteNotes,
  printQuoteRecipients,
  printQuoteRequests,
  printerImages,
  printers,
} from "../../../db/schema";
import { err, ok } from "../../../lib/result";
import { sendEmail } from "../../../lib/sendEmail";
import {
  personDisplayName,
  quoteRequestEmailHtml,
} from "./emails";
import {
  canLeavePrinterNote,
  planQuotePrinters,
  unpublishedPrinterIds,
} from "./rules";

const published = eq(printers.status, "published");

export async function getPublishedPrinters() {
  try {
    const rows = await db
      .select()
      .from(printers)
      .where(published)
      .orderBy(sql`${printers.sortOrder} ASC NULLS LAST`, asc(printers.name));
    return ok(rows);
  } catch (error) {
    console.error("Failed to list printers", error);
    return err({ reason: "Failed to list printers", cause: error });
  }
}

export async function getPrinterBySlug(slug: string) {
  try {
    const printer = await db.query.printers.findFirst({
      where: eq(printers.slug, slug),
      with: {
        images: { orderBy: [asc(printerImages.sortOrder)] },
        notes: {
          orderBy: [desc(printQuoteNotes.createdAt)],
          with: {
            user: {
              columns: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!printer) return err({ reason: "Printer not found" });
    return ok(printer);
  } catch (error) {
    console.error("Failed to get printer", error);
    return err({ reason: "Failed to get printer", cause: error });
  }
}

export type QuoteRequestInput = {
  printerIds: string[];
  copies: number;
  pageCount: number;
  trimSize: string;
  binding: string;
  deadline: string;
  shipToCountry: string;
  referenceBooks?: string | null;
  message?: string | null;
};

export async function submitQuoteRequest(
  input: QuoteRequestInput,
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  },
) {
  const [planError, printerIds] = planQuotePrinters(input.printerIds);
  if (planError) return err(planError);

  try {
    const matches = await db
      .select({
        id: printers.id,
        name: printers.name,
        email: printers.email,
      })
      .from(printers)
      .where(and(published, inArray(printers.id, printerIds)));

    const missing = unpublishedPrinterIds(
      printerIds,
      matches.map((printer) => printer.id),
    );
    if (missing.length > 0) {
      return err({ reason: "Choose published printers" });
    }

    const [request] = await db
      .insert(printQuoteRequests)
      .values({
        userId: user.id,
        copies: input.copies,
        pageCount: input.pageCount,
        trimSize: input.trimSize,
        binding: input.binding,
        deadline: input.deadline,
        shipToCountry: input.shipToCountry,
        referenceBooks: input.referenceBooks || null,
        message: input.message || null,
      })
      .returning();

    if (!request) return err({ reason: "Failed to save quote request" });

    await db.insert(printQuoteRecipients).values(
      matches.map((printer) => ({
        requestId: request.id,
        printerId: printer.id,
      })),
    );

    const personName = personDisplayName(user);
    let failed = 0;
    for (const printer of matches) {
      const [emailError] = await sendEmail(
        printer.email,
        `Print quote request from ${personName}`,
        quoteRequestEmailHtml({
          printerName: printer.name,
          personName,
          personEmail: user.email,
          copies: input.copies,
          pageCount: input.pageCount,
          trimSize: input.trimSize,
          binding: input.binding,
          deadline: input.deadline,
          shipToCountry: input.shipToCountry,
          referenceBooks: input.referenceBooks,
          message: input.message,
        }),
      );
      await db
        .update(printQuoteRecipients)
        .set(
          emailError
            ? { emailError: emailError.reason.slice(0, 500) }
            : { emailSentAt: new Date() },
        )
        .where(
          and(
            eq(printQuoteRecipients.requestId, request.id),
            eq(printQuoteRecipients.printerId, printer.id),
          ),
        );
      if (emailError) failed += 1;
    }

    return ok({
      printerNames: matches.map((printer) => printer.name),
      failed,
    });
  } catch (error) {
    console.error("Failed to submit quote request", error);
    return err({ reason: "Failed to submit quote request", cause: error });
  }
}

export async function userCanNotePrinter(userId: string, printerId: string) {
  try {
    const existing = await db.query.printQuoteNotes.findFirst({
      where: and(
        eq(printQuoteNotes.userId, userId),
        eq(printQuoteNotes.printerId, printerId),
      ),
      columns: { id: true },
    });
    if (existing) return ok({ canNote: false as const });

    const recipient = await db
      .select({ requestId: printQuoteRecipients.requestId })
      .from(printQuoteRecipients)
      .innerJoin(
        printQuoteRequests,
        eq(printQuoteRequests.id, printQuoteRecipients.requestId),
      )
      .where(
        and(
          eq(printQuoteRecipients.printerId, printerId),
          eq(printQuoteRequests.userId, userId),
        ),
      )
      .limit(1);

    const requestId = recipient[0]?.requestId;
    const [noteError] = canLeavePrinterNote(Boolean(requestId));
    if (noteError || !requestId) return ok({ canNote: false as const });
    return ok({ canNote: true as const, requestId });
  } catch (error) {
    console.error("Failed to check printer note", error);
    return err({ reason: "Failed to check printer note", cause: error });
  }
}

export async function createPrinterNote(input: {
  userId: string;
  printerId: string;
  requestId: string;
  replied: boolean;
  printed: boolean;
  body: string;
}) {
  const recipient = await db
    .select({ id: printQuoteRecipients.id })
    .from(printQuoteRecipients)
    .innerJoin(
      printQuoteRequests,
      eq(printQuoteRequests.id, printQuoteRecipients.requestId),
    )
    .where(
      and(
        eq(printQuoteRecipients.requestId, input.requestId),
        eq(printQuoteRecipients.printerId, input.printerId),
        eq(printQuoteRequests.userId, input.userId),
      ),
    )
    .limit(1);

  const [noteError] = canLeavePrinterNote(recipient.length > 0);
  if (noteError) return err(noteError);

  try {
    const [note] = await db
      .insert(printQuoteNotes)
      .values(input)
      .returning();
    if (!note) return err({ reason: "Failed to save note" });
    return ok(note);
  } catch (error) {
    console.error("Failed to save printer note", error);
    return err({ reason: "Failed to save note", cause: error });
  }
}
