import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import { InfiniteScroll } from "../../../components/app/InfiniteScroll";
import { Pagination } from "../../../components/app/Pagination";
import SectionTitle from "../../../components/app/SectionTitle";
import { BookCardResult } from "../../../constants/queries";
import ListNavigation from "./ListNavigation";

type Props = {
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  title?: string;
  noResultsMessage?: string;
  currentCreatorId?: string | null;
  isFullWidth?: boolean;
  isInfiniteScroll?: boolean;
};

const BooksGrid = async ({
  isFullWidth,
  currentPath,
  result,
  user,
  title,
  noResultsMessage = "No books found",
  currentCreatorId,
  isInfiniteScroll = false,
}: Props) => {
  const { books, totalPages, page } = result;
  const targetId = "books-grid";

  return (
    <>
      <div x-data>
        <div x-ref="paginationContent">
          {title && <SectionTitle className="mb-4">{title}</SectionTitle>}
          {/* <SortDropdown sortBy={sortBy} currentPath={currentPath} /> */}
        </div>
        <GridPanel id={targetId} isFullWidth={isFullWidth}>
          {books?.length > 0 ? (
            books.map((book) => (
              <BookCard
                book={book}
                user={user}
                currentCreatorId={currentCreatorId}
              />
            ))
          ) : (
            <div class="col-span-full text-center text-sm text-on-surface-weak py-4">
              {noResultsMessage}
            </div>
          )}
        </GridPanel>
        <ListNavigation
          isInfiniteScroll={isInfiniteScroll}
          currentPath={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </>
  );
};

export default BooksGrid;
