import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import { xmlText } from "../../../lib/hxml.js";
const BookWishlistIcon = ({
  baseUrl,
  isActive
}) => /* @__PURE__ */ jsx(
  Image,
  {
    source: `${baseUrl}/icons/wishlist-${isActive ? "on" : "off"}.png`,
    style: "book-action-icon",
    "resize-mode": "contain"
  }
);
const BookActions = ({
  book,
  baseUrl,
  isFavorited,
  shareUrl = `${baseUrl}/books/${book.slug}`,
  shareTitle = book.title,
  shareMessage = "Check out this book on Photobookers"
}) => {
  return /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsxs(View, { style: "book-actions-row", children: [
    /* @__PURE__ */ jsx(View, { style: "book-action-cell", children: /* @__PURE__ */ jsx(View, { id: `book-favorite-${book.id}`, children: /* @__PURE__ */ jsx(
      HyperviewFavoriteInner,
      {
        bookId: book.id,
        baseUrl,
        isActive: isFavorited,
        variant: "block"
      }
    ) }) }),
    /* @__PURE__ */ jsx(View, { style: "book-action-cell", children: /* @__PURE__ */ jsxs(View, { style: "book-action-block", children: [
      /* @__PURE__ */ jsx(
        Image,
        {
          source: `${baseUrl}/icons/share.png`,
          style: "book-action-icon",
          "resize-mode": "contain"
        }
      ),
      /* @__PURE__ */ jsx(Text, { style: "book-action-label", children: "Share" }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          action: "share",
          href: shareUrl,
          "share-url": xmlText(shareUrl),
          "share-message": xmlText(shareMessage),
          "share-title": xmlText(shareTitle),
          ...book.coverUrl ? { "share-image": xmlText(book.coverUrl) } : {}
        }
      )
    ] }) })
  ] }) });
};
var BookActions_default = BookActions;
const HyperviewFavoriteInner = ({
  bookId,
  baseUrl,
  isActive,
  variant = "compact"
}) => {
  const label = isActive ? "Favorited" : "Favorite";
  const layoutParam = variant === "block" ? "?layout=block" : "";
  const href = `${baseUrl}/api/books/${bookId}/wishlist${layoutParam}`;
  if (variant === "block") {
    return /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", style: "book-action-block", children: [
      /* @__PURE__ */ jsx(BookWishlistIcon, { baseUrl, isActive }),
      /* @__PURE__ */ jsx(Text, { style: "book-action-label", children: label }),
      /* @__PURE__ */ jsx(
        Behavior,
        {
          verb: "post",
          action: "replace-inner",
          target: `book-favorite-${bookId}`,
          href
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(View, { xmlns: "https://hyperview.org/hyperview", style: "book-btn", children: [
    /* @__PURE__ */ jsx(BookWishlistIcon, { baseUrl, isActive }),
    /* @__PURE__ */ jsx(
      Behavior,
      {
        verb: "post",
        action: "replace-inner",
        target: `book-favorite-${bookId}`,
        href
      }
    )
  ] });
};
const bookActionsStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-actions-row",
      flexDirection: "row",
      alignItems: "stretch",
      gap: 8
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-action-cell", flex: 1 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-action-block",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingTop: 12,
      paddingBottom: 12,
      paddingLeft: 16,
      paddingRight: 16,
      borderRadius: 0,
      backgroundColor: "#fbfaf7",
      borderWidth: 1,
      borderColor: "#e4e0d5",
      width: "100%",
      children: /* @__PURE__ */ jsx("modifier", {})
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-btn",
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#e4e0d5",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "book-action-icon", width: 18, height: 18 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "book-action-label",
      fontSize: 14,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  BookWishlistIcon,
  HyperviewFavoriteInner,
  bookActionsStyles,
  BookActions_default as default
};
