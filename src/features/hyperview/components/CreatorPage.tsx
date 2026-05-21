import { BookCardResult } from "../../../constants/queries";
import { Creator } from "../../../db/schema";
import { Spinner, Style } from "../../../lib/hxml-comps";
import BookCard from "./BookCard";

export const CREATOR_BOOKS_LOAD_MORE_ID = "creator-books-load-more";

type Props = {
  books: BookCardResult[];
  creator: Creator | null;
  baseUrl: string;
  favoritesByBookId: Record<string, boolean>;
  page?: number;
  hasMore?: boolean;
  loadMoreHref?: string;
};

const CreatorPage = ({
  books,
  creator,
  baseUrl,
  favoritesByBookId,
  page = 1,
  hasMore = false,
  loadMoreHref,
}: Props) => {
  return (
    <view xmlns="https://hyperview.org/hyperview">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          baseUrl={baseUrl}
          currentCreatorId={creator?.id}
          isFavorited={favoritesByBookId[book.id] ?? false}
        />
      ))}
      {hasMore && loadMoreHref ? (
        <view
          id={CREATOR_BOOKS_LOAD_MORE_ID}
          style="creator-books-spinner"
          trigger="visible"
          once="true"
          verb="get"
          href={`${loadMoreHref}?page=${page + 1}`}
          action="replace"
        >
          <Spinner />
        </view>
      ) : null}
    </view>
  );
};

export default CreatorPage;

export const creatorPageStyles = () => (
  <>
    <Style
      id="creator-books-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
