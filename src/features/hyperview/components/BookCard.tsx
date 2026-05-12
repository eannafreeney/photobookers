import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import type { BookCardResult } from "../../../constants/queries";

type Props = {
  book: BookCardResult;
  baseUrl?: string;
};

const BookCard: FC<Props> = ({ book, baseUrl = "" }) => {
  const detailUrl = `${baseUrl}/hyperview/books/${book.slug}/tab/book`;
  const artist = book.artist?.displayName;
  const publisher = book.publisher?.displayName;

  return (
    <View style="book-card">
      <Behavior trigger="press" action="push" href={detailUrl} />

      {book.coverUrl && (
        <Image
          source={book.coverUrl}
          style="book-card-cover"
          resize-mode="cover"
        />
      )}

      <View style="book-card-body">
        <Text style="book-card-title">{book.title}</Text>
        {artist && <Text style="book-card-artist">{artist}</Text>}
        {publisher && publisher !== artist && (
          <Text style="book-card-publisher">{publisher}</Text>
        )}
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
      borderRadius={10}
      overflow="hidden"
      // marginBottom={16}
      borderWidth={1}
      borderColor="#e5e5e5"
    />
    <Style id="book-card-cover" width="full" height={330} />
    <Style
      id="book-card-cover-placeholder"
      width="100%"
      height={220}
      backgroundColor="#e5e5e5"
    />
    <Style id="book-card-body" padding={12} flexDirection="column" gap={2} />
    <Style
      id="book-card-title"
      fontSize={15}
      fontWeight="700"
      color="#111111"
      marginBottom={2}
    />
    <Style id="book-card-artist" fontSize={13} color="#555555" />
    <Style id="book-card-publisher" fontSize={12} color="#999999" />
  </>
);
