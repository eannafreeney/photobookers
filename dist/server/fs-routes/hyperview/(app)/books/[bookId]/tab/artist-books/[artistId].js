import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../../lib/hxml.js";
import { Style, Text } from "../../../../../../../lib/hxml-comps.js";
import { CREATOR_BOOKS_LOAD_MORE_ID } from "../../../../../../../features/hyperview/components/CreatorPage.js";
import FeedList, {
  feedListStyles
} from "../../../../../../../features/hyperview/components/FeedList.js";
import { bookArtistIdSchema } from "../../../../../../../schemas/index.js";
import { getBaseUrl } from "../../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../../utils.js";
import { favoriteFlagsForBooks } from "../../../../../../../features/hyperview/findFlags.js";
import { getBooksPerArtistId } from "../../../../../../../features/dashboard/books/services.js";
const BOOK_ARTIST_FEED_ID = "book-artist-feed";
const GET = createRoute(
  paramValidator(bookArtistIdSchema),
  async (c) => {
    const { bookId, artistId } = c.req.valid("param");
    const currentPage = parseInt(c.req.query("page") ?? "1", 10);
    const hv = hyperview(c);
    const baseUrl = getBaseUrl(c);
    const user = await getUser(c);
    const loadMoreHref = `${baseUrl}/hyperview/books/${bookId}/tab/artist-books/${artistId}`;
    const [error, result] = await getBooksPerArtistId(
      artistId,
      bookId,
      currentPage
    );
    if (error || !result?.artist) {
      return hv(
        /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Could not load books." }) }),
        404
      );
    }
    const { artist, books, totalPages = 1 } = result;
    const favoritesByBookId = await favoriteFlagsForBooks(user, books);
    const hasMore = currentPage < totalPages;
    if (books.length === 0) {
      return hv(
        /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
          /* @__PURE__ */ jsxs(Text, { style: "artist-name", children: [
            "Books by ",
            artist.displayName
          ] }),
          /* @__PURE__ */ jsxs(Text, { style: "comments-placeholder", children: [
            "No other books by ",
            artist.displayName,
            " found."
          ] })
        ] })
      );
    }
    const feedList = /* @__PURE__ */ jsx(
      FeedList,
      {
        books,
        baseUrl,
        favoritesByBookId,
        page: currentPage,
        hasMore,
        loadMoreHref,
        loadMoreId: CREATOR_BOOKS_LOAD_MORE_ID,
        currentCreatorId: artist.id
      }
    );
    if (currentPage > 1) {
      return hv(
        /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: feedList })
      );
    }
    return hv(
      /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", children: [
        /* @__PURE__ */ jsxs(Text, { style: "artist-name", children: [
          "Other Books by ",
          artist.displayName
        ] }),
        feedList
      ] })
    );
  }
);
const artistBooksLazyStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  feedListStyles(),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "artist-books-lazy",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 24,
      paddingBottom: 24,
      minHeight: 120
    }
  )
] });
export {
  BOOK_ARTIST_FEED_ID,
  GET,
  artistBooksLazyStyles
};
