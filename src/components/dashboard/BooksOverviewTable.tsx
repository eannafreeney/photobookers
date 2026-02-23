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
};

export const BooksOverviewTable = async ({
  searchQuery,
  creator,
  user,
  isMobile,
}: BookTableProps) => {
  const books = await getBooksByCreatorId(
    creator.id,
    creator.type,
    searchQuery,
  );

  const validBooks = books?.filter((book) => book != null);

  if (isMobile) {
    return <BooksOverviewMobile books={validBooks} user={user} />;
  }

  return <BooksOverviewDesktop books={validBooks} user={user} />;
};
