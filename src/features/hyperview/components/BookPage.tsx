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

const BookPage = ({ galleryImages, book, baseUrl, isFavorited }: Props) => {
  const paragraphs = descriptionParagraphs(book.description);
  const purchaseHref = purchaseDeepLinkHref(baseUrl, book);

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
    </View>
  );
};

export default BookPage;

export const bookPageStyles = () => (
  <>
    <Style id="book-page" flexDirection="column" gap={12} />
    {bookGalleryStyles()}
    {bookActionsStyles()}
    {discoveryTagStyles()}
    {bookPurchaseButtonStyles()}
  </>
);
