import Card from "../../../../../components/app/Card";
import { formatWeekRange } from "../utils";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import { toWeekString } from "../../../../../lib/utils";
import Button from "../../../../../components/app/Button";
import { FeaturedBookOfTheWeekWithBook } from "../services";
import Link from "../../../../../components/app/Link";

type Props = {
  weekStart: Date;
  weekNumber: number;
  bookOfTheWeek: BookOfTheWeekWithBook | null;
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
};

const BOTWWeekCard = ({
  weekStart,
  weekNumber,
  bookOfTheWeek,
  featuredBooks,
}: Props) => {
  return (
    <Card className="flex flex-col">
      <WeekCardHeader weekStart={weekStart} weekNumber={weekNumber} />
      <Card.Body gap="2">
        <BookOfTheWeekForm
          weekStart={weekStart}
          bookOfTheWeek={bookOfTheWeek}
        />
        <FeaturedBooksForm
          weekStart={weekStart}
          featuredBooks={featuredBooks}
        />
      </Card.Body>
    </Card>
  );
};

export default BOTWWeekCard;

type WeekCardHeaderProps = {
  weekStart: Date;
  weekNumber: number;
};

const WeekCardHeader = ({ weekStart, weekNumber }: WeekCardHeaderProps) => (
  <div class="flex items-center justify-between p-3 border-b border-outline">
    <div>
      <span class="text-xs font-medium text-on-surface-weak">
        Week {weekNumber}
      </span>
      <p class="text-sm font-medium text-on-surface-strong">
        {formatWeekRange(weekStart)}
      </p>
    </div>
  </div>
);

type BookOfTheWeekFormProps = {
  weekStart: Date;
  bookOfTheWeek: BookOfTheWeekWithBook | null;
};

const BookOfTheWeekForm = ({
  weekStart,
  bookOfTheWeek,
}: BookOfTheWeekFormProps) => {
  const weekKey = toWeekString(weekStart);
  const book = bookOfTheWeek?.book ?? null;

  return book ? (
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
  );
};

type FeaturedBooksFormProps = {
  weekStart: Date;
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
};

const FeaturedBooksForm = ({
  weekStart,
  featuredBooks,
}: FeaturedBooksFormProps) => {
  const weekKey = toWeekString(weekStart);
  const hasFiveFeatured = featuredBooks.length === 5;
  const action = hasFiveFeatured ? "update" : "create";

  return (
    <div class="mt-3 pt-3 border-t border-outline">
      <p class="text-xs font-medium text-on-surface-weak mb-2">Featured</p>
      {hasFiveFeatured ? (
        <ul class="text-xs text-on-surface-strong space-y-1">
          {featuredBooks.map((fb) => (
            <li key={fb.book.id} class="truncate flex items-center gap-3 py-1">
              {fb.book.coverUrl && (
                <Link href={`/books/${fb.book.slug}`}>
                  <img
                    src={fb.book.coverUrl}
                    alt={fb.book.title}
                    class="h-16 w-12 rounded object-cover"
                  />
                </Link>
              )}
              <div class="min-w-0 flex-1">
                <Link href={`/books/${fb.book.slug}`}>
                  <p class="text-sm font-semibold text-on-surface-strong line-clamp-2">
                    {fb.book.title}
                  </p>
                </Link>
                {fb.book.artist && (
                  <Link href={`/creators/${fb.book.artist.slug}`}>
                    <p class="text-xs text-on-surface-weak truncate">
                      {fb.book.artist.displayName}
                    </p>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <a
        href={`/dashboard/admin/planner/featured/${action}?week=${weekKey}`}
        x-target="modal-root"
        class="flex min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface-weak hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface"
      >
        {hasFiveFeatured ? "Edit featured" : "Set 5 featured books"}
      </a>
    </div>
  );
};

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
