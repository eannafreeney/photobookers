import { Book } from "../../db/schema";
import { AuthUser } from "../../../types";
import BookCard from "./BookCard";
import GridPanel from "./GridPanel";
import { getBooksInWishlist } from "../../services/books";

type WishlistedBooksProps = {
  user: AuthUser;
};

const WishlistedBooks = async ({ user }: WishlistedBooksProps) => {
  const wishlistBooks = await getBooksInWishlist(user.id);

  if (!wishlistBooks || wishlistBooks?.length === 0) {
    return (
      <div
        id="empty-wishlist-books"
        class="flex flex-col gap-4 items-center justify-center"
      >
        Start adding books to your wishlist and collection to see them here.
      </div>
    );
  }

  const attrs = {
    "x-init": true,
    "x-on:wishlist:updated.window":
      "$ajax('/api/wishlist-books', { target: ['wishlist-books-grid', 'empty-wishlist-books'], sync: true })",
  };

  return (
    <GridPanel id="wishlist-books-grid" isFullWidth {...attrs}>
      {wishlistBooks?.map((book) => (
        <BookCard book={book} user={user} />
      ))}
    </GridPanel>
  );
};
export default WishlistedBooks;
