import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { userIdSchema } from "../../../../schemas/index.js";
import { getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import PageTitle from "../../../../components/app/PageTitle.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Card from "../../../../components/app/Card.js";
import Link from "../../../../components/app/Link.js";
import Alert from "../../../../components/app/Alert.js";
import {
  deleteUserByIdAdmin,
  getUserByIdAdmin,
  updateUserAdmin
} from "../../../../features/dashboard/admin/users/services.js";
import { editUserFormAdminSchema } from "../../../../features/dashboard/admin/users/schema.js";
import EditUserFormAdmin from "../../../../features/dashboard/admin/users/forms/EditUserFormAdmin.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import ResetUserPasswordButton from "../../../../features/dashboard/admin/users/components/ResetUserPasswordButton.js";
import PostsTable from "../../../../features/collectors/components/PostsTable.js";
import { formatDate } from "../../../../utils.js";
import { getIsMobile } from "../../../../lib/device.js";
const GET = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;
  const sessionUser = await getUser(c);
  const currentPath = c.req.path;
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const [error, viewedUser] = await getUserByIdAdmin(userId, {
    withActivity: true
  });
  if (error || !viewedUser)
    return c.html(
      /* @__PURE__ */ jsx(
        InfoPage,
        {
          errorMessage: error?.reason ?? "User not found",
          user: sessionUser
        }
      )
    );
  const wishlistedBooks = viewedUser?.wishlistedBooks ?? [];
  const collectedBooks = viewedUser?.collectedBooks ?? [];
  const followedCreators = viewedUser?.followedCreators ?? [];
  const formValues = {
    email: viewedUser.email,
    firstName: viewedUser.firstName ?? "",
    lastName: viewedUser.lastName ?? ""
  };
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title: "Edit User",
        user: sessionUser,
        currentPath,
        children: /* @__PURE__ */ jsxs(Page, { children: [
          /* @__PURE__ */ jsx(PageTitle, { title: viewedUser?.email, user: sessionUser }),
          /* @__PURE__ */ jsx("div", { class: "mb-6 flex flex-wrap items-center gap-3", children: /* @__PURE__ */ jsx(ResetUserPasswordButton, { userId }) }),
          /* @__PURE__ */ jsx(EditUserFormAdmin, { formValues, userId }),
          /* @__PURE__ */ jsxs("div", { class: "mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Created:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: formatDate(viewedUser.createdAt) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Updated:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: viewedUser.updatedAt ? formatDate(viewedUser.updatedAt) : "\u2014" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Must reset password:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: viewedUser.mustResetPassword ? "Yes" : "No" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { class: "font-semibold", children: "Accepts terms:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: viewedUser.acceptsTerms ? "Yes" : "No" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4 mt-8", children: "Creator profiles" }),
          viewedUser?.creators.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "No creator profiles linked." }) : /* @__PURE__ */ jsx("ul", { class: "flex flex-col gap-3", children: viewedUser?.creators.map((c2) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { class: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { class: "font-semibold text-on-surface truncate", children: c2.displayName }),
              /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface/65 font-mono truncate", children: c2.slug })
            ] }),
            /* @__PURE__ */ jsx(
              Link,
              {
                href: `/dashboard/admin/creators/${c2.id}`,
                className: "shrink-0 text-sm",
                hoverUnderline: true,
                children: "Edit creator"
              }
            )
          ] }) }) }) })) }),
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Books favourited" }),
          wishlistedBooks.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "No favourited books." }) : /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: wishlistedBooks.map((b) => /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(
              Card.Image,
              {
                src: b.coverUrl ?? "",
                alt: b.title,
                href: `/books/${b.slug}`,
                objectCover: true
              }
            ),
            /* @__PURE__ */ jsxs(Card.Body, { children: [
              /* @__PURE__ */ jsx(Link, { href: `/books/${b.slug}`, children: /* @__PURE__ */ jsx(Card.Title, { children: b.title }) }),
              b.artist?.displayName && /* @__PURE__ */ jsx(Card.Text, { children: b.artist.displayName })
            ] })
          ] })) }),
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Books collected" }),
          collectedBooks.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "No collected books." }) : /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: collectedBooks.map((b) => /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(
              Card.Image,
              {
                src: b.coverUrl ?? "",
                alt: b.title,
                href: `/books/${b.slug}`,
                objectCover: true
              }
            ),
            /* @__PURE__ */ jsxs(Card.Body, { children: [
              /* @__PURE__ */ jsx(Link, { href: `/books/${b.slug}`, children: /* @__PURE__ */ jsx(Card.Title, { children: b.title }) }),
              b.artist?.displayName && /* @__PURE__ */ jsx(Card.Text, { children: b.artist.displayName })
            ] })
          ] })) }),
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Creators followed" }),
          followedCreators.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "Not following any creators." }) : /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: followedCreators.map((c2) => /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(
              Card.Image,
              {
                src: c2.coverUrl ?? "",
                alt: c2.displayName,
                href: `/dashboard/admin/creators/${c2.id}/update`,
                aspectSquare: true,
                objectCover: true
              }
            ),
            /* @__PURE__ */ jsxs(Card.Body, { children: [
              /* @__PURE__ */ jsx(Link, { href: `/dashboard/admin/creators/${c2.id}/update`, children: /* @__PURE__ */ jsx(Card.Title, { children: c2.displayName }) }),
              /* @__PURE__ */ jsx(Card.Text, { children: c2.slug })
            ] })
          ] })) }),
          /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4 mt-8", children: "Posts" }),
          /* @__PURE__ */ jsx(PostsTable, { userId, isMobile })
        ] })
      }
    )
  );
});
const POST = createRoute(
  paramValidator(userIdSchema),
  formValidator(editUserFormAdminSchema),
  async (c) => {
    const userId = c.req.valid("param").userId;
    const formData = c.req.valid("form");
    const [updateError] = await updateUserAdmin(userId, formData);
    if (updateError) return showErrorAlert(c, updateError.reason);
    return c.html(/* @__PURE__ */ jsx(Alert, { type: "success", message: "User updated!" }));
  }
);
const DELETE = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;
  const [err] = await deleteUserByIdAdmin(userId);
  if (err) return showErrorAlert(c, err.reason);
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: "success", message: "User deleted!" }),
      dispatchEvents(["users:updated"])
    ] })
  );
});
export {
  DELETE,
  GET,
  POST
};
