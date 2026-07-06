import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formatDate, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import { formatCountry } from "../../lib/utils.js";
import SpotlightCard from "../../components/app/SpotlightCard.js";
import { getRecentArtistsOfTheWeek } from "../../features/app/AOTWServices.js";
import ScrollReveal from "../../components/app/ScrollReveal.js";
import GridPanel from "../../components/app/GridPanel.js";
import { getIsMobile } from "../../lib/device.js";
import ListNavigation from "../../features/app/components/ListNavigation.js";
import { canonicalUrl, pageTitle } from "../../lib/seo.js";
import { aotwPath } from "../../features/app/spotlightUrls.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const [error, result] = await getRecentArtistsOfTheWeek(currentPage);
  if (error) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "Failed to get artists of the week", user })
    );
  }
  const { aotwEntries, totalPages, page } = result;
  const targetId = "aotw-list";
  const title = pageTitle("Artist of the Week");
  const description = "Meet photobookers Artists of the Week \u2014 featured artists from the photobook community.";
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: canonicalUrl(c.req.url, "/artist-of-the-week"),
        user,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(
            PageHeader,
            {
              kicker: "The Archive",
              title: "Artists of the Week",
              intro: "Every week, one artist in focus. Browse past spotlights."
            }
          ),
          /* @__PURE__ */ jsx(GridPanel, { id: targetId, isFullWidth: true, xMerge: "append", children: aotwEntries.map((entry) => /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx(
            SpotlightCard,
            {
              href: aotwPath(entry.weekStart),
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
