import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { getUser } from "../../../../../utils.js";
import {
  getBooksInList,
  getPublicListByShelfAndSlug
} from "../../../../../domain/lists/services.js";
import { getPublicBooksInWishlist } from "../../../../../domain/shelf/services.js";
import InfoPage from "../../../../../pages/InfoPage.js";
import AppLayout from "../../../../../components/layouts/AppLayout.js";
import Page from "../../../../../components/layouts/Page.js";
import ListBookCard from "../../../../../features/app/components/ListBookCard.js";
import ListNavigation from "../../../../../features/app/components/ListNavigation.js";
import ShareButton from "../../../../../features/api/components/ShareButton.js";
import { canonicalUrl, pageTitle } from "../../../../../lib/seo.js";
import { routeParam } from "../../../../../lib/routeParam.js";
import { z } from "zod";
import { formatShelfOwnerName } from "../../../../../domain/shelf/utils.js";
import {
  FAVORITES_LIST_SLUG,
  listSlugSchema
} from "../../../../../domain/lists/utils.js";
import { slugSchema } from "../../../../../features/app/schema.js";
import CardAuthorCard from "../../../../../components/app/CardAuthorCard.js";
const listParamsSchema = z.object({
  slug: slugSchema.shape.slug,
  listSlug: listSlugSchema
});
const GET = createRoute(
  paramValidator(listParamsSchema),
  async (c) => {
    const shelfSlug = routeParam(c, "slug");
    const listSlug = routeParam(c, "listSlug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);
    const [ownerError, result] = await getPublicListByShelfAndSlug(
      shelfSlug,
      listSlug
    );
    if (ownerError || !result) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: ownerError?.reason ?? "List not found",
            user
          }
        ),
        404
      );
    }
    const { owner, list, isFavorites } = result;
    const displayName = formatShelfOwnerName({
      firstName: owner.firstName,
      lastName: owner.lastName
    });
    const [booksError, booksResult] = isFavorites ? await getPublicBooksInWishlist(owner.id, currentPage) : await getBooksInList(list.id, currentPage);
    if (booksError || !booksResult) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: booksError?.reason ?? "Failed to load list",
            user
          }
        )
      );
    }
    if (!user) {
      c.header("Vary", "Cookie");
      c.header(
        "Cache-Control",
        "private, max-age=120, stale-while-revalidate=600"
      );
    } else {
      c.header("Cache-Control", "private, no-store");
    }
    const title = pageTitle(`${list.title} \xB7 ${displayName}`);
    const description = list.description?.trim() || (isFavorites ? `${displayName}'s favorite photobooks on Photobookers.` : `${list.title} \u2014 a book list by ${displayName} on Photobookers.`);
    const listPath = `/shelf/${shelfSlug}/lists/${isFavorites ? FAVORITES_LIST_SLUG : list.slug}`;
    const listCanonicalUrl = canonicalUrl(c.req.url, listPath);
    const shareImage = owner.profileImageUrl ?? booksResult.books[0]?.coverUrl ?? void 0;
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description,
          canonicalUrl: listCanonicalUrl,
          user,
          currentPath,
          shareOg: {
            title: `${list.title} \xB7 ${displayName}`,
            description,
            url: listCanonicalUrl,
            image: shareImage
          },
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex w-full max-w-xl flex-col items-center gap-12", children: [
            /* @__PURE__ */ jsxs("div", { class: "flex w-full flex-col items-center gap-3 border-b-2 border-on-surface-strong pb-6 text-center", children: [
              /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-5xl", children: list.title }),
              /* @__PURE__ */ jsx(CardAuthorCard, { user: owner, avatarSize: "sm" }),
              list.description ? /* @__PURE__ */ jsx("p", { class: "max-w-prose text-on-surface text-pretty", children: list.description }) : null,
              /* @__PURE__ */ jsx("div", { class: "w-full max-w-xs pt-2", children: /* @__PURE__ */ jsx(
                ShareButton,
                {
                  title: `${list.title} \xB7 ${displayName}`,
                  text: `Check out ${list.title} by ${displayName} on Photobookers`,
                  url: listPath
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxs("div", { id: "list-books", class: "flex w-full flex-col gap-16", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  id: "list-book-cards",
                  "x-merge": "replace",
                  class: "flex flex-col gap-12",
                  children: booksResult.books.length > 0 ? booksResult.books.map((book, index) => /* @__PURE__ */ jsxs(Fragment, { children: [
                    index > 0 ? /* @__PURE__ */ jsxs(
                      "div",
                      {
                        class: "flex items-center justify-center gap-2 text-on-surface-weak",
                        "aria-hidden": "true",
                        children: [
                          /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                          /* @__PURE__ */ jsx("span", { children: "\u2022" }),
                          /* @__PURE__ */ jsx("span", { children: "\u2022" })
                        ]
                      }
                    ) : null,
                    /* @__PURE__ */ jsx(ListBookCard, { book, user })
                  ] })) : /* @__PURE__ */ jsx("p", { class: "py-8 text-center text-sm text-on-surface", children: isFavorites ? "No public favorites yet." : "No books in this list yet." })
                }
              ),
              /* @__PURE__ */ jsx(
                ListNavigation,
                {
                  currentPath,
                  page: booksResult.page,
                  totalPages: booksResult.totalPages,
                  targetId: "list-book-cards"
                }
              )
            ] })
          ] }) })
        }
      )
    );
  }
);
export {
  GET
};
