import { AuthUser } from "../../../types";
import ErrorPage from "../../pages/error/errorPage";
import { getFeedBooks } from "../../services/books";
import BookCard from "./BookCard";
import GridPanel from "./GridPanel";
import { Pagination } from "./Pagination";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
};

const BooksByFollowee = async ({ user, currentPage, currentPath }: Props) => {
  const result = await getFeedBooks(user.id, currentPage);

  if (!result?.books) {
    return (
      <ErrorPage errorMessage="No books found by your followees" user={user} />
    );
  }

  const { books, totalPages, page } = result;

  return (
    <>
      {(!books || books?.length === 0) && (
        <div>
          Start following artists and publishers to see their latest releases
          here.
        </div>
      )}
      <GridPanel id="followee-books-grid" isFullWidth xMerge="append">
        {books?.map((book) => (
          <BookCard book={book} user={user} />
        ))}
      </GridPanel>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId="followee-books-grid"
      />
    </>
  );
};
export default BooksByFollowee;
