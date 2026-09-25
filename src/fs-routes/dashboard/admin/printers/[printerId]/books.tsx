import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../../lib/validator";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import Alert from "../../../../../components/app/Alert";
import { printerIdSchema } from "../../../../../features/dashboard/admin/printers/schema";
import {
  addPrinterBook,
  removePrinterBook,
  searchBooksForPrinter,
} from "../../../../../features/dashboard/admin/printers/services";
import {
  PrinterBookSearchResults,
  PrinterBooksList,
} from "../../../../../features/dashboard/admin/printers/components/PrinterBooks";

const bookIdSchema = z.string().uuid();

export const GET = createRoute(paramValidator(printerIdSchema), async (c) => {
  const printerId = c.req.valid("param").printerId;
  const query = c.req.query("q") ?? "";
  const [error, results] = await searchBooksForPrinter(printerId, query);
  if (error || !results) {
    return showErrorAlert(c, error?.reason ?? "Failed to search books");
  }
  return c.html(
    <PrinterBookSearchResults
      printerId={printerId}
      query={query}
      results={results}
    />,
  );
});

export const POST = createRoute(paramValidator(printerIdSchema), async (c) => {
  const printerId = c.req.valid("param").printerId;
  const body = await c.req.parseBody();
  const parsed = bookIdSchema.safeParse(String(body.bookId ?? ""));
  const query = String(body.q ?? "");
  if (!parsed.success) return showErrorAlert(c, "Choose a book to add.");

  const [error, books] = await addPrinterBook(printerId, parsed.data);
  if (error || !books) return showErrorAlert(c, error?.reason ?? "Failed to add book");

  const [searchError, results] = await searchBooksForPrinter(printerId, query);
  if (searchError || !results) {
    return showErrorAlert(c, searchError?.reason ?? "Failed to search books");
  }

  return c.html(
    <>
      <Alert type="success" message="Book added." />
      <PrinterBooksList printerId={printerId} books={books} />
      <PrinterBookSearchResults
        printerId={printerId}
        query={query}
        results={results}
      />
    </>,
  );
});

export const DELETE = createRoute(
  paramValidator(printerIdSchema),
  async (c) => {
    const printerId = c.req.valid("param").printerId;
    const body = await c.req.parseBody();
    const parsed = bookIdSchema.safeParse(String(body.bookId ?? ""));
    if (!parsed.success) return showErrorAlert(c, "Choose a book to remove.");

    const [error, books] = await removePrinterBook(printerId, parsed.data);
    if (error || !books) {
      return showErrorAlert(c, error?.reason ?? "Failed to remove book");
    }

    return c.html(
      <>
        <Alert type="success" message="Book removed." />
        <PrinterBooksList printerId={printerId} books={books} />
      </>,
    );
  },
);
