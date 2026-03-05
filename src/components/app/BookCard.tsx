import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import WishlistButton from "../../features/api/components/WishlistButton";
import Link from "./Link";
import { AuthUser } from "../../../types";
import ShareButton from "./ShareButton";
import { BookCardResult } from "../../constants/queries";

type BookCardProps = {
  book: BookCardResult;
  user: AuthUser | null;
  showHeader?: boolean;
  currentCreatorId?: string;
  className?: string;
};

const BookCard = ({
  book,
  user,
  showHeader = false,
  currentCreatorId,
  className,
}: BookCardProps) => {
  return (
    <Card className={className}>
      <Link href={`/books/${book.slug}`}>
        <Card.Image
          src={book.coverUrl ?? ""}
          alt={book.title}
          href={`/books/${book.slug}`}
        />
      </Link>
      <Card.Body>
        <div class="flex items-start justify-between">
          <div>
            <Link href={`/books/${book.slug}`}>
              <Card.Title>{book.title}</Card.Title>
            </Link>
            {!showHeader && (
              <Card.Text>
                {book.releaseDate && formatDate(book.releaseDate)}
              </Card.Text>
            )}
          </div>
          <div class="flex items-center gap-2">
            <WishlistButton isCircleButton book={book} user={user} />
            <ShareButton isCircleButton />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <CardCreatorCard creator={book.artist ?? null} />
          {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
            <CardCreatorCard creator={book.publisher ?? null} />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
