import { AuthUser } from "../../../../../types";
import { Creator } from "../../../../db/schema";
import { getBooksByCreatorId } from "../services";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop";
import BooksOverviewMobile from "../components/BooksOverviewMobile";

type BookTableProps = {
  searchQuery?: string;
  creator: Creator;
  user: AuthUser | null;
  isMobile: boolean;
  currentPage: number;
  title?: string;
};

export const BooksOverviewTable = async ({
  searchQuery,
  creator,
  user,
  isMobile,
  currentPage,
  title,
}: BookTableProps) => {
  if (!user || !creator) return <></>;

  const result = await getBooksByCreatorId(
    creator.id,
    creator.type,
    currentPage,
    searchQuery,
  );

  if (!result || !result.books || result.books.length === 0)
    return <p>No Books Found</p>;

  const { books, totalPages, page } = result;

  console.log("books", books);

  if (isMobile) {
    return <BooksOverviewMobile books={books} user={user} title={title} />;
  }

  return <BooksOverviewDesktop books={books} user={user} title={title} />;
};
