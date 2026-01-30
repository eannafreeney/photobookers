import { Book } from "../../db/schema";
import SectionTitle from "./SectionTitle";
import GridPanel from "./GridPanel";
import Card from "./Card";
import { capitalize, formatDate } from "../../utils";
import Link from "./Link";
import Button from "./Button";

type BookListProps = {
  books: Book[];
};

const BookList = ({ books }: BookListProps) => {
  if (books?.length === 0) {
    return <></>;
  }

  return (
    <div id="books">
      <SectionTitle>Books</SectionTitle>
      <GridPanel>
        {books.map((book: Book) => (
          <BookCard book={book} />
        ))}
      </GridPanel>
    </div>
  );
};

export default BookList;

type BookCardProps = {
  book: Book;
};

const BookCard = ({ book }: BookCardProps) => {
  return (
    <Card>
      <Card.Image
        src={book.coverUrl ?? ""}
        alt={book.title}
        href={`/books/${book.slug}`}
      />
      <Card.Body>
        <div>
          <Card.Title>{book.title}</Card.Title>
          <Card.SubTitle>
            {book.releaseDate
              ? formatDate(new Date(book.releaseDate ?? "").toISOString())
              : ""}
          </Card.SubTitle>
        </div>
        <Card.Tags tags={book.tags ?? []} />
        <Link href={`/books/${book.slug}`}>
          <Button variant="solid" color="primary">
            <span>More Info</span>
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};
