import { Child } from "hono/jsx";
import { BookCardResult } from "../../../constants/queries";
import {
  Item,
  List,
  Spinner,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";
import BookCard from "./BookCard";

/** How far above the spinner to start loading the next page. */
const PREFETCH_OFFSET = 500;

type Props = {
  books: BookCardResult[];
  baseUrl: string;
  favoritesByBookId: Record<string, boolean>;
  page: number;
  hasMore: boolean;
  /** Path for infinite scroll (page appended via ?page=N). */
  loadMorePath: string;
};

const BooksListItems = ({
  books,
  baseUrl,
  favoritesByBookId,
  page,
  hasMore,
  loadMorePath,
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
          isFavorited={favoritesByBookId[book.id] ?? false}
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
        href={`${loadMorePath}${loadMorePath.includes("?") ? "&" : "?"}page=${page + 1}`}
        action="replace"
      >
        <View style="books-list-prefetch" />
        <Spinner />
      </Item>
    ) : null}
  </>
);

export default BooksListItems;

type BooksListProps = Props & {
  listId?: string;
  refreshHref: string;
  listHeader?: Child;
  emptyMessage?: string;
};

export const BooksList = ({
  listId = "books-list",
  refreshHref,
  listHeader,
  emptyMessage,
  ...itemsProps
}: BooksListProps) => (
  <List
    id={listId}
    style="books-list"
    trigger="refresh"
    href={refreshHref}
    action="replace"
  >
    {listHeader ? (
      <Item itemKey="book-filters-header" style="books-list-filters-header">
        {listHeader}
      </Item>
    ) : null}
    {emptyMessage ? (
      <Item itemKey="books-list-empty" style="books-list-empty-item">
        <Text style="featured-empty-hint">{emptyMessage}</Text>
      </Item>
    ) : (
      <BooksListItems {...itemsProps} />
    )}
  </List>
);

export const bookListItemsStyles = () => (
  <>
    <Style id="books-list" flex={1} />
    <Style id="books-list-filters-header" flexShrink={0} width="100%" />
    <Style
      id="books-list-empty-item"
      paddingTop={24}
      paddingLeft={16}
      paddingRight={16}
    />
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
