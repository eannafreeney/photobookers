import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formatDate, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import { formatCountry } from "../../lib/utils.js";
import SpotlightCard from "../../components/app/SpotlightCard.js";
import { getRecentPublishersOfTheWeek } from "../../features/app/POTWServices.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import { getIsMobile } from "../../lib/device.js";
import GridPanel from "../../components/app/GridPanel.js";
import ListNavigation from "../../features/app/components/ListNavigation.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
import { potwPath } from "../../features/app/spotlightUrls.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const [error, result] = await getRecentPublishersOfTheWeek(currentPage);
  if (error) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: "Failed to get publishers of the week",
          user
        }
      )
    );
  }
  const { potwEntries, totalPages, page } = result;
  const targetId = "potw-list";
  const title = pageTitle("Publisher of the Week");
  const description = "Meet photobookers Publishers of the Week \u2014 featured publishers from the photobook community.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/publisher-of-the-week"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The Archive",
              title: "Publishers of the Week",
              intro: "Every week, one publisher in focus. Browse past spotlights."
            }
          ),
          /* @__PURE__ */ jsx(GridPanel, { id: targetId, isFullWidth: true, xMerge: "append", children: potwEntries.map((entry) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            SpotlightCard,
            {
              href: potwPath(entry.weekStart),
              imageUrl: entry.creator.coverUrl ?? "",
              imageAlt: entry.creator.displayName,
              dateLabel: `Week of ${formatDate(entry.weekStart)}`,
              title: entry.creator.displayName,
              subtitle: [
                entry.creator.city,
                formatCountry(entry.creator.country ?? "")
              ].filter(Boolean).join(", ") || void 0,
              aspectSquare: true
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
