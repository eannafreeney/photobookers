import clsx from "clsx";
import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import Link from "./Link";
import { AuthUser } from "../../../types";
import { BookCardResult } from "../../constants/queries";
import Show from "./Show";
import LikeButton from "../../features/api/components/LikeButton";
import WishlistButton from "../../features/api/components/FavouriteButton";

type BookCardProps = {
  banner?: string;
  book: BookCardResult;
  user: AuthUser | null;
  currentCreatorId?: string | null;
  maxDisplayNameLength?: number;
  className?: string;
  featureDate?: Date;
};

const BookCard = ({
  banner,
  book,
  user,
  currentCreatorId,
  maxDisplayNameLength = 16,
  className,
  featureDate,
}: BookCardProps) => {
  const displayDate = featureDate ?? book.releaseDate;
  return (
    <Card className={clsx(className ?? "min-w-[200px] max-w-[24rem]")}>
      <Show when={currentCreatorId !== book.artist?.id}>
        <div class="px-3 py-2 flex items-center justify-between gap-2 h-10">
          <div class="min-w-0 flex-1">
            <CardCreatorCard
              banner={banner}
              creator={book.artist ?? null}
              maxDisplayNameLength={
                book.releaseDate ? maxDisplayNameLength : 30
              }
            />
          </div>
          {displayDate ? (
            <span class="kicker text-on-surface-weak whitespace-nowrap text-[10px]">
              {formatDate(displayDate)}
            </span>
          ) : null}
        </div>
      </Show>
      <Card.Image
        src={book.coverUrl ?? ""}
        alt={book.title}
        href={`/books/${book.slug}`}
      />
      <Card.Body>
        <div class="flex items-start justify-between">
          <div class="flex flex-col gap-0 mr-4">
            <Link href={`/books/${book.slug}`}>
              <Card.Title>{book.title}</Card.Title>
            </Link>
            <Show
              when={!!book.publisher && currentCreatorId !== book.publisher?.id}
            >
              <p class="kicker text-on-surface-weak mt-1">
                {book.publisher?.displayName ?? ""}
              </p>
            </Show>
          </div>
          <WishlistButton isCircleButton book={book} user={user} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default BookCard;
