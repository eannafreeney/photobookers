/** @jsxImportSource react */

import { MjmlColumn, MjmlImage, MjmlText, MjmlButton } from "mjml-react";
import {
  brand,
  featureCardContentWidthPx,
  newsletterThreeColContentWidthPx,
  resolveAppBaseUrl,
} from "../constants";
import { formatNewsletterDate } from "../utils";
import { kickerTextProps } from "./kickerTextProps";
import type { BookCardBook } from "./types";
import { ViewButton } from "./ViewButton";

/** BookCard-like square crop — pair with `<MjmlStyle>{bookColumnCoverStyle}</MjmlStyle>` in head. */
export const bookColumnCoverCssClass = "book-col-cover";
export const bookColumnCoverStyle = `
  .${bookColumnCoverCssClass} img {
    object-fit: cover !important;
  }
`;

/** Column-only — must sit inside FeatureRow / MjmlSection. */
export const BookColumn = ({
  book,
  compact = false,
}: {
  book: BookCardBook;
  /** Smaller type/image for 3-up rows. */
  compact?: boolean;
}) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;
  const credit = [book.artistName, book.publisherName]
    .filter(Boolean)
    .join(" – ");
  const imageWidthPx = compact
    ? newsletterThreeColContentWidthPx
    : featureCardContentWidthPx;

  return (
    // compact: top-align so long titles don't shove covers up relative to siblings
    <MjmlColumn verticalAlign={compact ? "top" : "bottom"}>
      {book.coverUrl ? (
        <MjmlImage
          src={book.coverUrl}
          alt={book.title}
          width={`${imageWidthPx}px`}
          fluidOnMobile="true"
          padding="0 0 12px"
          {...(compact
            ? {
                // Square frame + object-fit:cover (see bookColumnCoverStyle) — fills like Card.Image
                height: `${imageWidthPx}px`,
                cssClass: bookColumnCoverCssClass,
                containerBackgroundColor: brand.surfaceAlt,
              }
            : {})}
        />
      ) : null}
      {kicker ? (
        <MjmlText
          {...kickerTextProps}
          color={brand.accent}
          padding={compact ? "0 8px 8px" : "0 0 8px"}
        >
          {kicker}
        </MjmlText>
      ) : null}
      <MjmlText
        align="center"
        fontSize={compact ? "16px" : "28px"}
        fontWeight={500}
        lineHeight="1.2"
        color={brand.onSurfaceStrong}
        padding={compact ? "0 8px 8px" : "0 0 8px"}
        fontFamily={brand.fontDisplay}
      >
        {book.title}
      </MjmlText>
      {!compact && book.blurb ? (
        <MjmlText
          align="center"
          fontSize="15px"
          lineHeight="1.6"
          color={brand.onSurface}
          padding="0 0 8px"
        >
          {book.blurb}
        </MjmlText>
      ) : null}
      {credit ? (
        <MjmlText
          align="center"
          fontSize={compact ? "12px" : "14px"}
          lineHeight="1.4"
          color={brand.onSurface}
          padding={compact ? "0 8px 12px" : "0 0 12px"}
        >
          {credit}
        </MjmlText>
      ) : null}
      {compact ? (
        <MjmlButton
          href={`${resolveAppBaseUrl()}/books/${book.bookSlug}`}
          backgroundColor="#ffffff"
          color={brand.onSurfaceStrong}
          border={`1px solid ${brand.outlineStrong}`}
          fontSize="11px"
          fontWeight={600}
          letterSpacing="0.12em"
          textTransform="uppercase"
          borderRadius="4px"
          innerPadding="10px 16px"
          align="center"
          padding="0 8px 16px"
        >
          View
        </MjmlButton>
      ) : (
        <ViewButton href={`${resolveAppBaseUrl()}/books/${book.bookSlug}`} />
      )}
    </MjmlColumn>
  );
};
