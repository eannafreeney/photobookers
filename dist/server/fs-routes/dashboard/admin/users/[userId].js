import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../lib/validator.js";
import { userIdSchema } from "../../../../schemas/index.js";
import { getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import PageTitle from "../../../../components/app/PageTitle.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import Card from "../../../../components/app/Card.js";
import Link from "../../../../components/app/Link.js";
import {
  deleteUserByIdAdmin,
  getUserByIdAdmin
} from "../../../../features/dashboard/admin/users/services.js";
import InfoPage from "../../../../pages/InfoPage.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import ResetUserPasswordButton from "../../../../features/dashboard/admin/users/components/ResetUserPasswordButton.js";
const GET = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;
  const sessionUser = await getUser(c);
  const [error, viewedUser] = await getUserByIdAdmin(userId, {
    withActivity: true
  });
  if (error)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error?.reason, user: sessionUser }));
  const likedBooks = viewedUser?.likedBooks ?? [];
  const wishlistedBooks = viewedUser?.wishlistedBooks ?? [];
  const collectedBooks = viewedUser?.collectedBooks ?? [];
  const followedCreators = viewedUser?.followedCreators ?? [];
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Admin Dashboard", user: sessionUser, children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(PageTitle, { title: viewedUser?.email, user: sessionUser }),
      /* @__PURE__ */ jsx("div", { class: "mb-6 flex flex-wrap items-center gap-3", children: /* @__PURE__ */ jsx(ResetUserPasswordButton, { userId }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Email:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "First Name:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.firstName })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Last Name:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.lastName })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Created At:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.createdAt })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Updated At:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.updatedAt })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Must Reset Password:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.mustResetPassword ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { children: "Accepts Terms:" }),
          /* @__PURE__ */ jsx("span", { children: viewedUser?.acceptsTerms ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Creator profiles" }),
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
        ] }) }) }) })) })
      ] }),
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Books liked" }),
      likedBooks?.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "No liked books." }) : /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: viewedUser?.likedBooks.map((b) => /* @__PURE__ */ jsxs(Card, { children: [
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
      /* @__PURE__ */ jsx(SectionTitle, { className: "mb-4", children: "Books wishlisted" }),
      wishlistedBooks.length === 0 ? /* @__PURE__ */ jsx("p", { class: "text-sm text-on-surface/65", children: "No wishlisted books." }) : /* @__PURE__ */ jsx("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8", children: wishlistedBooks.map((b) => /* @__PURE__ */ jsxs(Card, { children: [
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
      ] })) })
    ] }) })
  );
});
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
  GET
};
