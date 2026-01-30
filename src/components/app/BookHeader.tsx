import { Book, Creator } from "../../db/schema";
import Avatar from "./Avatar";
import Card from "./Card";

type BookHeaderProps = {
  book: Book;
  artist: Creator;
};

const BookHeader = ({ book, artist }: BookHeaderProps) => {
  return (
    <div>
      <Card.Title href={`/books/${book.slug}`}>{book.title}</Card.Title>
      <div class="flex items-center gap-1">
        <Avatar src={artist?.coverUrl ?? ""} alt={artist?.displayName ?? ""} />
        <Card.Link href={`/creators/${artist?.slug}`}>
          {artist?.displayName}
        </Card.Link>
      </div>
    </div>
  );
};
export default BookHeader;
