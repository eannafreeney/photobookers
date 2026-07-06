import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../lib/hxml-comps.js";
import { Text } from "../../../lib/hxml-comps.js";
import { outboundPurchasePath } from "../../purchase-clicks/urls.js";
import BookActions, { bookActionsStyles } from "./BookActions.js";
import BookGallery, { bookGalleryStyles } from "./BookGallery.js";
import BookPurchaseButton, {
  bookPurchaseButtonStyles
} from "./BookPurchaseButton.js";
import DiscoveryTags, { discoveryTagStyles } from "./DiscoveryTags.js";
function purchaseDeepLinkHref(baseUrl, book) {
  const raw = book.purchaseLink?.trim();
  if (!raw) return null;
  const base = baseUrl.replace(/\/$/, "");
  const trackOutbound = book.publicationStatus === "published" && book.approvalStatus === "approved";
  if (trackOutbound) {
    return `${base}${outboundPurchasePath(book.slug, "hyperview")}`;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
}
function descriptionParagraphs(description) {
  if (!description) return [];
  return description.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}
const BookPage = ({ galleryImages, book, baseUrl, isFavorited }) => {
  const paragraphs = descriptionParagraphs(book.description);
  const purchaseHref = purchaseDeepLinkHref(baseUrl, book);
  return /* @__PURE__ */ jsxs(View, { style: "book-page", children: [
    /* @__PURE__ */ jsx(BookGallery, { galleryImages }),
    /* @__PURE__ */ jsx(BookActions, { book, baseUrl, isFavorited }),
    /* @__PURE__ */ jsxs(View, { children: [
      /* @__PURE__ */ jsx(Text, { style: "title", children: book.title }),
      /* @__PURE__ */ jsx(Text, { style: "subtitle", children: book.artist?.displayName })
    ] }),
    paragraphs.map((paragraph, index) => /* @__PURE__ */ jsx(Text, { style: "description-paragraph", children: paragraph }, index)),
    /* @__PURE__ */ jsx(DiscoveryTags, { baseUrl, tags: book.tags ?? [] }),
    purchaseHref ? /* @__PURE__ */ jsx(BookPurchaseButton, { purchaseHref }) : null
  ] });
};
var BookPage_default = BookPage;
const bookPageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "book-page", flexDirection: "column", gap: 12 }),
  bookGalleryStyles(),
  bookActionsStyles(),
  discoveryTagStyles(),
  bookPurchaseButtonStyles()
] });
export {
  bookPageStyles,
  BookPage_default as default
};
