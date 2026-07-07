import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import ScrollReveal from "../../../components/app/ScrollReveal";
import { BookCardResult } from "../../../constants/queries";
import { BOOKS_LIST_TARGET_ID } from "./BookFilters";
import ListNavigation from "./ListNavigation";

type Props = {
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  noResultsMessage?: string;
  currentCreatorId?: string | null;
  isFullWidth?: boolean;
  isMobile?: boolean;
  isPaginated?: boolean;
  isInfiniteScroll?: boolean;
};

const BooksGrid = async ({
  currentPath,
  result,
  user,
  noResultsMessage = "No books found",
  currentCreatorId,
  isMobile = false,
  isPaginated = true,
  isInfiniteScroll = false,
}: Props) => {
  const { books, totalPages, page } = result;
  const targetId = "books-grid";
  const gridMerge = isMobile || isInfiniteScroll ? "append" : "replace";

  return (
    <div id={BOOKS_LIST_TARGET_ID}>
      <GridPanel
        id={targetId}
        xMerge={gridMerge}
        data-nav={isMobile || isInfiniteScroll ? "infinite" : "pagination"}
      >
        {books?.length > 0 ? (
          books.map((book) => (
            <ScrollReveal>
              <BookCard
                book={book}
                user={user}
                currentCreatorId={currentCreatorId}
              />
            </ScrollReveal>
          ))
        ) : (
          <div class="col-span-full text-center text-sm text-on-surface py-4">
            {noResultsMessage}
          </div>
        )}
      </GridPanel>
      {isPaginated && (
        <ListNavigation
          isInfiniteScroll={isMobile || isInfiniteScroll}
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      )}
    </div>
  );
};

export default BooksGrid;
