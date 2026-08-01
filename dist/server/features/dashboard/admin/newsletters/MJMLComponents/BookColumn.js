import { jsx, jsxs } from "react/jsx-runtime";
import { MjmlColumn, MjmlImage, MjmlText, MjmlButton } from "mjml-react";
import {
  appBaseUrl,
  brand,
  featureCardContentWidthPx,
  newsletterThreeColContentWidthPx
} from "../constants.js";
import { formatNewsletterDate } from "../utils.js";
import { kickerTextProps } from "./kickerTextProps.js";
import { ViewButton } from "./ViewButton.js";
const BookColumn = ({
  book,
  compact = false
}) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;
  const credit = [book.artistName, book.publisherName].filter(Boolean).join(" \u2013 ");
  const imageWidthPx = compact ? newsletterThreeColContentWidthPx : featureCardContentWidthPx;
  return /* @__PURE__ */ jsxs(MjmlColumn, { verticalAlign: "bottom", children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        src: book.coverUrl,
        alt: book.title,
        width: `${imageWidthPx}px`,
        fluidOnMobile: "true",
        padding: compact ? "12px 8px 12px" : "0 0 12px"
      }
    ) : null,
    kicker ? /* @__PURE__ */ jsx(
      MjmlText,
      {
        ...kickerTextProps,
        color: brand.accent,
        padding: compact ? "0 8px 8px" : "0 0 8px",
        children: kicker
      }
    ) : null,
    /* @__PURE__ */ jsx(
      MjmlText,
      {
        align: "center",
        fontSize: compact ? "16px" : "28px",
        fontWeight: 500,
        lineHeight: "1.2",
        color: brand.onSurfaceStrong,
        padding: compact ? "0 8px 8px" : "0 0 8px",
        fontFamily: brand.fontDisplay,
        children: book.title
      }
    ),
    !compact && book.blurb ? /* @__PURE__ */ jsx(
      MjmlText,
      {
        align: "center",
        fontSize: "15px",
        lineHeight: "1.6",
        color: brand.onSurface,
        padding: "0 0 8px",
        children: book.blurb
      }
    ) : null,
    credit ? /* @__PURE__ */ jsx(
      MjmlText,
      {
        align: "center",
        fontSize: compact ? "12px" : "14px",
        lineHeight: "1.4",
        color: brand.onSurface,
        padding: compact ? "0 8px 12px" : "0 0 12px",
        children: credit
      }
    ) : null,
    compact ? /* @__PURE__ */ jsx(
      MjmlButton,
      {
        href: `${appBaseUrl}/books/${book.bookSlug}`,
        backgroundColor: "#ffffff",
        color: brand.onSurfaceStrong,
        border: `1px solid ${brand.outlineStrong}`,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        borderRadius: "4px",
        innerPadding: "10px 16px",
        align: "center",
        padding: "0 8px 16px",
        children: "View"
      }
    ) : /* @__PURE__ */ jsx(ViewButton, { href: `${appBaseUrl}/books/${book.bookSlug}` })
  ] });
};
export {
  BookColumn
};
