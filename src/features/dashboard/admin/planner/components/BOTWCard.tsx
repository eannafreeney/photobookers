import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
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
        <div>
          <form
            method="post"
            x-target="toast modal-root"
            action={`/dashboard/admin/planner/book-of-the-week/send-artist-email?week=${weekKey}`}
          >
            <input type="hidden" name="creatorId" value={book.artist?.id} />
            <input type="hidden" name="bookId" value={book.id} />

            <button
              type="submit"
              class="inline-block text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              Send Artist Email
            </button>
          </form>
          <form
            action={`/dashboard/admin/planner/book-of-the-week/send-publisher-email?week=${weekKey}`}
          >
            <Button variant="outline" color="primary">
              <span>Send Publisher Email</span>
            </Button>
          </form>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <a
          href={`/books/${book.slug}`}
          target="_blank"
          class="inline-block text-sm font-medium text-primary hover:underline"
        >
          <Button variant="solid" color="primary">
            View Book
          </Button>
        </a>
        <a
          href={`/dashboard/admin/planner/book-of-the-week/update?week=${weekKey}`}
          x-target="modal-root"
          {...{ "x-target.error": "toast" }}
          class="inline-block text-sm font-medium text-primary hover:underline"
        >
          <Button variant="outline" color="primary">
            Edit
          </Button>
        </a>
        <DeleteButton
          action={`/dashboard/admin/planner/book-of-the-week/delete?week=${weekKey}`}
        />
      </div>
    </>
  );
};
