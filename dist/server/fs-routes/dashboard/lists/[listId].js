import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getFlash, getUser } from "../../../utils.js";
import { isFeatureEnabledForUser } from "../../../lib/features.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import {
  deleteBookList,
  getBookListForOwner,
  getBooksInList,
  updateBookList
} from "../../../domain/lists/services.js";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell.js";
import ListForm from "../../../features/dashboard/lists/ListForm.js";
import ListBooksEditor from "../../../features/dashboard/lists/ListBooksEditor.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import Alert from "../../../components/app/Alert.js";
import { routeParam } from "../../../lib/routeParam.js";
import Link from "../../../components/app/Link.js";
function canAccessLists(user) {
  if (user.creator) return true;
  return isFeatureEnabledForUser("collectors", user);
}
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;
  const listId = routeParam(c, "listId");
  if (!canAccessLists(user)) {
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
  }
  const [err, list] = await getBookListForOwner(listId, user.id);
  if (err || !list) {
    return c.html(
      /* @__PURE__ */ jsx(InfoPage, { errorMessage: err?.reason ?? "List not found", user }),
      404
    );
  }
  const [booksErr, booksResult] = await getBooksInList(listId, 1, "newest", 100);
  if (booksErr || !booksResult) {
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: booksErr?.reason ?? "Failed to load books",
          user
        }
      )
    );
  }
  const claim = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1] : null;
  const publicUrl = user.shelfPublic && user.shelfSlug && list.isPublic ? `/shelf/${user.shelfSlug}/lists/${list.slug}` : null;
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: list.title,
        user,
        flash,
        currentPath,
        noIndex: true,
        children: /* @__PURE__ */ jsxs(
          ListsDashboardShell,
          {
            user,
            currentPath,
            claimStatus: claim?.status ?? null,
            children: [
              /* @__PURE__ */ jsx("div", { class: "mb-2", children: /* @__PURE__ */ jsx(Link, { href: "/dashboard/lists", className: "text-sm text-accent", children: "\u2190 All lists" }) }),
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: list.title,
                  intro: "Edit details, publish, or remove books from this list."
                }
              ),
              publicUrl ? /* @__PURE__ */ jsxs("p", { class: "text-sm text-on-surface", children: [
                "Public page:",
                " ",
                /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: publicUrl,
                    class: "text-accent underline underline-offset-2",
                    target: "_blank",
                    rel: "noreferrer",
                    children: publicUrl
                  }
                )
              ] }) : null,
              /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 lg:grid-cols-2", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "Details" }),
                  /* @__PURE__ */ jsx(ListForm, { list }),
                  /* @__PURE__ */ jsxs(
                    "form",
                    {
                      method: "post",
                      action: `/dashboard/lists/${list.id}`,
                      class: "mt-6",
                      "x-data": "{ isSubmitting: false }",
                      ...{
                        "@submit": "if (!confirm('Delete this list?')) { $event.preventDefault(); return }; isSubmitting = true"
                      },
                      children: [
                        /* @__PURE__ */ jsx("input", { type: "hidden", name: "_method", value: "DELETE" }),
                        /* @__PURE__ */ jsx(
                          "button",
                          {
                            type: "submit",
                            class: "text-sm text-error hover:underline",
                            "x-bind:disabled": "isSubmitting",
                            children: "Delete list"
                          }
                        )
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "Books" }),
                  /* @__PURE__ */ jsx(ListBooksEditor, { listId: list.id, books: booksResult.books })
                ] })
              ] })
            ]
          }
        )
      }
    )
  );
});
const PATCH = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't edit lists right now.");
  }
  const body = await c.req.parseBody();
  const [err, list] = await updateBookList(listId, user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    slug: String(body.slug ?? ""),
    isPublic: body.isPublic === "true"
  });
  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to update list");
  }
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "List saved." }),
      /* @__PURE__ */ jsx(ListForm, { list })
    ] })
  );
});
const DELETE = createRoute(async (c) => {
  const user = await getUser(c);
  const listId = routeParam(c, "listId");
  if (!canAccessLists(user)) {
    return showErrorAlert(c, "You can't delete lists right now.");
  }
  const [err] = await deleteBookList(listId, user.id);
  if (err) return showErrorAlert(c, err.reason);
  return c.redirect("/dashboard/lists");
});
export {
  DELETE,
  GET,
  PATCH
};
