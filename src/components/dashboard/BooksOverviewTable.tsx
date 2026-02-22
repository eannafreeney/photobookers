import { AuthUser } from "../../../types";
import { Creator } from "../../db/schema";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../services/books";
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
  const getBooksFn = {
    artist: getBooksByArtistId,
    publisher: getBooksByPublisherId,
  };

  const books = await getBooksFn[creator.type](creator.id, searchQuery);

  const validBooks = books?.filter((book) => book != null);

  if (isMobile) {
    return <BooksOverviewMobile books={validBooks} user={user} />;
  }

  return <BooksOverviewDesktop books={validBooks} user={user} />;
};
