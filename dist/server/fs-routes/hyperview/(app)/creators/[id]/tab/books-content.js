import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { getBooksByCreatorSlug } from "../../../../../../features/app/services.js";
import { paramValidator } from "../../../../../../lib/validator.js";
import { slugSchema } from "../../../../../../features/app/schema.js";
import { getUser } from "../../../../../../utils.js";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags.js";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, result] = await getBooksByCreatorSlug(slug, currentPage);
  if (error || !result?.creator) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "No books found." }) }),
      404
    );
  }
  const { creator, books, totalPages = 1 } = result;
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const hasMore = currentPage < totalPages;
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creator.id}/tab/books-content`;
  const pageProps = {
    books,
    creator,
    baseUrl,
    favoritesByBookId,
    page: currentPage,
    hasMore,
    loadMoreHref
  };
  if (currentPage > 1) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(CreatorPage, { ...pageProps }) })
    );
  }
  return hv(/* @__PURE__ */ jsx(CreatorPage, { ...pageProps }));
});
export {
  GET
};
