import { Behavior, Style, View } from "../../../lib/hxml-comps";
import { Text } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import { xmlText } from "../../../lib/hxml";

type Props = {
  book: BookWithGalleryImages;
  baseUrl: string;
  isLiked: boolean;
  isWishlisted: boolean;
  isCollected: boolean;
};

const BookActions = ({
  book,
  baseUrl,
  isLiked,
  isWishlisted,
  isCollected,
}: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <View style="book-actions-row">
        <View style="book-action-cell">
          <View id={`book-like-${book.id}`} style="book-action-inner">
            <HyperviewBookLikeInner
              bookId={book.id}
              baseUrl={baseUrl}
              isActive={isLiked}
            />
          </View>
        </View>
        <View style="book-action-cell">
          <View id={`book-wishlist-${book.id}`} style="book-action-inner">
            <HyperviewBookWishlistInner
              bookId={book.id}
              baseUrl={baseUrl}
              isActive={isWishlisted}
            />
          </View>
        </View>
        <View style="book-action-cell">
          <View id={`book-collect-${book.id}`} style="book-action-inner">
            <HyperviewBookCollectInner
              bookId={book.id}
              baseUrl={baseUrl}
              isActive={isCollected}
            />
          </View>
        </View>
        <View style="book-action-cell">
          <View style="book-action-inner">
            <Behavior
              trigger="press"
              action="share"
              {...{
                "xmlns:share": "https://hyperview.org/share",
                "share:url": xmlText(`${baseUrl}/books/${book.slug}`),
                "share:message": xmlText(
                  `Check out ${book.title} on Photobookers`,
                ),
                "share:title": xmlText(book.title),
              }}
            />
            <Text style="book-action-label">↗</Text>
          </View>
        </View>
      </View>
    </view>
  );
};

export default BookActions;

type InnerProps = {
  bookId: string;
  baseUrl: string;
  isActive: boolean;
};

export const HyperviewBookWishlistInner = ({
  bookId,
  baseUrl,
  isActive,
}: InnerProps) => (
  <>
    <Text style="book-action-label">{isActive ? "♥" : "♡"}</Text>
    <Behavior
      trigger="press"
      verb="post"
      action="replace-inner"
      target={`book-wishlist-${bookId}`}
      href={`${baseUrl}/api/books/${bookId}/wishlist`}
    />
  </>
);

export const HyperviewBookCollectInner = ({
  bookId,
  baseUrl,
  isActive,
}: InnerProps) => (
  <>
    <Text style="book-action-label">{isActive ? "✓" : "+"}</Text>
    <Behavior
      trigger="press"
      verb="post"
      action="replace-inner"
      target={`book-collect-${bookId}`}
      href={`${baseUrl}/api/books/${bookId}/collect`}
    />
  </>
);

export const HyperviewBookLikeInner = ({
  bookId,
  baseUrl,
  isActive,
}: InnerProps) => (
  <>
    <Text style="book-action-label">{isActive ? "★" : "☆"}</Text>
    <Behavior
      trigger="press"
      verb="post"
      action="replace-inner"
      target={`book-like-${bookId}`}
      href={`${baseUrl}/api/books/${bookId}/like`}
    />
  </>
);

export const bookActionsStyles = () => (
  <>
    <Style
      id="book-actions-row"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      marginTop={24}
      marginBottom={24}
      paddingLeft={4}
      paddingRight={4}
    />
    <Style id="book-action-cell" flex={1} alignItems="center" />
    <Style
      id="book-action-inner"
      paddingTop={10}
      paddingBottom={10}
      alignItems="center"
      justifyContent="center"
      borderRadius={8}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#e8e8e6"
      width="100%"
      marginLeft={4}
      marginRight={4}
    />
    <Style
      id="book-action-label"
      fontSize={13}
      fontWeight="600"
      color="#111111"
    />
    <Style
      id="book-action-inner"
      height={32}
      width="100%"
      paddingLeft={24}
      paddingRight={24}
      borderRadius={16}
      backgroundColor="#e5e7eb"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    />
  </>
);
