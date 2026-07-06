import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import InfoPage from "../../../pages/InfoPage.js";
import CreatorOfTheWeekDetail from "../../../features/app/components/CreatorOfTheWeekDetail.js";
import { potwPath } from "../../../features/app/spotlightUrls.js";
import { weekParamSchema } from "../../../features/app/schema.js";
import { getPublisherOfTheWeekForDateQuery } from "../../../features/app/POTWServices.js";
import {
  getBooksByCreatorSlug,
  getInterviewByCreatorSlug
} from "../../../features/app/services.js";
import {
  canonicalUrl,
  creatorDescription,
  pageTitle,
  truncateDescription
} from "../../../lib/seo.js";
import Button from "../../../components/app/Button.js";
const SPOTLIGHT_BOOKS_LIMIT = 500;
const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const user = await getUser(c);
  const weekStart = c.req.valid("param").week;
  const currentPath = c.req.path;
  const [potwError, publisherOfTheWeek] = await getPublisherOfTheWeekForDateQuery(weekStart);
  if (potwError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Publisher of the week not found", user }),
      404
    );
  }
  const { creator } = publisherOfTheWeek;
  const [booksError, booksResult] = await getBooksByCreatorSlug(
    creator.slug,
    1,
    "newest",
    SPOTLIGHT_BOOKS_LIMIT
  );
  if (booksError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: booksError.reason, user }),
      404
    );
  }
  const [interviewError, interview] = await getInterviewByCreatorSlug(
    creator.slug
  );
  const publishedInterview = !interviewError && interview && interview.status === "published" ? interview : null;
  const path = potwPath(weekStart);
  const title = pageTitle(`Publisher of the Week \u2014 ${creator.displayName}`);
  const interviewTeaser = publishedInterview?.answers?.q1?.trim();
  const description = truncateDescription(
    interviewTeaser ?? creatorDescription(creator)
  );
  const shareImage = publisherOfTheWeek.instagramImageUrl ?? publishedInterview?.promoImageUrl ?? creator.bannerUrl ?? creator.coverUrl ?? booksResult.books[0]?.coverUrl ?? void 0;
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
        adminEditHref: `/dashboard/admin/creators/${creator.id}`,
        shareOg: {
          title,
          description,
          image: shareImage,
          url: canonicalUrl(c.req.url, path)
        },
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            CreatorOfTheWeekDetail,
            {
              creator: booksResult.creator,
              user,
              weekStart,
              publishedInterview,
              books: booksResult.books
            }
          ),
          /* @__PURE__ */ jsx("a", { href: `/publisher-of-the-week`, class: "mx-auto", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "auto", children: "\u2190 All Publishers of the Week" }) })
        ] })
      }
    )
  );
});
export {
  GET
};
