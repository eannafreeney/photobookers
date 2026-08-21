import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import { getFlash, getUser } from "../../../utils.js";
import {
  createBookList,
  listBookListsWithCounts
} from "../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../domain/lists/utils.js";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell.js";
import ListsTable from "../../../features/dashboard/lists/ListsTable.js";
import ListForm from "../../../features/dashboard/lists/ListForm.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import Alert from "../../../components/app/Alert.js";
import Banner from "../../../components/app/Banner.js";
import Link from "../../../components/app/Link.js";
import { getIsMobile } from "../../../lib/device.js";
import { formatShelfOwnerName } from "../../../domain/shelf/utils.js";
function canAccessLists(user) {
  return userCanManageBookLists(user);
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  if (!canAccessLists(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [listsErr, listRows] = await listBookListsWithCounts(user.id);
  if (listsErr || !listRows) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: listsErr?.reason ?? "Failed to load lists",
          user
        }
      )
    );
  }
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const canPublishOnShelf = Boolean(user.shelfPublic && user.shelfSlug);
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
              !canPublishOnShelf ? /* @__PURE__ */ jsx(
                Banner,
                {
                  type: "info",
                  message: "Lists are disabled while your shelf is private. Make your shelf public to share lists with people who follow you.",
                  children: /* @__PURE__ */ jsx(Link, { href: "/dashboard/shelf", className: "text-sm text-accent", children: "Manage shelf settings" })
                }
              ) : null,
              /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start", children: [
                /* @__PURE__ */ jsxs("div", { class: "bg-surface-alt p-4 rounded-md xl:sticky xl:top-24", children: [
                  /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "Create New list" }),
                  /* @__PURE__ */ jsx(ListForm, { disabled: !canPublishOnShelf })
                ] }),
                /* @__PURE__ */ jsx("div", { class: "xl:col-span-2", children: /* @__PURE__ */ jsx(
                  ListsTable,
                  {
                    lists: listRows,
                    ownerName: formatShelfOwnerName({
                      firstName: user.firstName,
                      lastName: user.lastName
                    }),
                    shelfSlug: user.shelfSlug,
                    shelfPublic: user.shelfPublic,
                    isMobile
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
  if (!user.shelfPublic || !user.shelfSlug) {
    return showErrorAlert(
      c,
      "Make your shelf public before creating lists. Open Dashboard \u2192 Shelf."
    );
  }
  const body = await c.req.parseBody();
  const [err, list] = await createBookList(user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? "")
  });
  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to create list");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: `"${list.title}" created.` }),
      dispatchEvents(["lists:updated"])
    ] })
  );
});
export {
  GET,
  POST
};
