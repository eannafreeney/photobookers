import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { BookWithGalleryImages } from "../../app/types";
import { xmlText } from "../../../lib/hxml";

type Props = {
  book: BookWithGalleryImages;
  baseUrl: string;
  isFavorited: boolean;
};

export const BookWishlistIcon = ({
  baseUrl,
  isActive,
}: {
  baseUrl: string;
  isActive: boolean;
}) => (
  <Image
    source={`${baseUrl}/icons/wishlist-${isActive ? "on" : "off"}.png`}
    style="book-action-icon"
    resize-mode="contain"
  />
);

const BookActions = ({ book, baseUrl, isFavorited }: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      <View style="book-actions-row">
        <View style="book-action-cell">
          <View id={`book-favorite-${book.id}`}>
            <HyperviewFavoriteInner
              bookId={book.id}
              baseUrl={baseUrl}
              isActive={isFavorited}
              variant="block"
            />
          </View>
        </View>
        <View style="book-action-cell">
          <View style="book-action-block">
            <Image
              source={`${baseUrl}/icons/share.png`}
              style="book-action-icon"
              resize-mode="contain"
            />
            <Text style="book-action-label">Share</Text>
            <Behavior
              action="share"
              href={`${baseUrl}/books/${book.slug}`}
              share-url={xmlText(`${baseUrl}/books/${book.slug}`)}
              share-message={xmlText("Check out this book on Photobookers")}
              share-title={xmlText(book.title)}
              {...(book.coverUrl
                ? { "share-image": xmlText(book.coverUrl) }
                : {})}
            />
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
  variant?: "compact" | "block";
};

export const HyperviewFavoriteInner = ({
  bookId,
  baseUrl,
  isActive,
  variant = "compact",
}: InnerProps) => {
  const label = isActive ? "Favorited" : "Favorite";
  const layoutParam = variant === "block" ? "?layout=block" : "";
  const href = `${baseUrl}/api/books/${bookId}/wishlist${layoutParam}`;

  if (variant === "block") {
    return (
      <View xmlns="https://hyperview.org/hyperview" style="book-action-block">
        <BookWishlistIcon baseUrl={baseUrl} isActive={isActive} />
        <Text style="book-action-label">{label}</Text>
        <Behavior
          verb="post"
          action="replace-inner"
          target={`book-favorite-${bookId}`}
          href={href}
        />
      </View>
    );
  }

  return (
    <View xmlns="https://hyperview.org/hyperview" style="book-btn">
      <BookWishlistIcon baseUrl={baseUrl} isActive={isActive} />
      <Behavior
        verb="post"
        action="replace-inner"
        target={`book-favorite-${bookId}`}
        href={href}
      />
    </View>
  );
};

export const bookActionsStyles = () => (
  <>
    <Style
      id="book-actions-row"
      flexDirection="row"
      alignItems="stretch"
      gap={8}
      marginTop={24}
      marginBottom={24}
    />
    <Style id="book-action-cell" flex={1} />
    <Style
      id="book-action-block"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      gap={8}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      borderRadius={10}
      backgroundColor="#ffffff"
      borderWidth={1}
      borderColor="#e8e8e6"
      width="100%"
    >
      <modifier />
    </Style>
    <Style
      id="book-btn"
      width={32}
      height={32}
      borderRadius={16}
      backgroundColor="#e5e7eb"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    />
    <Style id="book-action-icon" width={18} height={18} />
    <Style
      id="book-action-label"
      fontSize={14}
      fontWeight="600"
      color="#111111"
    />
  </>
);
