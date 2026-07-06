import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Style, View } from "../../../../../../lib/hxml-comps.js";
import { paramValidator } from "../../../../../../lib/validator.js";
import { AppLayout } from "../../../../+layout.js";
import BookTabs, {
  bookTabStyles
} from "../../../../../../features/hyperview/components/BookTabs.js";
import { creatorCardStyles } from "../../../../../../features/hyperview/components/CreatorCard.js";
import BookPage, {
  bookPageStyles
} from "../../../../../../features/hyperview/components/BookPage.js";
import { bookCommentsPanelStyles } from "../../../../../../features/hyperview/components/BookCommentsPanel.js";
import { feedListStyles } from "../../../../../../features/hyperview/components/FeedList.js";
import { bookIdSchema } from "../../../../../../schemas/index.js";
import { getBookById } from "../../../../../../features/dashboard/books/services.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../utils.js";
import { favoriteFlagsForBooks } from "../../../../../../features/hyperview/findFlags.js";
import { bookCardStyles } from "../../../../../../features/hyperview/components/BookCard.js";
import { artistTabStyles } from "./artist.js";
import { signInPromptStyles } from "../../../../../../features/hyperview/components/SignInPrompt.js";
import ErrorScreen from "../../../../../../features/hyperview/components/ErrorScreen.js";
import { maybeRecordBookView } from "../../../../../../features/book-views/record.js";
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const user = await getUser(c);
  const baseUrl = getBaseUrl(c);
  const [error, book] = await getBookById(bookId);
  if (error || !book) {
    return hv(
      /* @__PURE__ */ jsx(ErrorScreen, { user, baseUrl, message: "Book not found." })
    );
  }
  const galleryImages = [
    book.coverUrl,
    ...(book.images ?? []).map(
      (row) => row.imageUrl
    )
  ].filter((url) => Boolean(url));
  const favoritesByBookId = await favoriteFlagsForBooks(user, [book]);
  if (book.publicationStatus === "published" && book.approvalStatus === "approved") {
    await maybeRecordBookView(c, book, "hyperview");
  }
  return hv(
    /* @__PURE__ */ jsxs(
      AppLayout,
      {
        showDock: true,
        baseUrl,
        title: book.title,
        artist: book.artist?.displayName,
        publisher: book.publisher?.displayName,
        extraStyles: pageStyles(),
        coverUrl: book.coverUrl,
        children: [
          /* @__PURE__ */ jsx(
            BookTabs,
            {
              baseUrl,
              bookId: book.id,
              hasPublisher: !!book.publisher,
              activeTab: "book"
            }
          ),
          /* @__PURE__ */ jsx(View, { id: "tab-area", style: "page-content", children: /* @__PURE__ */ jsx(
            BookPage,
            {
              galleryImages,
              book,
              baseUrl,
              isFavorited: favoritesByBookId[book.id] ?? false
            }
          ) })
        ]
      }
    )
  );
});
const pageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "gallery",
      height: 360,
      marginLeft: -16,
      marginRight: -16,
      marginBottom: 20,
      flexDirection: "row"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "gallery-slide", width: "90%", marginRight: 12 }),
  /* @__PURE__ */ jsx(Style, { id: "gallery-slide-image", width: "100%", height: 360 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "title",
      fontSize: 22,
      fontWeight: "700",
      color: "#191613",
      marginBottom: 6
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "subtitle", fontSize: 15, color: "#45413a", marginBottom: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "description",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "description-paragraph",
      fontSize: 14,
      color: "#45413a",
      lineHeight: 22,
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "tab-fragment", flex: 1, padding: 16 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "artist-name",
      fontSize: 18,
      fontWeight: "600",
      color: "#191613",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "artist-bio", fontSize: 14, color: "#45413a", lineHeight: 22 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "publisher-name",
      fontSize: 18,
      fontWeight: "600",
      color: "#191613",
      marginBottom: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "publisher-location", fontSize: 14, color: "#45413a" }),
  /* @__PURE__ */ jsx(Style, { id: "comments-placeholder", fontSize: 14, color: "#a39d90" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comments-heading",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613",
      marginBottom: 12
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comments-empty",
      fontSize: 13,
      color: "#a39d90",
      textAlign: "center",
      padding: 16
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-item",
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-author-row",
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-avatar",
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-avatar-placeholder",
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "comment-author-info", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "comment-username",
      fontSize: 13,
      fontWeight: "600",
      color: "#191613"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "comment-date", fontSize: 11, color: "#a39d90", marginTop: 2 }),
  /* @__PURE__ */ jsx(Style, { id: "comment-body", fontSize: 14, color: "#45413a", lineHeight: 20 }),
  creatorCardStyles(),
  bookTabStyles(),
  bookPageStyles(),
  bookCommentsPanelStyles(),
  feedListStyles(),
  bookCardStyles(),
  artistTabStyles(),
  signInPromptStyles()
] });
export {
  GET
};
