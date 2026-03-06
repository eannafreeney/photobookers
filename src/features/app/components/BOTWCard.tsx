import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import Card from "../../../components/app/Card";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import CarouselMobile from "../../../components/app/CarouselMobile";
import Link from "../../../components/app/Link";
import ShareButton from "../../../components/app/ShareButton";
import { formatDate } from "../../../utils";
import WishlistButton from "../../api/components/WishlistButton";
import { BookOfTheWeekWithBook } from "../BOTWServices";

type Props = {
  isMobile: boolean;
  bookOfTheWeek: BookOfTheWeekWithBook;
  user: AuthUser | null;
  currentCreatorId?: string | null;
};

const BookOfTheWeekCard = ({
  isMobile,
  bookOfTheWeek,
  user,
  currentCreatorId,
}: Props) => {
  if (isMobile) {
    return (
      <BOTWMobileCard
        bookOfTheWeek={bookOfTheWeek}
        user={user}
        currentCreatorId={currentCreatorId}
      />
    );
  }

  return (
    <BOTWDesktopCard
      bookOfTheWeek={bookOfTheWeek}
      user={user}
      currentCreatorId={currentCreatorId}
    />
  );
};

export default BookOfTheWeekCard;

type CardProps = {
  bookOfTheWeek: BookOfTheWeekWithBook;
  user: AuthUser | null;
  currentCreatorId?: string | null;
};

const BOTWDesktopCard = ({
  bookOfTheWeek,
  currentCreatorId,
  user,
}: CardProps) => {
  const book = bookOfTheWeek?.book ?? null;

  if (!book || !book.coverUrl) return <></>;

  return (
    <Card className="col-span-6">
      <div class="flex gap-2">
        <div class="w-2/3 shrink-0">
          <CarouselMobile
            images={[
              book.coverUrl,
              ...(book?.images?.map((image) => image.imageUrl) ?? []),
            ]}
          />
        </div>
        <div class="w-1/3 min-w-0 flex flex-col gap-2 grow justify-between">
          <div class="flex items-center justify-start gap-2 p-4">
            <WishlistButton isCircleButton book={book} user={user} />
            <ShareButton isCircleButton />
          </div>
          <Card.Body gap="4">
            <div class="flex flex-col gap-2">
              <Card.Text>
                {bookOfTheWeek?.weekStart &&
                  formatDate(bookOfTheWeek.weekStart)}
              </Card.Text>
              <Link href={`/books/${book.slug}`}>
                <h3 class="text-balance text-2xl font-bold text-on-surface-strong">
                  {book.title}
                </h3>
              </Link>
            </div>
            <div class="flex flex-col gap-2">
              <CardCreatorCard creator={book.artist ?? null} />
              {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
                <CardCreatorCard creator={book.publisher ?? null} />
              )}
            </div>
            <Card.Intro>{bookOfTheWeek?.text}</Card.Intro>
            <Card.Tags tags={book.tags?.slice(0, 3) ?? []} />
            <Link href={`/books/${book.slug}`}>
              <Button variant="solid" color="primary" width="full">
                View Book
              </Button>
            </Link>
          </Card.Body>
        </div>
      </div>
    </Card>
  );
};

const BOTWMobileCard = ({
  bookOfTheWeek,
  currentCreatorId,
  user,
}: CardProps) => {
  const book = bookOfTheWeek?.book ?? null;
  if (!book || !book.coverUrl) return <></>;

  return (
    <Card className="w-full min-w-0">
      <CarouselMobile
        images={[
          book.coverUrl,
          ...(book?.images?.map((image) => image.imageUrl) ?? []),
        ]}
      />
      <Card.Body>
        <div class="flex items-start justify-between">
          <div>
            <Link href={`/books/${book.slug}`}>
              <Card.Title>{book.title}</Card.Title>
            </Link>
            <Card.Text>
              {bookOfTheWeek?.weekStart && formatDate(bookOfTheWeek.weekStart)}
            </Card.Text>
          </div>
          <div class="flex items-center gap-2">
            <WishlistButton isCircleButton book={book} user={user} />
            <ShareButton isCircleButton />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          {(!currentCreatorId || currentCreatorId !== book.artistId) && (
            <CardCreatorCard creator={book.artist} />
          )}
          {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
            <CardCreatorCard creator={book.publisher} />
          )}
        </div>
        <Card.Intro>{bookOfTheWeek?.text}</Card.Intro>
        <Card.Tags tags={book.tags?.slice(0, 3) ?? []} />
        <Link href={`/books/${book.slug}`}>
          <Button variant="solid" color="primary" width="full">
            View Book
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};
