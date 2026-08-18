import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { getFlash, getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import {
  createBookList,
  listBookListsWithCounts
} from "../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../domain/lists/utils.js";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell.js";
import ListsTable from "../../../features/dashboard/lists/ListsTable.js";
import ListForm from "../../../features/dashboard/lists/ListForm.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
function canAccessLists(user) {
  return userCanManageBookLists(user) && isFeatureEnabledForUser("collectors", user);
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!canAccessLists(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const lists = await listBookListsWithCounts(user.id);
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Your lists",
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsxs(
          ListsDashboardShell,
          {
            user,
            currentPath,
            claimStatus,
            children: [
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: "Your lists",
                  intro: "Create playlist-style lists of books. Publish them on your public shelf."
                }
              ),
              /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "New list" }),
                  /* @__PURE__ */ jsx(ListForm, {})
                ] }),
                /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(
                  ListsTable,
                  {
                    lists,
                    shelfSlug: user.shelfSlug,
                    shelfPublic: user.shelfPublic
                  }
                ) })
              ] })
            ]
          }
        )
      }
    )
  );
});
const POST = createRoute(async (c) => {
  const user = await getUser(c);
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't create lists right now.");
  }
  const body = await c.req.parseBody();
  const [err, list] = await createBookList(user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    isPublic: body.isPublic === "true"
  });
  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to create list");
  }
  return c.redirect(`/dashboard/lists/${list.id}`);
});
export {
  GET,
  POST
};
