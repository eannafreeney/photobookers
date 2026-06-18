import { Behavior, Style, View } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import { outboundPurchasePath } from "../../purchase-clicks/urls";
import BookActions, { bookActionsStyles } from "./BookActions";
import BookGallery, { bookGalleryStyles } from "./BookGallery";
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
    <View style="book-page">
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
      {purchaseHref ? (
        <View style="book-purchase-wrap">
          <View style="purchase-btn">
            <Behavior action="deep-link" href={purchaseHref} />
            <Text style="purchase-label">See more</Text>
          </View>
        </View>
      ) : null}
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
    <Style id="book-purchase-wrap" marginTop={4} marginBottom={16} />
    <Style
      id="purchase-btn"
      paddingTop={10}
      paddingBottom={10}
      paddingLeft={20}
      paddingRight={20}
      borderRadius={0}
      backgroundColor="#191613"
      alignItems="center"
    />
    <Style id="purchase-label" fontSize={14} fontWeight="600" color="#fbfaf7" />
  </>
);
