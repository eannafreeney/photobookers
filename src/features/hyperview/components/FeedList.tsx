import { BookCardResult } from "../../../constants/queries";
import { Spinner, Style } from "../../../lib/hxml-comps";
import BookCard from "./BookCard";

export const FEATURED_FEED_LOAD_MORE_ID = "featured-feed-load-more";

type Props = {
  books: BookCardResult[];
  baseUrl: string;
  favoritesByBookId: Record<string, boolean>;
  page?: number;
  hasMore?: boolean;
  loadMoreHref?: string;
  loadMoreId?: string;
};

const FeedList = ({
  books,
  baseUrl,
  favoritesByBookId,
  page = 1,
  hasMore = false,
  loadMoreHref,
  loadMoreId = FEATURED_FEED_LOAD_MORE_ID,
}: Props) => (
  <>
    {books.map((book) => (
      <BookCard
        key={book.id}
        book={book}
        baseUrl={baseUrl}
        isFavorited={favoritesByBookId[book.id] ?? false}
      />
    ))}
    {hasMore && loadMoreHref ? (
      <view
        id={loadMoreId}
        style="featured-tab-spinner"
        trigger="visible"
        once="true"
        verb="get"
        href={`${loadMoreHref}?page=${page + 1}`}
        action="replace"
      >
        <Spinner />
      </view>
    ) : null}
  </>
);

export default FeedList;

export const feedListStyles = () => (
  <>
    <Style
      id="featured-tab-spinner"
      alignItems="center"
      justifyContent="center"
      paddingTop={16}
      paddingBottom={16}
    />
  </>
);
