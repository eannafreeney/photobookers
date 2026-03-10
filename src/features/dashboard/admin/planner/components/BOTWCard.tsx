import Button from "../../../../../components/app/Button";
import { toWeekString } from "../../../../../lib/utils";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import DeleteButton from "./DeleteButton";
import ScheduleButton from "./ScheduleButton";

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
      href={`/dashboard/admin/planner/book-of-the-week/create?week=${weekKey}`}
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
      <div class="flex gap-3">
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
            <p class="text-xs text-on-surface-weak truncate">
              {book.artist.displayName}
            </p>
          )}
          <div>
            {bookOfTheWeek && !bookOfTheWeek?.text && (
              <p class="text-sm font-medium text-danger">Text Missing</p>
            )}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a
          href={`/books/${book.slug}`}
          target="_blank"
          class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          <Button variant="solid" color="primary">
            View Book
          </Button>
        </a>
        <a
          href={`/dashboard/admin/planner/book-of-the-week/update?week=${weekKey}`}
          x-target="modal-root"
          {...{ "x-target.error": "toast" }}
          class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          <Button variant="outline" color="primary">
            Edit
          </Button>
        </a>
        <DeleteButton
          action={`/dashboard/admin/planner/book-of-the-week/${book.id}/delete`}
        />
      </div>
    </>
  );
};
