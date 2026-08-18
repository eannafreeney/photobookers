import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../lib/validator.js";
import { getUser } from "../../../../../utils.js";
import {
  getBooksInList,
  getPublicListByShelfAndSlug
} from "../../../../../domain/lists/services.js";
import InfoPage from "../../../../../pages/InfoPage.js";
import AppLayout from "../../../../../components/layouts/AppLayout.js";
import Page from "../../../../../components/layouts/Page.js";
import BooksGrid from "../../../../../features/app/components/BooksGrid.js";
import ShareButton from "../../../../../features/api/components/ShareButton.js";
import { canonicalUrl, pageTitle } from "../../../../../lib/seo.js";
import { isFeatureEnabledForUser } from "../../../../../lib/features.js";
import { routeParam } from "../../../../../lib/routeParam.js";
import { z } from "zod";
import { formatShelfOwnerName } from "../../../../../domain/shelf/utils.js";
import { listSlugSchema } from "../../../../../domain/lists/utils.js";
import { slugSchema } from "../../../../../features/app/schema.js";
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
    if (!isFeatureEnabledForUser("collectors", user)) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Not found", user }), 404);
    }
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
    const { owner, list } = result;
    const displayName = formatShelfOwnerName({
      firstName: owner.firstName,
      lastName: owner.lastName
    });
    const [booksError, booksResult] = await getBooksInList(
      list.id,
      currentPage
    );
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
    const description = list.description?.trim() || `${list.title} \u2014 a book list by ${displayName} on Photobookers.`;
    const listPath = `/shelf/${shelfSlug}/lists/${list.slug}`;
    const listCanonicalUrl = canonicalUrl(c.req.url, listPath);
    const shareImage = booksResult.books[0]?.coverUrl ?? void 0;
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
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-6", children: [
            /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 border-b-2 border-on-surface-strong pb-4", children: [
              /* @__PURE__ */ jsxs(
                "a",
                {
                  href: `/shelf/${shelfSlug}`,
                  class: "text-sm text-accent underline underline-offset-2",
                  children: [
                    "\u2190 ",
                    displayName,
                    "'s shelf"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("h1", { class: "text-balance font-display text-4xl font-medium leading-tight text-on-surface-strong md:text-5xl", children: list.title }),
                  list.description ? /* @__PURE__ */ jsx("p", { class: "mt-2 max-w-2xl text-on-surface text-pretty", children: list.description }) : null
                ] }),
                /* @__PURE__ */ jsx(
                  ShareButton,
                  {
                    title: `${list.title} \xB7 ${displayName}`,
                    text: `Check out ${list.title} by ${displayName} on Photobookers`,
                    url: listPath
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              BooksGrid,
              {
                user,
                currentPath,
                result: booksResult,
                noResultsMessage: "No books in this list yet."
              }
            )
          ] }) })
        }
      )
    );
  }
);
export {
  GET
};
