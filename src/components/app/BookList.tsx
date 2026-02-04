import { Book } from "../../db/schema";
import SectionTitle from "./SectionTitle";
import GridPanel from "./GridPanel";
import BookCard from "./BookCard";
import { AuthUser } from "../../../types";

type BookListProps = {
  books: Book[];
  creatorType: "publisher" | "artist";
  user: AuthUser;
};

const BookList = ({ books, creatorType, user }: BookListProps) => {
  if (books?.length === 0) {
    return <></>;
  }

  return (
    <div id="books">
      <SectionTitle>Books</SectionTitle>
      <GridPanel>
        {books.map((book: Book) => (
          <BookCard book={book} creatorType={creatorType} user={user} />
        ))}
      </GridPanel>
    </div>
  );
};

export default BookList;

