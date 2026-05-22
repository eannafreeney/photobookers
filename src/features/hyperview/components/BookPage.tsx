import { Behavior, Style, View } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import BookActions, { bookActionsStyles } from "./BookActions";
import BookGallery, { bookGalleryStyles } from "./BookGallery";
import DiscoveryTags, { discoveryTagStyles } from "./DiscoveryTags";

/** Absolute URL for Hyperview `deep-link` (handles relative purchase links). */
function purchaseDeepLinkHref(
  baseUrl: string,
  purchaseLink: string | null | undefined,
): string | null {
  const raw = purchaseLink?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = baseUrl.replace(/\/$/, "");
  return raw.startsWith("/") ? `${base}${raw}` : `${base}/${raw}`;
}

type Props = {
  galleryImages: string[];
  book: BookWithGalleryImages;
  baseUrl: string;
  isFavorited: boolean;
};

const BookPage = ({ galleryImages, book, baseUrl, isFavorited }: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <BookGallery galleryImages={galleryImages} />
      <BookActions book={book} baseUrl={baseUrl} isFavorited={isFavorited} />
      <Text style="title">{book.title}</Text>
      <Text style="subtitle">{book.artist?.displayName}</Text>
      <Text style="description">{book.description}</Text>
      <DiscoveryTags baseUrl={baseUrl} tags={book.tags ?? []} />
      {purchaseDeepLinkHref(baseUrl, book.purchaseLink) ? (
        <View style="book-purchase-wrap">
          <View style="purchase-btn">
            <Behavior
              action="deep-link"
              href={purchaseDeepLinkHref(baseUrl, book.purchaseLink)!}
            />
            <Text style="purchase-label">See more</Text>
          </View>
        </View>
      ) : null}
    </view>
  );
};

export default BookPage;

export const bookPageStyles = () => (
  <>
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
      borderRadius={8}
      backgroundColor="#111111"
      alignItems="center"
    />
    <Style id="purchase-label" fontSize={14} fontWeight="600" color="#ffffff" />
  </>
);
