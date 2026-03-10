import { FeaturedBookOfTheWeekWithBook } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import Link from "../../../../../components/app/Link";
import ScheduleButton from "./ScheduleButton";

type FeaturedBooksListProps = {
  weekStart: Date;
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
};

const FeaturedBooksList = ({
  weekStart,
  featuredBooks,
}: FeaturedBooksListProps) => {
  const weekKey = toWeekString(weekStart);
  const hasFiveFeatured = featuredBooks.length === 5;
  const action = hasFiveFeatured ? "update" : "create";

  return (
    <div class="mt-3 pt-3 border-t border-outline">
      <p class="text-xs font-medium text-on-surface-weak mb-2">Featured</p>
      {hasFiveFeatured ? (
        <ul class="text-xs text-on-surface-strong space-y-1">
          {featuredBooks.map((fb) => (
            <FeaturedBooksListItem key={fb.book.id} fb={fb} />
          ))}
        </ul>
      ) : null}
      <ScheduleButton
        href={`/dashboard/admin/planner/featured/${action}?week=${weekKey}`}
        text={hasFiveFeatured ? "Edit featured" : "Set 5 featured books"}
      />
    </div>
  );
};

export default FeaturedBooksList;

type FeaturedBooksListItemProps = {
  fb: FeaturedBookOfTheWeekWithBook;
};

const FeaturedBooksListItem = ({ fb }: FeaturedBooksListItemProps) => (
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
);
