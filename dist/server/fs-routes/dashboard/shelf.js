import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout.js";
import PageHeader from "../../components/app/PageHeader.js";
import InfoPage from "../../pages/InfoPage.js";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell.js";
import ShelfSharingPanel from "../../features/app/components/ShelfSharingPanel.js";
import { suggestShelfSlug } from "../../domain/shelf/services.js";
import { userCanHaveShelf } from "../../domain/shelf/utils.js";
import { getPendingClaim } from "../../features/claims/services.js";
import { getFlash, getUser } from "../../utils.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!userCanHaveShelf(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const suggestedSlug = await suggestShelfSlug(user.id);
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
  const alpineAttrs = {
    "x-init": true,
    "x-merge": "replace",
    "@avatar:updated.window": "$ajax('/dashboard/shelf', { target: 'shelf-settings-container' })"
  };
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Shelf",
        user,
        flash,
        currentPath,
        children: /* @__PURE__ */ jsxs(
          MemberDashboardShell,
          {
            user,
            currentPath,
            claimStatus,
            children: [
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: "Shelf",
                  intro: "Control whether your shelf is public and choose your public URL."
                }
              ),
              /* @__PURE__ */ jsx("div", { id: "shelf-settings-container", ...alpineAttrs, children: /* @__PURE__ */ jsx(
                ShelfSharingPanel,
                {
                  user,
                  suggestedSlug,
                  defaultOpen: true
                }
              ) })
            ]
          }
        )
      }
    )
  );
});
export {
  GET
};
