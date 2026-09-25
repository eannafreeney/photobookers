import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  printQuoteRecipients,
  printQuoteRequests,
  printerBooks,
  printerImages,
  printers,
} from "../../../db/schema";
import { err, ok } from "../../../lib/result";
import { sendAdminEmail, sendEmail } from "../../../lib/sendEmail";
import {
  personDisplayName,
  quoteRequestEmailHtml,
} from "./emails";
import {
  planQuotePrinters,
  printedBookLinks,
  unpublishedPrinterIds,
} from "./rules";

const published = eq(printers.status, "published");

export async function getPublishedPrinters() {
  try {
    const rows = await db
      .select()
      .from(printers)
      .where(published)
      .orderBy(asc(printers.name));
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
        printedBooks: {
          orderBy: [asc(printerBooks.sortOrder), asc(printerBooks.createdAt)],
          with: {
            book: {
              columns: {
                id: true,
                title: true,
                slug: true,
                coverUrl: true,
                publicationStatus: true,
                approvalStatus: true,
                releaseDate: true,
              },
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
      printedBooks: printedBookLinks(printedBooks, { publicOnly: true }),
    });
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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    char === "&"
      ? "&amp;"
      : char === "<"
        ? "&lt;"
        : char === ">"
          ? "&gt;"
          : char === '"'
            ? "&quot;"
            : "&#39;",
  );

export async function submitPrinterRecommendation(
  input: { name: string; city: string; country: string; link: string },
  user: { email: string; firstName: string | null; lastName: string | null },
) {
  const who =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const html = `
    <h2>Printer recommendation</h2>
    <p>${escapeHtml(who)} (${escapeHtml(user.email)}) recommended a printer.</p>
    <p>Name: ${escapeHtml(input.name)}</p>
    <p>City: ${escapeHtml(input.city)}</p>
    <p>Country: ${escapeHtml(input.country)}</p>
    <p>Link: <a href="${escapeHtml(input.link)}">${escapeHtml(input.link)}</a></p>
  `;
  return sendAdminEmail(`Printer recommendation: ${input.name}`, html);
}

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
