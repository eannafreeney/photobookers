import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout.js";
import PageHeader from "../../../components/app/PageHeader.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getFlash, getUser } from "../../../utils.js";
import {
  deleteBookList,
  getBookListForOwner,
  getBooksInList,
  updateBookList
} from "../../../domain/lists/services.js";
import { userCanManageBookLists } from "../../../domain/lists/utils.js";
import { parseCheckboxField } from "../../../schemas/index.js";
import ListsDashboardShell from "../../../features/dashboard/lists/ListsDashboardShell.js";
import ListForm from "../../../features/dashboard/lists/ListForm.js";
import ListBooks from "../../../features/dashboard/lists/ListBooks.js";
import ListBookSearch from "../../../features/dashboard/lists/ListBookSearch.js";
import ListShareLink from "../../../features/dashboard/lists/ListShareLink.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import Alert from "../../../components/app/Alert.js";
import { routeParam } from "../../../lib/routeParam.js";
import Link from "../../../components/app/Link.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import ListVisibilityToggle from "../../../features/dashboard/lists/ListVisibilityToggle.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import { formatShelfOwnerName } from "../../../domain/shelf/utils.js";
function canAccessLists(user) {
  return userCanManageBookLists(user);
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
  const [booksErr, booksResult] = await getBooksInList(
    listId,
    1,
    "newest",
    100
  );
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
  const publicUrl = user.shelfPublic && user.shelfSlug && list.isPublic ? `/shelf/${user.shelfSlug}/lists/${list.slug}` : null;
  const ownerName = formatShelfOwnerName({
    firstName: user.firstName,
    lastName: user.lastName
  });
  const claimStatus = user.creator ? (await getPendingClaim(user.id, user.creator.id))[1]?.status ?? null : null;
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
            claimStatus,
            children: [
              /* @__PURE__ */ jsx("div", { class: "mb-2", children: /* @__PURE__ */ jsx(Link, { href: "/dashboard/lists", className: "text-sm text-accent", children: "\u2190 All lists" }) }),
              /* @__PURE__ */ jsx(
                PageHeader,
                {
                  title: list.title,
                  intro: "Edit details, publish, or remove books from this list."
                }
              ),
              /* @__PURE__ */ jsx("div", { id: "list-share-panel", class: "mb-6", children: publicUrl ? /* @__PURE__ */ jsx(
                ListShareLink,
                {
                  listTitle: list.title,
                  ownerName,
                  publicUrl,
                  layout: "detail"
                }
              ) : null }),
              /* @__PURE__ */ jsxs("div", { class: "grid grid-cols-1 gap-8 xl:grid-cols-3 xl:items-start", children: [
                /* @__PURE__ */ jsxs("div", { class: "bg-surface-alt p-6 rounded-lg xl:sticky xl:top-24", children: [
                  /* @__PURE__ */ jsx("h2", { class: "mb-3 text-lg font-semibold text-on-surface-strong", children: "Edit List Details" }),
                  /* @__PURE__ */ jsx(
                    ListForm,
                    {
                      listId: list.id,
                      formValues: {
                        title: list.title,
                        description: list.description ?? "",
                        slug: list.slug,
                        isPublic: list.isPublic
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8 xl:col-span-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong mb-2", children: "Add books" }),
                    /* @__PURE__ */ jsx(ListBookSearch, { listId: list.id })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h2", { class: "text-lg font-semibold text-on-surface-strong mb-2", children: "In this list" }),
                    /* @__PURE__ */ jsx(ListBooks, { listId: list.id, books: booksResult.books })
                  ] })
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
  const intent = String(body.intent ?? "");
  if (intent === "make-public" || intent === "make-private") {
    const [err2, list2] = await updateBookList(listId, user.id, {
      isPublic: intent === "make-public"
    });
    if (err2 || !list2) {
      return showErrorAlert(c, err2?.reason ?? "Failed to update list");
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: "success",
            message: `"${list2.title}" is now ${list2.isPublic ? "public" : "private"}.`
          }
        ),
        /* @__PURE__ */ jsx(ListVisibilityToggle, { list: list2 }),
        dispatchEvents(["lists:updated"])
      ] })
    );
  }
  const [err, list] = await updateBookList(listId, user.id, {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    slug: String(body.slug ?? ""),
    isPublic: parseCheckboxField(body.isPublic)
  });
  if (err || !list) {
    return showErrorAlert(c, err?.reason ?? "Failed to update list");
  }
  const publicUrl = user.shelfPublic && user.shelfSlug && list.isPublic ? `/shelf/${user.shelfSlug}/lists/${list.slug}` : null;
  const ownerName = formatShelfOwnerName({
    firstName: user.firstName,
    lastName: user.lastName
  });
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "List saved." }),
      /* @__PURE__ */ jsx(
        ListForm,
        {
          listId: list.id,
          formValues: {
            title: list.title,
            description: list.description ?? "",
            slug: list.slug,
            isPublic: list.isPublic
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { id: "list-share-panel", class: "mb-6", children: publicUrl ? /* @__PURE__ */ jsx(
        ListShareLink,
        {
          listTitle: list.title,
          ownerName,
          publicUrl,
          layout: "detail"
        }
      ) : null })
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
  if (c.req.header("X-Alpine-Request") === "true") {
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: "List deleted." }),
        dispatchEvents(["lists:updated"])
      ] })
    );
  }
  return c.redirect("/dashboard/lists");
});
export {
  DELETE,
  GET,
  PATCH
};
