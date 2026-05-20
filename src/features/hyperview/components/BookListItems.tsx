import { BookCardResult } from "../../../constants/queries";
import { Item, Spinner, Style, View } from "../../../lib/hxml-comps";
import BookCard from "./BookCard";

/** How far above the spinner to start loading the next page. */
const PREFETCH_OFFSET = 500;

type Props = {
  books: BookCardResult[];
  baseUrl: string;
  wishlistsByBookId: Record<string, boolean>;
  page: number;
  hasMore: boolean;
};

const BooksListItems = ({
  books,
  baseUrl,
  wishlistsByBookId,
  page,
  hasMore,
}: Props) => (
  <>
    {books.map((book) => (
      <Item
        key={book.id}
        itemKey={book.id}
        style="books-list-item"
        id={`book-${book.id}`}
      >
        <BookCard
          book={book}
          baseUrl={baseUrl}
          isWishlisted={wishlistsByBookId[book.id] ?? false}
        />
      </Item>
    ))}
    {hasMore ? (
      <Item
        key={`load-more-${page}`}
        itemKey={`load-more-${page}`}
        style="books-list-spinner"
        trigger="visible"
        once="true"
        verb="get"
        href={`${baseUrl}/hyperview/books?page=${page + 1}`}
        action="replace"
      >
        <View style="books-list-prefetch" />
        <Spinner />
      </Item>
    ) : null}
  </>
);

export default BooksListItems;

export const bookListItemsStyles = () => (
  <>
    <Style id="books-list" flex={1} paddingTop={16} />
    <Style id="books-list-item" paddingLeft={16} paddingRight={16} />
    <Style
      id="books-list-spinner"
      alignItems="center"
      justifyContent="flex-end"
      paddingBottom={16}
    />
    <Style id="books-list-prefetch" minHeight={PREFETCH_OFFSET} width="100%" />
  </>
);
