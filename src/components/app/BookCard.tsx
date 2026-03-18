import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import WishlistButton from "../../features/api/components/WishlistButton";
import Link from "./Link";
import { AuthUser } from "../../../types";
import { BookCardResult } from "../../constants/queries";

type BookCardProps = {
  book: BookCardResult;
  user: AuthUser | null;
  className?: string;
  currentCreatorId?: string | null;
};

const BookCard = ({
  book,
  user,
  className,
  currentCreatorId,
}: BookCardProps) => {
  return (
    <Card className={className}>
      {currentCreatorId !== book.artist?.id && (
        <div class="px-2 py-2 flex items-center justify-between">
          <CardCreatorCard
            creator={book.artist ?? null}
            maxDisplayNameLength={20}
          />
          <Card.Text>
            {book.releaseDate && formatDate(book.releaseDate)}
          </Card.Text>
        </div>
      )}
      <Link href={`/books/${book.slug}`}>
        <Card.Image
          src={book.coverUrl ?? ""}
          alt={book.title}
          href={`/books/${book.slug}`}
          height="300px"
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
