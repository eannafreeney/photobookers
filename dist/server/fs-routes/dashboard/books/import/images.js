import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { getFlash, getUser } from "../../../../utils.js";
import BulkCoverUpload from "../../../../features/dashboard/books/import/components/BulkCoverUpload.js";
import { getBooksForBulkBookImagesUpload } from "../../../../features/dashboard/books/services.js";
import { MAX_BOOKS_FOR_BULK_UPLOAD } from "../../../../features/dashboard/books/import/constants.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!user.creator) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found", user }));
  }
  const bookIdsParam = c.req.query("books");
  if (!bookIdsParam) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: "No books specified for cover upload",
          user
        }
      )
    );
  }
  const bookIds = bookIdsParam.split(",").filter(Boolean);
  if (bookIds.length === 0) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "No valid book IDs provided", user })
    );
  }
  if (bookIds.length > MAX_BOOKS_FOR_BULK_UPLOAD) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: `Maximum ${MAX_BOOKS_FOR_BULK_UPLOAD} books for bulk upload. You selected ${bookIds.length}.`,
          user
        }
      )
    );
  }
  const [error, creatorBooks] = await getBooksForBulkBookImagesUpload(bookIds, user);
  if (error || !creatorBooks || creatorBooks.length === 0) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: "Failed to get books for bulk cover upload",
          user
        }
      )
    );
  }
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Upload Images",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            Breadcrumbs,
            {
              items: [
                { label: "Books Overview", href: "/dashboard" },
                { label: "Import CSV", href: "/dashboard/books/import" },
                { label: "Upload Images" }
              ]
            }
          ),
          /* @__PURE__ */ jsx(BulkCoverUpload, { books: creatorBooks })
        ] })
      }
    )
  );
});
const POST = createRoute(async (c) => {
  return c.redirect("/dashboard/books/import/images");
});
export {
  GET,
  POST
};
