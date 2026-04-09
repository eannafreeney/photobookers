import BooksGrid from "./BooksGrid";
import { getBooksByCreatorId } from "../../dashboard/admin/creators/services";
import { Creator } from "../../../db/schema";
import { AuthUser } from "../../../../types";

type Props = {
  bookSlug: string;
  currentPage: number;
  creator: Creator | null;
  currentPath: string;
  user: AuthUser;
};

const BookGridWrapper = async ({
  creator,
  bookSlug,
  currentPage,
  currentPath,
  user,
}: Props) => {
  if (!creator) return <></>;

  const [booksError, booksData] = await getBooksByCreatorId(
    creator.id,
    currentPage,
  );

  if (booksError || !booksData) return <></>;

  const result = {
    ...booksData,
    books: booksData.books.filter((b) => b.slug !== bookSlug),
  };

  if (result.books.length === 0) return <></>;

  return (
    <BooksGrid
      title={`Other Books by ${creator?.displayName}`}
      user={user}
      currentPath={currentPath}
      result={result}
    />
  );
};

export default BookGridWrapper;
