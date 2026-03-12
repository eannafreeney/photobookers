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
  showHeader?: boolean;
};

const BookCard = ({
  book,
  user,
  currentCreatorId,
  className,
  showPublisherInsteadOfArtist = false,
  showHeader = false,
}: BookCardProps) => {
  return (
    <Card className={className}>
      {showHeader && <CardHeader showPublisherInsteadOfArtist book={book} />}
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
            <Card.Text>
              {book.releaseDate && formatDate(book.releaseDate)}
            </Card.Text>
          </div>
          <div class="flex items-center gap-2">
            <CollectButton isCircleButton book={book} user={user} />
            <WishlistButton isCircleButton book={book} user={user} />
            <ShareButton isCircleButton />
          </div>
        </div>
        <BookCreators
          book={book}
          currentCreatorId={currentCreatorId}
          showPublisherInsteadOfArtist={showPublisherInsteadOfArtist}
        />
      </Card.Body>
    </Card>
  );
};

export default BookCard;

type HeaderProps = {
  showPublisherInsteadOfArtist: boolean;
  book: BookCardResult;
};
const CardHeader = ({ showPublisherInsteadOfArtist, book }: HeaderProps) => {
  const creator = showPublisherInsteadOfArtist ? book.publisher : book.artist;

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <CardCreatorCard creator={creator ?? null} avatarSize="xs" />
      <Card.SubTitle>released a new book</Card.SubTitle>
    </div>
  );
};
