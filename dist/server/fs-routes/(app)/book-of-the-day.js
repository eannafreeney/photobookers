import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formatDate, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import { getRecentBooksOfTheDay } from "../../features/app/BOTDServices.js";
import PageHeader from "../../components/app/PageHeader.js";
import SpotlightCard from "../../components/app/SpotlightCard.js";
import InfoPage from "../../pages/InfoPage.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import { getIsMobile } from "../../lib/device.js";
import GridPanel from "../../components/app/GridPanel.js";
import ListNavigation from "../../features/app/components/ListNavigation.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
import { botdPath } from "../../features/app/spotlightUrls.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const [error, result] = await getRecentBooksOfTheDay(currentPage);
  if (error)
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to get books of the day", user })
    );
  const { botdEntries, totalPages, page } = result;
  const targetId = "botd-list";
  const title = pageTitle("Book of the Day");
  const description = "Explore photobookers Books of the Day \u2014 curated photobook highlights from our community.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/book-of-the-day"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The Archive",
              title: "Books of the Day",
              intro: "One photobook, every day. Browse past selections."
            }
          ),
          /* @__PURE__ */ jsx(GridPanel, { id: targetId, isFullWidth: true, xMerge: "append", children: botdEntries.map((entry) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            SpotlightCard,
            {
              href: botdPath(entry.date),
              imageUrl: entry.book.coverUrl ?? "",
              imageAlt: entry.book.title,
              dateLabel: formatDate(entry.date),
              title: entry.book.title,
              subtitle: entry.book.artist?.displayName
            }
          ) })) }),
          /* @__PURE__ */ jsx(
            ListNavigation,
            {
              isInfiniteScroll: true,
              currentPath,
              page,
              totalPages,
              targetId
            }
          )
        ] })
      }
    )
  );
});
export {
  GET
};
