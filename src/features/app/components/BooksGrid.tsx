import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import PageTitle from "../../../components/app/PageTitle";
import { loadingIcon, Pagination } from "../../../components/app/Pagination";
import SectionTitle from "../../../components/app/SectionTitle";
import SortDropdown from "../../../components/app/SortDropdown";
import { Creator } from "../../../db/schema";
import { BookCardResult } from "../../../constants/queries";

type Props = {
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  title?: string;
  creator?: Creator;
  isFullWidth?: boolean;
  noResultsMessage?: string;
  isMobile?: boolean;
  showHeader?: boolean;
  showSortDropdown?: boolean;
};

const BooksGrid = async ({
  result,
  user,
  currentPath,
  sortBy,
  title,
  creator,
  isFullWidth = false,
  noResultsMessage = "No books found",
  isMobile = false,
  showHeader = false,
  showSortDropdown = true,
}: Props) => {
  const { books, totalPages, page } = result;
  const targetId = "books-grid";

  const baseUrlWithSort =
    sortBy !== "newest" ? `${currentPath}?sortBy=${sortBy}` : currentPath;

  return (
    <>
      <div x-data>
        <div
          x-ref="paginationContent"
          class={`flex items-center gap-2 mb-4 ${title || !isMobile ? "justify-between" : "justify-center"}`}
        >
          {title && <SectionTitle>{title}</SectionTitle>}
          {creator && <PageTitle creator={creator} user={user} />}
          {showSortDropdown && (
            <SortDropdown sortBy={sortBy} currentPath={currentPath} />
          )}
        </div>
        <GridPanel id={targetId} isFullWidth={isFullWidth}>
          {books?.length > 0 ? (
            books.map((book) => (
              <BookCard
                book={book}
                user={user}
                currentCreatorId={creator?.id}
                showPublisherInsteadOfArtist={creator?.type === "artist"}
                showHeader={showHeader}
              />
            ))
          ) : (
            <div class="col-span-full text-center text-sm text-on-surface-weak py-4">
              {noResultsMessage}
            </div>
          )}
        </GridPanel>
        <Pagination
          baseUrl={baseUrlWithSort}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </>
  );
};

export default BooksGrid;
