import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils.js";
import { getIsMobile } from "../../../../lib/device.js";
import { paramValidator } from "../../../../lib/validator.js";
import { slugSchema } from "../../../../features/app/schema.js";
import { requireBookPreviewAccess } from "../../../../middleware/bookGuard.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import { getBookBySlug } from "../../../../features/app/services.js";
import BookDetail from "../../../../features/app/components/BookDetail.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { bookDescription, bookPageTitle } from "../../../../lib/seo.js";
const GET = createRoute(
  paramValidator(slugSchema),
  requireBookPreviewAccess,
  async (c) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const currentPath = c.req.path;
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    const currentPage = Number(c.req.query("page") ?? 1);
    const [error, result] = await getBookBySlug(bookSlug, "draft");
    if (error) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    }
    const { book } = result;
    const galleryImages = [
      book.coverUrl,
      ...book?.images?.map((image) => image.imageUrl) ?? []
    ].filter((url) => url !== null);
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: bookPageTitle(book.title, book.artist?.displayName),
          description: bookDescription(book),
          user,
          isPreview: true,
          currentPath,
          adminEditHref: `/dashboard/admin/books/${book.id}`,
          noIndex: true,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
            BookDetail,
            {
              currentPage,
              galleryImages,
              book,
              currentPath,
              user,
              isMobile
            }
          ) })
        }
      )
    );
  }
);
export {
  GET
};
