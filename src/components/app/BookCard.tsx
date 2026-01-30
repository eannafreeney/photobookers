import Avatar from "./Avatar";
import Card from "./Card";
import { Book, Creator } from "../../db/schema";
import { formatDate } from "../../utils";

type BookCardProps = {
  book: Book;
  artist: Creator;
};

const BookCard = ({ book, artist }: BookCardProps) => {
  return (
    <Card>
      <Card.Image
        src={book.coverUrl}
        alt={book.title}
        href={`/books/${book.slug}`}
      />
      <Card.Body>
        <div class="flex justify-between">
          <Card.Title href={`/books/${book.slug}`}>{book.title}</Card.Title>
        </div>
        <div class="flex items-center gap-2">
          <Avatar
            src={artist?.coverUrl ?? ""}
            alt={artist?.displayName ?? ""}
          />
          <Card.Link href={`/creators/${artist?.slug ?? ""}`}>
            {artist?.displayName ?? ""}
          </Card.Link>
        </div>
        <Card.Text>{book.intro}</Card.Text>
        <Card.Text>{formatDate(book.releaseDate ?? "")}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
