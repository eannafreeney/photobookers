import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../lib/validator.js";
import { getIsMobile } from "../../../lib/device.js";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import InfoPage from "../../../pages/InfoPage.js";
import BookOfTheDayDetail from "../../../features/app/components/BookOfTheDayDetail.js";
import { getBookOfTheDayForDate } from "../../../features/app/BOTDServices.js";
import { getBookBySlug } from "../../../features/app/services.js";
import { botdPath } from "../../../features/app/spotlightUrls.js";
import {
  bookDescription,
  bookPageTitle,
  canonicalUrl,
  pageTitle,
  truncateDescription
} from "../../../lib/seo.js";
import { parseDateString } from "../../../lib/utils.js";
import Button from "../../../components/app/Button.js";
const dateParamSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).transform(parseDateString).refine((d) => !Number.isNaN(d.getTime()), "Invalid date")
});
const GET = createRoute(paramValidator(dateParamSchema), async (c) => {
  const user = await getUser(c);
  const date = c.req.valid("param").date;
  const currentPath = c.req.path;
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const [botdError, bookOfTheDay] = await getBookOfTheDayForDate(date);
  if (botdError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book of the day not found", user }),
      404
    );
  }
  const [bookError, bookResult] = await getBookBySlug(
    bookOfTheDay.book.slug,
    "published"
  );
  if (bookError || !bookResult) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }), 404);
  }
  const { book } = bookResult;
  const editorial = bookOfTheDay.instagramCaption?.trim() || null;
  const path = botdPath(date);
  const title = pageTitle(`Book of the Day \u2014 ${book.title}`);
  const description = truncateDescription(editorial ?? bookDescription(book));
  const galleryImages = [
    book.coverUrl,
    ...book.images?.map((image) => image.imageUrl) ?? []
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
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, path),
        user,
        currentPath,
        adminEditHref: `/dashboard/admin/books/${book.id}`,
        shareOg: {
          title: bookPageTitle(book.title, book.artist?.displayName),
          description,
          image: book.coverUrl ?? void 0,
          url: canonicalUrl(c.req.url, path)
        },
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            BookOfTheDayDetail,
            {
              book,
              galleryImages,
              isMobile,
              user,
              date
            }
          ),
          /* @__PURE__ */ jsx("a", { href: "/book-of-the-day", class: "mx-auto", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "auto", children: "\u2190 All Books of the Day" }) })
        ] })
      }
    )
  );
});
export {
  GET
};
