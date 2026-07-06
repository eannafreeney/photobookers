import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { slugSchema } from "../../../features/app/schema.js";
import { getIsMobile } from "../../../lib/device.js";
import { getUser } from "../../../utils.js";
import { getBookBySlug } from "../../../features/app/services.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import InfoPage from "../../../pages/InfoPage.js";
import BookDetail from "../../../features/app/components/BookDetail.js";
import {
  bookDescription,
  bookPageTitle,
  buildBookJsonLd,
  canonicalUrl
} from "../../../lib/seo.js";
import { maybeRecordBookView } from "../../../features/book-views/record.js";
function isTrackablePublicBook(book) {
  return book.publicationStatus === "published" && book.approvalStatus === "approved";
}
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const bookSlug = c.req.valid("param").slug;
    const user = await getUser(c);
    const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const [error, result] = await getBookBySlug(bookSlug, "published");
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    const { book } = result;
    const bookCanonicalUrl = canonicalUrl(c.req.url, `/books/${book.slug}`);
    const description = bookDescription(book);
    const title = bookPageTitle(book.title, book.artist?.displayName);
    const galleryImages = [
      book.coverUrl,
      ...book?.images?.map((image) => image.imageUrl) ?? []
    ].filter((url) => url !== null);
    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600"
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }
    if (isTrackablePublicBook(book)) {
      await maybeRecordBookView(c, book, "web");
    }
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: bookCanonicalUrl,
          user,
          currentPath,
          adminEditHref: `/dashboard/admin/books/${book.id}`,
          shareOg: {
            title,
            description,
            image: book.coverUrl ?? void 0,
            url: bookCanonicalUrl
          },
          jsonLd: buildBookJsonLd(book, bookCanonicalUrl),
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
            BookDetail,
            {
              galleryImages,
              book,
              currentPath,
              user,
              isMobile,
              currentPage
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
