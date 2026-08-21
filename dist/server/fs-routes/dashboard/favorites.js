import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell.js";
import BooksGrid from "../../features/app/components/BooksGrid.js";
import { getBooksInWishlist } from "../../features/app/services.js";
import { getPendingClaim } from "../../features/claims/services.js";
import { getFlash, getUser } from "../../utils.js";
import { userCanHaveShelf } from "../../domain/shelf/utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  if (!userCanHaveShelf(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [wishlistError, wishlistResult] = await getBooksInWishlist(
    user.id,
    currentPage
  );
  if (wishlistError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: wishlistError.reason, user })
    );
  }
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@shelf:updated.window": "$ajax('/dashboard/favorites', { target: 'dashboard-favorites' })"
  };
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Favorites",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsx(
          MemberDashboardShell,
          {
            user,
            currentPath,
            claimStatus,
            children: /* @__PURE__ */ jsxs(
              "div",
              {
                id: "dashboard-favorites",
                class: "flex flex-col gap-4",
                ...alpineAttrs,
                children: [
                  /* @__PURE__ */ jsx(
                    PageHeader,
                    {
                      title: "Favorites",
                      intro: "Books you\u2019ve favorited. Make your shelf public to share them."
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    BooksGrid,
                    {
                      user,
                      currentPath,
                      result: wishlistResult ?? {
                        books: [],
                        page: 1,
                        totalPages: 1
                      },
                      noResultsMessage: "Add books to your favorites to see them here."
                    }
                  )
                ]
              }
            )
          }
        )
      }
    )
  );
});
export {
  GET
};
