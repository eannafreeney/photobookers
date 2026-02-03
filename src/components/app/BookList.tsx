import { Book } from "../../db/schema";
import SectionTitle from "./SectionTitle";
import GridPanel from "./GridPanel";
import Card from "./Card";
import { capitalize, formatDate } from "../../utils";
import Link from "./Link";
import Button from "./Button";
import CollectionButton from "./CollectionButton";
import WishlistButton from "./WishlistButton";
import { useUser } from "../../contexts/UserContext";

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
  const user = useUser();
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
        <div class="mt-auto flex items-center gap-2">
          <Link href={`/books/${book.slug}`} className="flex-1">
            <Button variant="solid" color="primary">
              <span>More</span>
            </Button>
          </Link>
          <WishlistButton
            isCircleButton
            book={book}
            user={user}     
          />
          <CollectionButton
            isCircleButton
            book={book}
            user={user}
          />
        </div>
      </Card.Body>
    </Card>
  );
};
