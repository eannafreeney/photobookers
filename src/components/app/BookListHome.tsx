import { Book, Creator } from "../../db/schema";
import Card from "./Card";
import { getBooks } from "../../services/books";
import GridPanel from "./GridPanel";
import SectionTitle from "./SectionTitle";
import Avatar from "./Avatar";
import { formatDate } from "../../utils";

const BookCardList = ({ title, books }: { title: string; books: Book[] }) => {
  if (!books) {
    return <div>No books found</div>;
  }
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <GridPanel>
        {books.map((book: Book) => (
          <BookCard book={book} artist={book.artist} />
        ))}
      </GridPanel>
    </>
  );
};

export default BookCardList;

type BookCardProps = {
  book: Book;
  artist: Creator;
};

const BookCard = ({ book, artist }: BookCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm p-2">
      <Card.Image
        src={book.coverUrl}
        alt={book.title}
        href={`/books/${book.slug}`}
      />
      <Card.Body>
        <Card.Title href={`/books/${book.slug}`}>{book.title}</Card.Title>
        <div class="flex items-center gap-2">
          <Avatar src={artist.coverUrl ?? ""} alt={artist.displayName ?? ""} />
          <Card.Link href={`/creators/${artist?.slug}`}>
            {artist?.displayName}
          </Card.Link>
        </div>
        <Card.Text>
          <span class="text-gray-500 text-sm italic">
            {book.releaseDate ? formatDate(book.releaseDate) : ""}
          </span>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};
