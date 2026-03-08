import Card from "../../../../../components/app/Card";
import { formatWeekRange, isWeekInPast } from "../utils";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import { toWeekString } from "../../../../../lib/utils";
import clsx from "clsx";
import Button from "../../../../../components/app/Button";

type Props = {
  weekStart: Date;
  weekNumber: number;
  bookOfTheWeek: BookOfTheWeekWithBook | null;
};

const BOTWWeekCard = ({ weekStart, weekNumber, bookOfTheWeek }: Props) => {
  const weekKey = toWeekString(weekStart);
  const book = bookOfTheWeek?.book ?? null;
  const isPast = isWeekInPast(weekStart);

  return (
    <Card
      className={clsx(
        "flex flex-col",
        isPast && "opacity-30 cursor-not-allowed",
      )}
    >
      <div class="flex items-center justify-between p-3 border-b border-outline">
        <div>
          <span class="text-xs font-medium text-on-surface-weak">
            Week {weekNumber}
          </span>
          <p class="text-sm font-medium text-on-surface-strong">
            {formatWeekRange(weekStart)}
          </p>
        </div>
        <div>
          {bookOfTheWeek && !bookOfTheWeek?.text && !isPast && (
            <p class="text-sm font-medium text-danger">Text Missing</p>
          )}
        </div>
      </div>
      <Card.Body gap="2">
        {book ? (
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
              </div>
            </div>
            <div class="flex items-center gap-2">
              <a
                href={`/books/${book.slug}`}
                class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                <Button variant="solid" color="primary">
                  View Book
                </Button>
              </a>
              <a
                href={`/dashboard/admin/planner/book-of-the-week/update`}
                x-target="modal-root"
                class="mt-2 inline-block text-sm font-medium text-primary hover:underline"
              >
                <Button variant="outline" color="primary">
                  Edit
                </Button>
              </a>
              <DeleteBookOfTheWeekForm bookId={book.id} />
            </div>
          </>
        ) : (
          <a
            href={`/dashboard/admin/planner/book-of-the-week/create?week=${weekKey}`}
            x-target="modal-root"
            class="flex min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface-weak hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface"
          >
            Schedule Book of the Week
          </a>
        )}
      </Card.Body>
    </Card>
  );
};

export default BOTWWeekCard;

const DeleteBookOfTheWeekForm = ({ bookId }: { bookId: string }) => {
  const alpineAttrs = {
    "x-target": "toast",
    "x-on:ajax:success":
      "$dispatch('dialog:close'), $dispatch('planner:updated')",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };
  return (
    <form
      action={`/dashboard/admin/planner/book-of-the-week/${bookId}/delete`}
      method="post"
      {...alpineAttrs}
      class="mt-2 inline-block text-sm font-medium text-danger hover:underline"
    >
      <Button variant="outline" color="danger">
        Delete
      </Button>
    </form>
  );
};
