import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import WishlistButton from "../../features/api/components/WishlistButton";
import Link from "./Link";
import { AuthUser } from "../../../types";
import { BookCardResult } from "../../constants/queries";
import Show from "./Show";

type BookCardProps = {
  book: BookCardResult;
  user: AuthUser | null;
  currentCreatorId?: string | null;
};

const BookCard = ({ book, user, currentCreatorId }: BookCardProps) => {
  return (
    <Card className="min-w-[200px] max-w-[24rem]">
      <Show when={currentCreatorId !== book.artist?.id}>
        <div class="p-2 flex items-center justify-between h-10">
          <CardCreatorCard
            creator={book.artist ?? null}
            maxDisplayNameLength={16}
          />
          <Card.Text>
            {book.releaseDate && formatDate(book.releaseDate)}
          </Card.Text>
        </div>
      </Show>
      <Card.Image
        src={book.coverUrl ?? ""}
        alt={book.title}
        href={`/books/${book.slug}`}
      />
      <Card.Body>
        <div class="flex items-center justify-between">
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
