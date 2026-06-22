import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { and, eq, gte, sql } from "drizzle-orm";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../pages/InfoPage";
import Alert from "../../../components/app/Alert";
import { getFlash, getUser, setFlash } from "../../../utils";
import BookImportForm from "../../../features/dashboard/books/import/components/BookImportForm";
import BookImportResults from "../../../features/dashboard/books/import/components/BookImportResults";
import { 
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORTS_PER_HOUR,
  MAX_BOOKS_CREATED_PER_DAY,
} from "../../../features/dashboard/books/import/constants";
import { parseCsvContent } from "../../../features/dashboard/books/import/parseCsv";
import {
  getValidRows,
  validateImportRows,
} from "../../../features/dashboard/books/import/validateRows";
import { importBooksFromRows } from "../../../features/dashboard/books/import/importBooks";
import { importConfirmRowsSchema } from "../../../features/dashboard/books/import/schema";
import { db } from "../../../db/client";
import { books } from "../../../db/schema";

/**
 * Check if user has exceeded rate limit for imports
 */
async function checkImportRateLimit(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Check hourly import limit
    const oneHourAgo = new Date(Date.now() - 3600000);
    const hourlyResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(
        and(
          eq(books.createdByUserId, userId),
          gte(books.createdAt, oneHourAgo)
        )
      );
    
    const hourlyCount = hourlyResult[0]?.count ?? 0;
    
    if (hourlyCount >= MAX_IMPORTS_PER_HOUR * 100) { // Assuming avg 100 books per import
      return { 
        allowed: false, 
        reason: `Import rate limit exceeded. You've created ${hourlyCount} books in the last hour. Please try again later.` 
      };
    }

    // Check daily book creation limit
    const oneDayAgo = new Date(Date.now() - 86400000);
    const dailyResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(
        and(
          eq(books.createdByUserId, userId),
          gte(books.createdAt, oneDayAgo)
        )
      );
    
    const dailyCount = dailyResult[0]?.count ?? 0;
    
    if (dailyCount >= MAX_BOOKS_CREATED_PER_DAY) {
      return { 
        allowed: false, 
        reason: `Daily book creation limit exceeded. You've created ${dailyCount} books in the last 24 hours (max ${MAX_BOOKS_CREATED_PER_DAY}).` 
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Failed to check import rate limit:", error);
    // Allow import on rate limit check failure to avoid blocking legitimate users
    return { allowed: true };
  }
}

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  return c.html(
    <AppLayout
      title="Import Books"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard" },
            { label: "Import CSV" },
          ]}
        />
        <BookImportForm creatorType={user.creator.type} />
      </Page>
    </AppLayout>,
  );
});

function isCsvFile(file: unknown): file is File {
  return (
    !!file &&
    typeof file === "object" &&
    "arrayBuffer" in file &&
    "size" in file &&
    "name" in file
  );
}

export const POST = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  const body = await c.req.parseBody();
  const intent = String(body.intent ?? "");

  if (intent === "confirm") {
    const rowsJson = String(body.rows_json ?? "");
    let parsedRows: unknown;
    try {
      parsedRows = JSON.parse(rowsJson);
    } catch {
      return c.html(
        <AppLayout title="Import Books" user={user} currentPath={currentPath}>
          <Page>
            <Alert type="danger" message="Invalid import data. Please preview again." />
            <BookImportForm creatorType={user.creator.type} />
          </Page>
        </AppLayout>,
      );
    }

    const validated = importConfirmRowsSchema.safeParse(parsedRows);
    if (!validated.success) {
      return c.html(
        <AppLayout title="Import Books" user={user} currentPath={currentPath}>
          <Page>
            <Alert
              type="danger"
              message="Import data failed validation. Please preview again."
            />
            <BookImportForm creatorType={user.creator.type} />
          </Page>
        </AppLayout>,
      );
    }

    // VALIDATION #7: Rate limiting check
    const rateLimitCheck = await checkImportRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      return c.html(
        <AppLayout title="Import Books" user={user} currentPath={currentPath}>
          <Page>
            <Alert type="danger" message={rateLimitCheck.reason ?? "Rate limit exceeded"} />
            <BookImportForm creatorType={user.creator.type} />
          </Page>
        </AppLayout>,
      );
    }

    const { results, createdBooks } = await importBooksFromRows(
      validated.data,
      user,
    );

    const createdCount = createdBooks.length;
    const failedCount = results.filter(r => !r.success).length;
    
    // #23: Audit logging - Log import event
    console.log(`[AUDIT] CSV Import by user ${user.id} (${user.email}): ${createdCount} books created, ${failedCount} failed, ${validated.data.length} total rows`);
    
    await setFlash(
      c,
      createdCount > 0 ? "success" : "danger",
      createdCount > 0
        ? `Successfully imported ${createdCount} book${createdCount === 1 ? "" : "s"}.`
        : "No books were imported.",
    );

    return c.html(
      <AppLayout title="Import Books" user={user} currentPath={currentPath}>
        <Page>
          <Breadcrumbs
            items={[
              { label: "Books Overview", href: "/dashboard" },
              { label: "Import CSV" },
            ]}
          />
          <BookImportResults results={results} />
        </Page>
      </AppLayout>,
    );
  }

  if (intent !== "preview") {
    return c.html(
      <AppLayout title="Import Books" user={user} currentPath={currentPath}>
        <Page>
          <Alert type="danger" message="Unknown import action." />
          <BookImportForm creatorType={user.creator.type} />
        </Page>
      </AppLayout>,
    );
  }

  const file = body.csv;
  if (!isCsvFile(file)) {
    return c.html(
      <AppLayout title="Import Books" user={user} currentPath={currentPath}>
        <Page>
          <Alert type="danger" message="Please select a CSV file." />
          <BookImportForm creatorType={user.creator.type} />
        </Page>
      </AppLayout>,
    );
  }

  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return c.html(
      <AppLayout title="Import Books" user={user} currentPath={currentPath}>
        <Page>
          <Alert type="danger" message="CSV file is too large (max 1 MB)." />
          <BookImportForm creatorType={user.creator.type} />
        </Page>
      </AppLayout>,
    );
  }

  const content = await file.text();
  const parsed = parseCsvContent(content);

  if (!parsed.ok) {
    return c.html(
      <AppLayout title="Import Books" user={user} currentPath={currentPath}>
        <Page>
          <Alert type="danger" message={parsed.error} />
          <BookImportForm creatorType={user.creator.type} />
        </Page>
      </AppLayout>,
    );
  }

  const previewResults = validateImportRows(parsed.rows, user.creator.type);
  const validRows = getValidRows(previewResults);

  return c.html(
    <AppLayout title="Import Books" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard" },
            { label: "Import CSV" },
          ]}
        />
        <BookImportForm
          creatorType={user.creator.type}
          previewResults={previewResults}
          validRows={validRows}
        />
      </Page>
    </AppLayout>,
  );
});
