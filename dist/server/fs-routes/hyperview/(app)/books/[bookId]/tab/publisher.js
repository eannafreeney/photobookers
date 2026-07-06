import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../utils.js";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags.js";
import { getPublisherByBookId } from "../../../../../../features/dashboard/books/services.js";
import { bookIdSchema } from "../../../../../../schemas/index.js";
import { BOOK_PUBLISHER_FEED_ID } from "./publisher-books/[publisherId].js";
import LazyLoader from "../../../../../../features/hyperview/components/LazyLoader.js";
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, result] = await getPublisherByBookId(bookId);
  if (error || !result?.publisher) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Publisher not found." }) }),
      404
    );
  }
  const { publisher, publisherId } = result;
  const followingByCreatorId = await followFlagsForCreators(user, [publisher]);
  const booksHref = `${baseUrl}/hyperview/books/${bookId}/tab/publisher-books/${publisherId}`;
  return hv(
    /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
      /* @__PURE__ */ jsx(
        CreatorCard,
        {
          creator: publisher,
          baseUrl,
          showHeader: false,
          isFollowing: followingByCreatorId[publisher.id] ?? false
        }
      ),
      /* @__PURE__ */ jsx(
        LazyLoader,
        {
          id: BOOK_PUBLISHER_FEED_ID,
          href: booksHref,
          style: "publisher-books-lazy"
        }
      )
    ] })
  );
});
export {
  GET
};
