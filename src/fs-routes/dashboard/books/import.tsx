import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../pages/InfoPage";
import Alert from "../../../components/app/Alert";
import { getFlash, getUser, setFlash } from "../../../utils";
import BookImportForm from "../../../features/dashboard/books/import/components/BookImportForm";
import BookImportResults from "../../../features/dashboard/books/import/components/BookImportResults";
import { MAX_IMPORT_FILE_BYTES } from "../../../features/dashboard/books/import/constants";
import { parseCsvContent } from "../../../features/dashboard/books/import/parseCsv";
import {
  getValidRows,
  validateImportRows,
} from "../../../features/dashboard/books/import/validateRows";
import { importBooksFromRows } from "../../../features/dashboard/books/import/importBooks";
import { importConfirmRowsSchema } from "../../../features/dashboard/books/import/schema";

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
            { label: "Books Overview", href: "/dashboard/books" },
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

    const { results, createdBooks } = await importBooksFromRows(
      validated.data,
      user,
    );

    const createdCount = createdBooks.length;
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
              { label: "Books Overview", href: "/dashboard/books" },
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
            { label: "Books Overview", href: "/dashboard/books" },
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
