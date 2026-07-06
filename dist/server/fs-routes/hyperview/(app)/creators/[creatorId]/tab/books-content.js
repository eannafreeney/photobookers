import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { paramValidator } from "../../../../../../lib/validator.js";
import { getUser } from "../../../../../../utils.js";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags.js";
import CreatorPage from "../../../../../../features/hyperview/components/CreatorPage.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import { getPublicBooksByCreatorId } from "../../../../../../domain/creators/books.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/books-content`;
  const [error, result] = await getPublicBooksByCreatorId(creatorId, currentPage, {
    defaultLimit: 3
  });
  if (error || !result?.books || !result?.creator) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "No books found." }) }),
      404
    );
  }
  const { creator, books, totalPages = 1 } = result;
  const user = await getUser(c);
  const favoritesByBookId = await favoriteFlagsForBooks(user, books);
  const hasMore = currentPage < totalPages;
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
