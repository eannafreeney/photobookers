import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { and, eq, gte, sql } from "drizzle-orm";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs.js";
import InfoPage from "../../../pages/InfoPage.js";
import Alert from "../../../components/app/Alert.js";
import { getFlash, getUser, setFlash } from "../../../utils.js";
import BookImportForm from "../../../features/dashboard/books/import/components/BookImportForm.js";
import BookImportResults from "../../../features/dashboard/books/import/components/BookImportResults.js";
import {
  MAX_IMPORT_FILE_BYTES,
  MAX_IMPORTS_PER_HOUR,
  MAX_BOOKS_CREATED_PER_DAY
} from "../../../features/dashboard/books/import/constants.js";
import { parseCsvContent } from "../../../features/dashboard/books/import/parseCsv.js";
import {
  getValidRows,
  validateImportRows
} from "../../../features/dashboard/books/import/validateRows.js";
import { importBooksFromRows } from "../../../features/dashboard/books/import/importBooks.js";
import { importConfirmRowsSchema } from "../../../features/dashboard/books/import/schema.js";
import { db } from "../../../db/client.js";
import { books } from "../../../db/schema.js";
async function checkImportRateLimit(userId) {
  try {
    const oneHourAgo = new Date(Date.now() - 36e5);
    const hourlyResult = await db.select({ count: sql`count(*)` }).from(books).where(
      and(
        eq(books.createdByUserId, userId),
        gte(books.createdAt, oneHourAgo)
      )
    );
    const hourlyCount = hourlyResult[0]?.count ?? 0;
    if (hourlyCount >= MAX_IMPORTS_PER_HOUR * 100) {
      return {
        allowed: false,
        reason: `Import rate limit exceeded. You've created ${hourlyCount} books in the last hour. Please try again later.`
      };
    }
    const oneDayAgo = new Date(Date.now() - 864e5);
    const dailyResult = await db.select({ count: sql`count(*)` }).from(books).where(
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
    return { allowed: true };
  }
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user.creator) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }));
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Import Books",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            Breadcrumbs,
            {
              items: [
                { label: "Books Overview", href: "/dashboard" },
                { label: "Import CSV" }
              ]
            }
          ),
          /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
        ] })
      }
    )
  );
});
function isCsvFile(file) {
  return !!file && typeof file === "object" && "arrayBuffer" in file && "size" in file && "name" in file;
}
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  if (!user.creator) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }));
  }
  const body = await c.req.parseBody();
  const intent = String(body.intent ?? "");
  if (intent === "confirm") {
    const rowsJson = String(body.rows_json ?? "");
    let parsedRows;
    try {
      parsedRows = JSON.parse(rowsJson);
    } catch {
      return c.html(
        /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Invalid import data. Please preview again." }),
          /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
        ] }) })
      );
    }
    const validated = importConfirmRowsSchema.safeParse(parsedRows);
    if (!validated.success) {
      return c.html(
        /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            Alert,
            {
              type: "danger",
              message: "Import data failed validation. Please preview again."
            }
          ),
          /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
        ] }) })
      );
    }
    const rateLimitCheck = await checkImportRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      return c.html(
        /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(Alert, { type: "danger", message: rateLimitCheck.reason ?? "Rate limit exceeded" }),
          /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
        ] }) })
      );
    }
    const { results, createdBooks } = await importBooksFromRows(
      validated.data,
      user
    );
    const createdCount = createdBooks.length;
    const failedCount = results.filter((r) => !r.success).length;
    console.log(`[AUDIT] CSV Import by user ${user.id} (${user.email}): ${createdCount} books created, ${failedCount} failed, ${validated.data.length} total rows`);
    await setFlash(
      c,
      createdCount > 0 ? "success" : "danger",
      createdCount > 0 ? `Successfully imported ${createdCount} book${createdCount === 1 ? "" : "s"}.` : "No books were imported."
    );
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
        /* @__PURE__ */ jsx(
          Breadcrumbs,
          {
            items: [
              { label: "Books Overview", href: "/dashboard" },
              { label: "Import CSV" }
            ]
          }
        ),
        /* @__PURE__ */ jsx(BookImportResults, { results })
      ] }) })
    );
  }
  if (intent !== "preview") {
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Unknown import action." }),
        /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
      ] }) })
    );
  }
  const file = body.csv;
  if (!isCsvFile(file)) {
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Please select a CSV file." }),
        /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
      ] }) })
    );
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "CSV file is too large (max 1 MB)." }),
        /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
      ] }) })
    );
  }
  const content = await file.text();
  const parsed = parseCsvContent(content);
  if (!parsed.ok) {
    return c.html(
      /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: parsed.error }),
        /* @__PURE__ */ jsx(BookImportForm, { creatorType: user.creator.type })
      ] }) })
    );
  }
  const previewResults = validateImportRows(parsed.rows, user.creator.type);
  const validRows = getValidRows(previewResults);
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Import Books", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(
        Breadcrumbs,
        {
          items: [
            { label: "Books Overview", href: "/dashboard" },
            { label: "Import CSV" }
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        BookImportForm,
        {
          creatorType: user.creator.type,
          previewResults,
          validRows
        }
      )
    ] }) })
  );
});
export {
  GET,
  POST
};
