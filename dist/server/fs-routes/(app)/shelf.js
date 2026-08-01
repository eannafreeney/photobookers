import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import Page from "../../components/layouts/Page.js";
import BooksGrid from "../../features/app/components/BooksGrid.js";
import MemberSignInPrompt, {
  memberSignInPrompts
} from "../../features/app/components/MemberSignInPrompt.js";
import ShelfSharingPanel from "../../features/app/components/ShelfSharingPanel.js";
import PrivateShelfListsStrip from "../../features/app/components/PrivateShelfListsStrip.js";
import { getBooksInWishlist } from "../../features/app/services.js";
import { suggestShelfSlug } from "../../domain/shelf/services.js";
import { listBookListsWithCounts } from "../../domain/lists/services.js";
import InfoPage from "../../pages/InfoPage.js";
import PageHeader from "../../components/app/PageHeader.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const currentPage = Number(c.req.query("page") ?? 1);
  if (!user) {
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Shelf",
          user,
          flash,
          currentPath,
          noIndex: true,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Your Shelf",
                title: "Shelf",
                intro: "The books you\u2019ve favorited, all in one place."
              }
            ),
            /* @__PURE__ */ jsx(
              MemberSignInPrompt,
              {
                prompt: memberSignInPrompts.shelf,
                currentPath
              }
            )
          ] }) })
        }
      )
    );
  }
  const [wishlistError, wishlistResult] = await getBooksInWishlist(
    user.id,
    currentPage
  );
  if (wishlistError) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: wishlistError?.reason, user })
    );
  }
  if (!wishlistResult?.books) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: "No favourited books found", user })
    );
  }
  const suggestedSlug = await suggestShelfSlug(user.id);
  const lists = await listBookListsWithCounts(user.id);
  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@shelf:updated.window": "$ajax('/shelf', { target: 'shelf-container' })",
    "@avatar:updated.window": "$ajax('/shelf', { target: 'shelf-container' })"
  };
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Shelf",
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs(
          "div",
          {
            id: "shelf-container",
            class: "flex flex-col gap-4",
            ...alpineAttrs,
            children: [
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  kicker: "Your Shelf",
                  title: "Shelf",
                  intro: "The books you\u2019ve favorited, all in one place."
                }
              ),
              /* @__PURE__ */ jsx(ShelfSharingPanel, { user, suggestedSlug }),
              /* @__PURE__ */ jsx(
                PrivateShelfListsStrip,
                {
                  lists,
                  shelfSlug: user.shelfSlug,
                  shelfPublic: user.shelfPublic
                }
              ),
              /* @__PURE__ */ jsx(
                BooksGrid,
                {
                  user,
                  currentPath,
                  result: wishlistResult,
                  noResultsMessage: "Add books to your favorites to see them here."
                }
              )
            ]
          }
        ) })
      }
    )
  );
});
export {
  GET
};
