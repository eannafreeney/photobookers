import Link from "../../../../../components/app/Link";
import { toDateString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { formatDayWeekday } from "../utils";
import DeleteButton from "./DeleteButton";
import ScheduleButton from "./ScheduleButton";
import CreatorEmailBadge from "./CreatorEmailBadge";
import BotdEmailStatusBadges from "./BotdEmailStatusBadges";

type BOTDCardProps = {
  date: Date;
  bookOfTheDay: BookOfTheDayWithBook | null;
};

const BOTDCard = ({ date, bookOfTheDay }: BOTDCardProps) => {
  const dateKey = toDateString(date);
  const dayLabel = formatDayWeekday(date);

  return (
    <div class="border-t border-outline pt-3">
      <p class="text-xs font-medium text-on-surface mb-2">
        {dayLabel} {date.getUTCDate()}
      </p>
      {bookOfTheDay?.book ? (
        <BOTDCardContent dateKey={dateKey} bookOfTheDay={bookOfTheDay} />
      ) : (
        <ScheduleButton
          href={`/dashboard/admin/planner/book-of-the-day/${dateKey}/create`}
          text="Schedule Book of the Day"
        />
      )}
    </div>
  );
};

export default BOTDCard;

type BOTDCardContentProps = {
  dateKey: string;
  bookOfTheDay: BookOfTheDayWithBook;
};

const BOTDCardContent = ({ dateKey, bookOfTheDay }: BOTDCardContentProps) => {
  const book = bookOfTheDay?.book ?? null;
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
          <div class="flex flex-col gap-1">
            {book.artist && (
              <div class="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/creators/${book.artist.slug}`}
                  className="min-w-0"
                >
                  <p class="text-xs text-on-surface truncate">
                    {book.artist.displayName}
                  </p>
                </Link>
                <CreatorEmailBadge
                  creatorId={book.artist.id}
                  email={book.artist.email}
                />
              </div>
            )}
            {book.publisher && (
              <div class="flex items-center gap-1.5 min-w-0">
                <Link
                  href={`/creators/${book.publisher.slug}`}
                  className="min-w-0"
                >
                  <p class="text-xs text-on-surface truncate">
                    {book.publisher.displayName}
                  </p>
                </Link>
                <CreatorEmailBadge
                  creatorId={book.publisher.id}
                  email={book.publisher.email}
                />
              </div>
            )}
          </div>
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/book-of-the-day/${dateKey}`}
        />
      </div>
      <div class="mt-2">
        <BotdEmailStatusBadges bookOfTheDay={bookOfTheDay} />
      </div>
    </>
  );
};
