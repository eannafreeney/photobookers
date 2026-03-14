import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import WishlistButton from "../../features/api/components/WishlistButton";
import Link from "./Link";
import { AuthUser } from "../../../types";
import ShareButton from "./ShareButton";
import { BookCardResult } from "../../constants/queries";
import CollectButton from "../../features/api/components/CollectButton";
import BookCreators from "./BookCreators";

type BookCardProps = {
  book: BookCardResult;
  user: AuthUser | null;
  currentCreatorId?: string;
  className?: string;
  showPublisherInsteadOfArtist?: boolean;
};

const BookCard = ({
  book,
  user,
  currentCreatorId,
  className,
  showPublisherInsteadOfArtist = false,
}: BookCardProps) => {
  return (
    <Card className={className}>
      <div class="px-2 py-2 flex items-center justify-between">
        <BookCreators
          book={book}
          currentCreatorId={currentCreatorId}
          showPublisherInsteadOfArtist={showPublisherInsteadOfArtist}
        />
        <Card.Text>
          {book.releaseDate && formatDate(book.releaseDate)}
        </Card.Text>
      </div>
      <Link href={`/books/${book.slug}`}>
        <Card.Image
          src={book.coverUrl ?? ""}
          alt={book.title}
          href={`/books/${book.slug}`}
        />
      </Link>
      <Card.Body>
        <div class="flex items-start justify-between">
          <Link href={`/books/${book.slug}`}>
            <Card.Title>{book.title}</Card.Title>
          </Link>
          <WishlistButton isCircleButton book={book} user={user} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
