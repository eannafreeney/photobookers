import { Book } from "../../db/schema";
import { AuthUser } from "../../../types";
import BookCard from "./BookCard";
import GridPanel from "./GridPanel";
import { getBooksInWishlist } from "../../services/books";
import ErrorPage from "../../pages/error/errorPage";
import { Pagination } from "./Pagination";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
};

const WishlistedBooks = async ({ user, currentPage, currentPath }: Props) => {
  const result = await getBooksInWishlist(user.id, currentPage);

  if (!result?.books) {
    return <ErrorPage errorMessage="No wishlisted books found" user={user} />;
  }

  const { books, totalPages, page } = result;

  const attrs = {
    "x-init": true,
    "x-on:wishlist:updated.window":
      "$ajax('/api/wishlist-books', { target: 'wishlist-books-container', sync: true })",
  };

  return (
    <div id="wishlist-books-container" x-merge="replace" {...attrs}>
      <div>
        {(!books || books?.length === 0) && (
          <div>
            Start adding books to your wishlist and collection to see them here.
          </div>
        )}
      </div>
      <GridPanel id="wishlist-books-grid" isFullWidth xMerge="append">
        {books?.map((book) => (
          <BookCard book={book} user={user} />
        ))}
      </GridPanel>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId="wishlist-books-grid"
      />
    </div>
  );
};
export default WishlistedBooks;
