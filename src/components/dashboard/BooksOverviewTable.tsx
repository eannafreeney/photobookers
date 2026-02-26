import { AuthUser } from "../../../types";
import { Creator } from "../../db/schema";
import { getBooksByCreatorId } from "../../services/books";
import BooksOverviewDesktop from "./BooksOverviewDesktop";
import BooksOverviewMobile from "./BooksOverviewMobile";

type BookTableProps = {
  searchQuery?: string;
  creator: Creator;
  user: AuthUser | null;
  isMobile: boolean;
  currentPage: number;
};

export const BooksOverviewTable = async ({
  searchQuery,
  creator,
  user,
  isMobile,
  currentPage,
}: BookTableProps) => {
  const result = await getBooksByCreatorId(
    creator.id,
    creator.type,
    currentPage,
    searchQuery,
  );

  const validBooks = result?.books?.filter((book) => book != null);

  if (isMobile) {
    return <BooksOverviewMobile books={validBooks} user={user} />;
  }

  return <BooksOverviewDesktop books={validBooks} user={user} />;
};
