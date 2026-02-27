import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import { Pagination } from "../../../components/app/Pagination";
import SectionTitle from "../../../components/app/SectionTitle";
import SortDropdown from "../../../components/app/SortDropdown";
import { Book, Creator } from "../../../db/schema";

type Props = {
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: Book[];
    totalPages: number;
    page: number;
  };
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  title: string;
};

const BooksGrid = async ({
  result,
  user,
  currentPath,
  sortBy,
  title,
}: Props) => {
  const { books, totalPages, page } = result;
  const targetId = "books-grid";

  const baseUrlWithSort =
    sortBy !== "newest" ? `${currentPath}?sortBy=${sortBy}` : currentPath;

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  return (
    <>
      <div class="flex justify-between items-center">
        <SectionTitle>{title}</SectionTitle>
        <SortDropdown sortBy={sortBy} currentPath={currentPath} />
      </div>
      <GridPanel isFullWidth id={targetId} xMerge="append">
        {books.map((book) => (
          <BookCard book={book} user={user} showHeader />
        ))}
      </GridPanel>
      <Pagination
        baseUrl={baseUrlWithSort}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </>
  );
};

export default BooksGrid;
