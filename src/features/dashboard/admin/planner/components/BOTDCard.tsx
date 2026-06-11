import Link from "../../../../../components/app/Link";
import { toDateString } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { formatDayWeekday } from "../utils";
import DeleteButton from "./DeleteButton";
import ScheduleButton from "./ScheduleButton";
import SendBOTDCreatorEmailButton from "./SendBOTDCreatorEmailButton";

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
          action={`/dashboard/admin/planner/book-of-the-day/${dateKey}`}
        />
      </div>
      <div class="mt-2 flex flex-col gap-2">
        <div class="flex items-center gap-4">
          <SendBOTDCreatorEmailButton
            recipientType="artist"
            bookOfTheDay={bookOfTheDay}
            creatorId={book.artist?.id}
            bookId={book.id}
          />
          {book.publisher && (
            <SendBOTDCreatorEmailButton
              recipientType="publisher"
              bookOfTheDay={bookOfTheDay}
              creatorId={book.publisher?.id}
              bookId={book.id}
            />
          )}
        </div>
        {bookOfTheDay.artistEmailSentAt ? (
          <p class="text-xs text-on-surface">Artist advance email sent</p>
        ) : null}
        {bookOfTheDay.publisherEmailSentAt ? (
          <p class="text-xs text-on-surface">Publisher advance email sent</p>
        ) : null}
        {bookOfTheDay.artistFeatureDayEmailSentAt ? (
          <p class="text-xs text-on-surface">Artist feature-day email sent</p>
        ) : null}
        {bookOfTheDay.publisherFeatureDayEmailSentAt ? (
          <p class="text-xs text-on-surface">
            Publisher feature-day email sent
          </p>
        ) : null}
      </div>
    </>
  );
};
