import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import type { BookCardResult } from "../../../constants/queries";
import { formatDate } from "../../../utils";
import { bookActionsStyles, HyperviewFavoriteInner } from "./BookActions";
import VerificationBadge, {
  verificationBadgeStyles,
} from "./VerificationBadge";

type Props = {
  book: BookCardResult;
  baseUrl?: string;
  currentCreatorId?: string | null;
  isFavorited?: boolean;
  title?: string | null;
};

const BookCard: FC<Props> = ({
  book,
  baseUrl = "",
  currentCreatorId,
  isFavorited = false,
  title,
}) => {
  const detailUrl = `${baseUrl}/hyperview/books/${book.id}/tab/book`;
  const artist = book.artist?.displayName;
  const publisher = book.publisher?.displayName;
  const showHeader = currentCreatorId !== book.artist?.id;

  return (
    <View style="book-card">
      {showHeader && (
        <View style="book-card-header">
          <Behavior
            href={`${baseUrl}/hyperview/creators/${book.artist?.id}/tab/books`}
          />
          <View style="book-card-header-creator">
            {book.artist?.coverUrl && (
              <Image
                source={book.artist.coverUrl}
                style="book-card-header-avatar"
              />
            )}
            {artist && <Text style="book-card-header-artist">{artist}</Text>}
            <VerificationBadge
              isVerified={book.artist?.status === "verified"}
              baseUrl={baseUrl}
            />
          </View>
          {title ? (
            <Text style="book-card-header-title">{title}</Text>
          ) : book.releaseDate ? (
            <Text style="book-card-header-date">
              {formatDate(book.releaseDate)}
            </Text>
          ) : null}
        </View>
      )}

      <View style="book-card-cover-wrap">
        <Behavior href={detailUrl} />
        {book.coverUrl && (
          <Image
            source={book.coverUrl}
            style="book-card-cover"
            resize-mode="cover"
          />
        )}
      </View>

      <View style="book-card-body">
        <View style="book-card-body-row">
          <View style="book-card-title-block">
            <View>
              <Behavior href={detailUrl} />
              <Text style="book-card-title">{book.title}</Text>
            </View>
            <View>
              {publisher && publisher !== artist && (
                <Text style="book-card-publisher">{publisher}</Text>
              )}
            </View>
          </View>
          <View id={`book-like-${book.id}`} style="book-btn">
            <HyperviewFavoriteInner
              bookId={book.id}
              baseUrl={baseUrl}
              isActive={isFavorited}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookCard;

export const bookCardStyles = () => (
  <>
    <Style
      id="book-card"
      backgroundColor="#ffffff"
      borderRadius={4}
      overflow="hidden"
      marginBottom={16}
      borderWidth={1}
      borderColor="#e5e5e5"
    />
    <Style id="book-card-cover-wrap" width="full" />
    <Style id="book-card-cover" width="full" height={330} />
    <Style
      id="book-card-cover-placeholder"
      width="100%"
      height={220}
      backgroundColor="#e5e5e5"
    />
    <Style
      id="book-card-header"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={12}
      paddingRight={12}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      height={40}
    />
    <Style
      id="book-card-header-creator"
      flexDirection="row"
      alignItems="center"
      gap={8}
      flex={1}
    />
    <Style
      id="book-card-header-avatar"
      width={24}
      height={24}
      borderRadius={12}
      overflow="hidden"
    />
    <Style id="book-card-header-title" fontSize={12} color="#999999" />
    <Style id="book-card-header-artist" fontSize={13} color="#555555" />
    <Style id="book-card-header-date" fontSize={12} color="#999999" />
    <Style id="book-card-body" padding={12} flexDirection="column" gap={2} />
    <Style
      id="book-card-body-row"
      flexDirection="row"
      alignItems="flex-start"
      justifyContent="space-between"
      gap={8}
    />
    <Style id="book-card-title-block" flex={1} flexDirection="column" />
    <Style
      id="book-card-title"
      fontSize={15}
      fontWeight="700"
      color="#111111"
      marginBottom={2}
    />
    <Style id="book-card-artist" fontSize={13} color="#555555" />
    <Style id="book-card-publisher" fontSize={12} color="#999999" />
    <Style id="book-like-icon-img" width={24} height={24} />
    <Style id="book-like-muted" fontSize={14} color="#d1d5db" />
    {bookActionsStyles()}
    {verificationBadgeStyles()}
  </>
);
