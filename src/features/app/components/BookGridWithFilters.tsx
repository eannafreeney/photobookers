import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import { getFilteredBooks } from "../services";
import BookFilters from "./BookFilters";
import BooksGrid from "./BooksGrid";

type Props = {
  user: AuthUser | null;
  tag: string | null;
  q: string | null;
  currentPath: string;
  result: NonNullable<Awaited<ReturnType<typeof getFilteredBooks>>[1]>;
  isFiltered: boolean;
  isInfiniteScroll?: boolean;
  ajaxPath?: string;
  historyPath?: string | null;
  hasMore?: boolean;
  viewAllHref?: string;
};

const BooksGridWithFilters = ({
  user,
  tag,
  q,
  currentPath,
  result,
  isFiltered,
  isInfiniteScroll = true,
  ajaxPath = "/books",
  historyPath = "/books",
  hasMore = false,
  viewAllHref,
}: Props) => (
  <>
    <BookFilters
      activeTag={tag}
      q={q}
      ajaxPath={ajaxPath}
      historyPath={historyPath}
    />
    <BooksGrid
      isInfiniteScroll={isInfiniteScroll}
      isPaginated={isInfiniteScroll}
      user={user}
      currentPath={currentPath}
      result={result}
      noResultsMessage={isFiltered ? "No books match your filters." : undefined}
    />
    {hasMore || viewAllHref ? (
      <div class="mt-8 flex justify-center">
        <a href={viewAllHref}>
          <Button variant="solid" color="primary" width="xl">
            View All Books →
          </Button>
        </a>
      </div>
    ) : null}
  </>
);

export default BooksGridWithFilters;
