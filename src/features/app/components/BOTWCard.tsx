import { AuthUser } from "../../../../types";
import Button from "../../../components/app/Button";
import Card from "../../../components/app/Card";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import CarouselMobile from "../../../components/app/CarouselMobile";
import Link from "../../../components/app/Link";
import ShareButton from "../../api/components/ShareButton";
import TagList from "../../../components/app/TagList";
import { formatDate } from "../../../utils";
import CollectButton from "../../api/components/CollectButton";
import WishlistButton from "../../api/components/WishlistButton";
import { BookOfTheWeekWithBook } from "../BOTWServices";
import LikeButton from "../../api/components/LikeButton";

type Props = {
  isMobile: boolean;
  bookOfTheWeek: BookOfTheWeekWithBook;
  user: AuthUser | null;
};

const BookOfTheWeekCard = ({ isMobile, bookOfTheWeek, user }: Props) => {
  const images = [
    bookOfTheWeek?.book?.coverUrl,
    ...(bookOfTheWeek?.book?.images?.map((image) => image.imageUrl) ?? []),
  ].filter((url): url is string => Boolean(url));

  if (isMobile) {
    return (
      <BOTWMobileCard
        bookOfTheWeek={bookOfTheWeek}
        user={user}
        images={images}
      />
    );
  }

  return (
    <BOTWDesktopCard
      bookOfTheWeek={bookOfTheWeek}
      user={user}
      images={images}
    />
  );
};

export default BookOfTheWeekCard;

type CardProps = {
  bookOfTheWeek: BookOfTheWeekWithBook;
  user: AuthUser | null;
  images: string[];
};

const BOTWDesktopCard = ({ bookOfTheWeek, user, images }: CardProps) => {
  const book = bookOfTheWeek?.book ?? null;

  if (!book) return <></>;

  return (
    <Card className="col-span-6">
      <div class="flex gap-2">
        <div class="w-2/3 shrink-0">
          <a href={`/books/${book.slug}`}>
            <CarouselMobile images={[images[0]]} showIndicators={false} />
          </a>
        </div>
        <div class="w-1/3 min-w-0 flex flex-col gap-2 grow justify-between">
          <div class="flex items-center justify-end gap-2 p-4">
            <LikeButton isCircleButton book={book} user={user} />
            <CollectButton isCircleButton book={book} user={user} />
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
            <CardCreatorCard creator={book.artist ?? null} />
            <Card.Intro>{bookOfTheWeek?.text}</Card.Intro>
            <TagList tags={book.tags?.slice(0, 3) ?? []} />
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

const BOTWMobileCard = ({ bookOfTheWeek, user, images }: CardProps) => {
  const book = bookOfTheWeek?.book ?? null;
  if (!book) return <></>;

  return (
    <Card className="w-full min-w-0">
      <div class="p-2 flex items-center justify-between h-10">
        <CardCreatorCard
          creator={book.artist ?? null}
          maxDisplayNameLength={20}
        />
        <Card.Text>
          {bookOfTheWeek?.weekStart && formatDate(bookOfTheWeek.weekStart)}
        </Card.Text>
      </div>
      <a href={`/books/${book.slug}`}>
        <CarouselMobile images={[images[0]]} showIndicators={false} />
      </a>
      <Card.Body gap="4">
        <div class="flex items-start justify-between">
          <div>
            <Link href={`/books/${book.slug}`}>
              <Card.Title>{book.title}</Card.Title>
            </Link>
          </div>
          <div class="flex items-center gap-2">
            <LikeButton isCircleButton book={book} user={user} />
            <CollectButton isCircleButton book={book} user={user} />
            <WishlistButton isCircleButton book={book} user={user} />
            <ShareButton isCircleButton />
          </div>
        </div>
        <Card.Intro>{bookOfTheWeek?.text}</Card.Intro>
        <TagList tags={book.tags?.slice(0, 3) ?? []} />
        <Link href={`/books/${book.slug}`}>
          <Button variant="solid" color="primary" width="full">
            View Book
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};
