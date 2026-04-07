import Badge from "../../../../../components/app/Badge";
import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import FormPost from "../../../../../components/forms/FormPost";
import { BookOfTheWeek } from "../../../../../db/schema";
import { toWeekString } from "../../../../../lib/utils";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import DeleteButton from "./DeleteButton";
import ScheduleButton from "./ScheduleButton";
import SendBOTWCreatorEmailButton from "./SendBOTWCreatorEmailButton";

type BookOfTheWeekProps = {
  weekStart: Date;
  bookOfTheWeek: BookOfTheWeekWithBook | null;
};

const BookOfTheWeek = ({ weekStart, bookOfTheWeek }: BookOfTheWeekProps) => {
  const weekKey = toWeekString(weekStart);

  return bookOfTheWeek?.book ? (
    <BOTWCardContent weekKey={weekKey} bookOfTheWeek={bookOfTheWeek} />
  ) : (
    <ScheduleButton
      href={`/dashboard/admin/planner/book-of-the-week/${weekKey}/create`}
      text="Schedule Book of the Week"
    />
  );
};

export default BookOfTheWeek;

type BOTWCardContentProps = {
  weekKey: string;
  bookOfTheWeek: BookOfTheWeekWithBook;
};

const BOTWCardContent = ({ weekKey, bookOfTheWeek }: BOTWCardContentProps) => {
  const book = bookOfTheWeek?.book ?? null;
  if (!book) return <></>;
  return (
    <>
      <div class="flex items-start justify-between gap-3">
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt={book.title}
            class="h-16 w-12 rounded object-cover"
          />
        )}
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-on-surface-strong line-clamp-2">
            {book.title}
          </p>
          {book.artist && (
            <Link href={`/creators/${book.artist.slug}`}>
              <p class="text-xs text-on-surface truncate">
                {book.artist.displayName}
              </p>
            </Link>
          )}
          {book.publisher && (
            <Link href={`/creators/${book.publisher.slug}`}>
              <p class="text-xs text-on-surface truncate">
                {book.publisher.displayName}
              </p>
            </Link>
          )}
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/book-of-the-week/${weekKey}`}
        />
      </div>
      <div class="mt-2 flex items-center gap-2">
        <SendBOTWCreatorEmailButton
          recipientType="artist"
          bookOfTheWeek={bookOfTheWeek}
          creatorId={book.artist?.id}
          bookId={book.id}
        />
        {book.publisher && (
          <SendBOTWCreatorEmailButton
            recipientType="publisher"
            bookOfTheWeek={bookOfTheWeek}
            creatorId={book.publisher?.id}
            bookId={book.id}
          />
        )}
      </div>
    </>
  );
};
