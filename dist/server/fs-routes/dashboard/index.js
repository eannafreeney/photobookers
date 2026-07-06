import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  getBooksByArtistId,
  getBooksByPublisherId
} from "../../features/dashboard/books/services.js";
import { getUser } from "../../utils.js";
import { getFlash } from "../../utils.js";
import { getIsMobile } from "../../lib/device.js";
import InfoPage from "../../pages/InfoPage.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import { BooksOverviewTable } from "../../features/dashboard/books/tables/BooksOverviewTable.js";
import CreatorDashboardShell from "../../features/dashboard/components/CreatorDashboardShell.js";
import { getPendingClaim } from "../../features/claims/services.js";
import CreatorBookFunnelSummary from "../../features/dashboard/books/components/CreatorBookFunnelSummary.js";
const GET = createRoute(async (c) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const currentPath = c.req.path;
  if (!user.creator)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Creator not found" }));
  const creatorId = user.creator.id;
  const creatorType = user.creator.type;
  const isSearching = Boolean(searchQuery?.trim());
  const pageLimit = isSearching ? 30 : 1e4;
  const booksByCreator = creatorType === "artist" ? getBooksByArtistId(creatorId, currentPage, searchQuery, pageLimit) : getBooksByPublisherId(creatorId, currentPage, searchQuery, pageLimit);
  const [[claimError, claim], [error, result]] = await Promise.all([
    getPendingClaim(user.id, creatorId),
    booksByCreator
  ]);
  if (claimError)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: claimError.reason, user }));
  if (error)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
  const { books, totalPages, page } = result;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Books Overview",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(
          CreatorDashboardShell,
          {
            currentPath,
            user,
            claimStatus: claim?.status ?? null,
            children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-16", children: [
              /* @__PURE__ */ jsx(
                CreatorBookFunnelSummary,
                {
                  creatorId,
                  creatorType
                }
              ),
              /* @__PURE__ */ jsx(
                BooksOverviewTable,
                {
                  books,
                  isMobile,
                  creator: user.creator,
                  user,
                  currentPath,
                  page,
                  totalPages,
                  reorderEnabled: !isSearching
                }
              )
            ] })
          }
        )
      }
    )
  );
});
export {
  GET
};
