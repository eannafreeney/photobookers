import BookCard from "../../../components/app/BookCard";
import { BookCardResult } from "../../../constants/queries";
import { AuthUser } from "../../../../types";

type Props = {
  books: BookCardResult[];
  user: AuthUser | null;
};

const BooksSlider = ({ books, user }: Props) => (
  <div class="overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div class="flex w-max items-start gap-4 pr-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          user={user}
          className="w-[280px] shrink-0"
        />
      ))}
    </div>
  </div>
);

export default BooksSlider;
