import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { formatDate } from "../../../utils.js";
import { bookActionsStyles, HyperviewFavoriteInner } from "./BookActions.js";
import VerificationBadge, {
  verificationBadgeStyles
} from "./VerificationBadge.js";
const BookCard = ({
  book,
  baseUrl = "",
  currentCreatorId,
  isFavorited = false,
  title,
  detailHref
}) => {
  const detailUrl = detailHref ?? `${baseUrl}/hyperview/books/${book.id}/tab/book`;
  const artist = book.artist?.displayName;
  const publisher = book.publisher?.displayName;
  const showHeader = currentCreatorId !== book.artist?.id;
  return /* @__PURE__ */ jsxs(View, { style: "book-card", children: [
    showHeader && /* @__PURE__ */ jsxs(View, { style: "book-card-header", children: [
      /* @__PURE__ */ jsx(
        Behavior,
        {
          href: `${baseUrl}/hyperview/creators/${book.artist?.id}/tab/books`
        }
      ),
      /* @__PURE__ */ jsxs(View, { style: "book-card-header-creator", children: [
        book.artist?.coverUrl && /* @__PURE__ */ jsx(
          Image,
          {
            source: book.artist.coverUrl,
            style: "book-card-header-avatar"
          }
        ),
        artist && /* @__PURE__ */ jsx(Text, { style: "book-card-header-artist", children: artist }),
        /* @__PURE__ */ jsx(
          VerificationBadge,
          {
            isVerified: book.artist?.status === "verified",
            baseUrl
          }
        )
      ] }),
      title ? /* @__PURE__ */ jsx(Text, { style: "book-card-header-title", children: title }) : book.releaseDate ? /* @__PURE__ */ jsx(Text, { style: "book-card-header-date", children: formatDate(book.releaseDate) }) : null
    ] }),
    /* @__PURE__ */ jsxs(View, { style: "book-card-cover-wrap", children: [
      /* @__PURE__ */ jsx(Behavior, { href: detailUrl }),
      book.coverUrl && /* @__PURE__ */ jsx(
        Image,
        {
          source: book.coverUrl,
          style: "book-card-cover",
          "resize-mode": "cover"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(View, { style: "book-card-body", children: /* @__PURE__ */ jsxs(View, { style: "book-card-body-row", children: [
      /* @__PURE__ */ jsxs(View, { style: "book-card-title-block", children: [
        /* @__PURE__ */ jsxs(View, { children: [
          /* @__PURE__ */ jsx(Behavior, { href: detailUrl }),
          /* @__PURE__ */ jsx(Text, { style: "book-card-title", children: book.title })
        ] }),
        /* @__PURE__ */ jsx(View, { children: publisher && publisher !== artist && /* @__PURE__ */ jsx(Text, { style: "book-card-publisher", children: publisher.toUpperCase() }) })
      ] }),
      /* @__PURE__ */ jsx(View, { id: `book-like-${book.id}`, style: "book-btn", children: /* @__PURE__ */ jsx(
        HyperviewFavoriteInner,
        {
          bookId: book.id,
          baseUrl,
          isActive: isFavorited
        }
      ) })
    ] }) })
  ] });
};
var BookCard_default = BookCard;
const bookCardStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card",
      backgroundColor: "#fbfaf7",
      borderRadius: 0,
      overflow: "hidden",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-card-cover-wrap", width: "full" }),
  /* @__PURE__ */ jsx(Style, { id: "book-card-cover", width: "full", height: 330 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-cover-placeholder",
      width: "100%",
      height: 220,
      backgroundColor: "#e4e0d5"
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-header",
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 12,
      paddingRight: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      height: 40
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-header-creator",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-header-avatar",
      width: 24,
      height: 24,
      borderRadius: 12,
      overflow: "hidden"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-card-header-title", fontSize: 12, color: "#a39d90" }),
  /* @__PURE__ */ jsx(Style, { id: "book-card-header-artist", fontSize: 13, color: "#45413a" }),
  /* @__PURE__ */ jsx(Style, { id: "book-card-header-date", fontSize: 12, color: "#a39d90" }),
  /* @__PURE__ */ jsx(Style, { id: "book-card-body", padding: 12, flexDirection: "column", gap: 2 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-body-row",
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-card-title-block", flex: 1, flexDirection: "column" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-title",
      fontFamily: "Fraunces-Medium",
      fontSize: 16,
      color: "#191613",
      marginBottom: 2
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-card-artist", fontSize: 13, color: "#45413a" }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-card-publisher",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1,
      color: "#a39d90"
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-like-icon-img", width: 24, height: 24 }),
  /* @__PURE__ */ jsx(Style, { id: "book-like-muted", fontSize: 14, color: "#a39d90" }),
  bookActionsStyles(),
  verificationBadgeStyles()
] });
export {
  bookCardStyles,
  BookCard_default as default
};
