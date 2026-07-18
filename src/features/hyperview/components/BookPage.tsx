import { Behavior, Style, View } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import { outboundPurchasePath } from "../../purchase-clicks/urls";
import BookActions, { bookActionsStyles } from "./BookActions";
import BookGallery, { bookGalleryStyles } from "./BookGallery";
import BookPurchaseButton, {
  bookPurchaseButtonStyles,
} from "./BookPurchaseButton";
import DiscoveryTags, { discoveryTagStyles } from "./DiscoveryTags";
import { isFeatureEnabledForUser } from "../../../lib/features";
import type { AuthUser } from "../../../../types";

function purchaseDeepLinkHref(
  baseUrl: string,
  book: BookWithGalleryImages,
): string | null {
  const raw = book.purchaseLink?.trim();
  if (!raw) return null;

  const base = baseUrl.replace(/\/$/, "");
  const trackOutbound =
    book.publicationStatus === "published" &&
    book.approvalStatus === "approved";

  if (trackOutbound) {
    return `${base}${outboundPurchasePath(book.slug, "hyperview")}`;
  }

  if (/^https?:\/\//i.test(raw)) return raw;
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
}

type Props = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  baseUrl: string;
  isFavorited: boolean;
  user?: AuthUser | null;
};

/** Split description into paragraphs so blank lines render as paragraph breaks. */
function descriptionParagraphs(
  description: string | null | undefined,
): string[] {
  if (!description) return [];
  return description
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const BookPage = ({
  galleryImages,
  book,
  baseUrl,
  isFavorited,
  user,
}: Props) => {
  const paragraphs = descriptionParagraphs(book.description);
  const purchaseHref = purchaseDeepLinkHref(baseUrl, book);
  const pressLinks =
    isFeatureEnabledForUser("bookPressLinks", user) && book.pressLinks?.length
      ? book.pressLinks
      : [];

  return (
    <View xmlns="https://hyperview.org/hyperview" style="book-page">
      <BookGallery galleryImages={galleryImages} />
      <BookActions book={book} baseUrl={baseUrl} isFavorited={isFavorited} />
      <View>
        <Text style="title">{book.title}</Text>
        <Text style="subtitle">{book.artist?.displayName}</Text>
      </View>
      {paragraphs.map((paragraph, index) => (
        <Text key={index} style="description-paragraph">
          {paragraph}
        </Text>
      ))}
      <DiscoveryTags baseUrl={baseUrl} tags={book.tags ?? []} />
      {purchaseHref ? <BookPurchaseButton purchaseHref={purchaseHref} /> : null}
      {pressLinks.length > 0 ? (
        <View style="press-section">
          <Text style="press-heading">Press</Text>
          {pressLinks.map((link) => (
            <View key={link.url} style="press-item">
              <Text style="press-title">{link.title}</Text>
              <Behavior action="deep-link" href={link.url} />
              {link.quote ? (
                <Text style="press-quote">{link.quote}</Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default BookPage;

export const bookPageStyles = () => (
  <>
    <Style id="book-page" flexDirection="column" gap={12} />
    <Style id="press-section" flexDirection="column" gap={8} marginTop={8} />
    <Style
      id="press-heading"
      fontSize={12}
      fontWeight="600"
      textTransform="uppercase"
      color="#666666"
    />
    <Style id="press-item" flexDirection="column" gap={4} />
    <Style id="press-title" fontSize={15} fontWeight="500" color="#111111" />
    <Style id="press-quote" fontSize={14} fontStyle="italic" color="#444444" />
    {bookGalleryStyles()}
    {bookActionsStyles()}
    {discoveryTagStyles()}
    {bookPurchaseButtonStyles()}
  </>
);
