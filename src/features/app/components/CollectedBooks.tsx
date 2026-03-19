import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import { getBooksInCollection } from "../services";
import ErrorPage from "../../../pages/error/errorPage";
import { Pagination } from "../../../components/app/Pagination";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
};

const CollectedBooks = async ({ user, currentPage, currentPath }: Props) => {
  const result = await getBooksInCollection(user.id, currentPage);

  if (!result?.books) {
    return <ErrorPage errorMessage="No collected books found" user={user} />;
  }

  const targetId = "collection-books-grid";

  const { books, totalPages, page } = result;

  const attrs = {
    "x-init": true,
    "x-on:collection:updated.window":
      "$ajax('/collection-books', { target: 'collection-books-container', sync: true })",
  };

  return (
    <div x-data>
      <div
        id="collection-books-container"
        x-merge="replace"
        {...attrs}
        x-ref="paginationContent"
      >
        <div>
          {(!books || books?.length === 0) && (
            <div>
              Start adding books to your wishlist and collection to see them
              here.
            </div>
          )}
        </div>
        <GridPanel id={targetId} xMerge="append">
          {books?.map((book) => (
            <BookCard book={book} user={user} />
          ))}
        </GridPanel>
        <Pagination
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </div>
  );
};
export default CollectedBooks;
