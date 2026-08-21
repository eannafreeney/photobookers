import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator.js";
import { slugSchema } from "../../../features/app/schema.js";
import { getUser } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import PageHeader from "../../../components/app/PageHeader.js";
import BookCard from "../../../components/app/BookCard.js";
import InfoPage from "../../../pages/InfoPage.js";
import { getContributorByShelfSlug } from "../../../domain/contributors/services.js";
import { canonicalUrl, pageTitle } from "../../../lib/seo.js";
import { routeParam } from "../../../lib/routeParam.js";
function displayName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Contributor";
}
const GET = createRoute(
  paramValidator(slugSchema),
  async (c) => {
    const slug = routeParam(c, "slug");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const [error, result] = await getContributorByShelfSlug(slug);
    if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
    const { contributor, books } = result;
    const name = displayName(contributor);
    const title = pageTitle(name);
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title,
          description: `Books submitted by ${name} on Photobookers`,
          canonicalUrl: canonicalUrl(c.req.url, `/contributors/${slug}`),
          currentPath,
          user,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Contributor",
                title: name,
                intro: `${books.length} book${books.length !== 1 ? "s" : ""} submitted to Photobookers`
              }
            ),
            books.length > 0 ? /* @__PURE__ */ jsx("div", { class: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8", children: books.map((book) => /* @__PURE__ */ jsx(BookCard, { book, user })) }) : /* @__PURE__ */ jsx("p", { class: "text-on-surface-weak mt-8", children: "No published books yet." })
          ] })
        }
      )
    );
  }
);
export {
  GET
};
