import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard.js";
import { bookIdSchema } from "../../../../../../schemas/index.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../utils.js";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags.js";
import { getArtistByBookId } from "../../../../../../features/dashboard/books/services.js";
import {
  BOOK_ARTIST_FEED_ID,
  artistBooksLazyStyles
} from "./artist-books/[artistId].js";
import LazyLoader from "../../../../../../features/hyperview/components/LazyLoader.js";
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, book] = await getArtistByBookId(bookId);
  if (error || !book?.artist) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Artist not found." }) }),
      404
    );
  }
  const { artistId, artist } = book;
  const followingByCreatorId = await followFlagsForCreators(user, [artist]);
  const booksHref = `${baseUrl}/hyperview/books/${bookId}/tab/artist-books/${artistId}`;
  return hv(
    /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
      /* @__PURE__ */ jsx(
        CreatorCard,
        {
          creator: artist,
          baseUrl,
          showHeader: false,
          isFollowing: followingByCreatorId[artist.id] ?? false
        }
      ),
      /* @__PURE__ */ jsx(
        LazyLoader,
        {
          id: BOOK_ARTIST_FEED_ID,
          href: booksHref,
          style: "artist-books-lazy"
        }
      )
    ] })
  );
});
const artistTabStyles = () => artistBooksLazyStyles();
export {
  GET,
  artistTabStyles
};
