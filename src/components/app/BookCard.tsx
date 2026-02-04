import Avatar from "./Avatar";
import Card from "./Card";
import { Book, Creator } from "../../db/schema";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import WishlistButton from "./WishlistButton";
import Link from "./Link";
import { AuthUser } from "../../../types";

type BookCardProps = {
  book: Book;
  user: AuthUser;
  creatorType?: "publisher" | "artist";
};

const BookCard = ({ book, user, creatorType }: BookCardProps) => {
  return (
    <Card>
      <Card.Header>
        <CardCreatorCard book={book} creatorType={creatorType} />
        <WishlistButton
          isCircleButton
          book={book}
          user={user}     
        />
      </Card.Header>
      <Link href={`/books/${book.slug}`}>
        <Card.Image src={book.coverUrl ?? ""} alt={book.title} href={`/books/${book.slug}`} />
      </Link>
      <Card.Body>
        <div>
          <Link href={`/books/${book.slug}`}>
            <Card.Title>{book.title}</Card.Title>
          </Link>
            <Card.Text>
            {book.releaseDate && formatDate(book.releaseDate)}
            </Card.Text>   
          </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
