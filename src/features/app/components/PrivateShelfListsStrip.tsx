import { BookList } from "../../../db/schema";
import Link from "../../../components/app/Link";

type ListWithCount = BookList & { bookCount: number };

type Props = {
  lists: ListWithCount[];
  shelfSlug?: string | null;
  shelfPublic?: boolean;
};

const PrivateShelfListsStrip = ({
  lists,
  shelfSlug,
  shelfPublic,
}: Props) => {
  return (
    <section class="flex flex-col gap-3 border border-outline bg-surface-alt p-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="font-display text-xl font-medium text-on-surface-strong">
          Your lists
        </h2>
        <Link href="/dashboard/lists" className="text-sm text-accent">
          Manage lists
        </Link>
      </div>
      {lists.length === 0 ? (
        <p class="text-sm text-on-surface-weak">
          Create playlist-style lists in your dashboard, then add books with the
          + button on any book card.
        </p>
      ) : (
        <ul class="flex flex-col gap-2">
          {lists.map((list) => {
            const publicUrl =
              shelfPublic && shelfSlug && list.isPublic
                ? `/shelf/${shelfSlug}/lists/${list.slug}`
                : null;
            return (
              <li class="flex items-center justify-between gap-3 text-sm">
                <div class="min-w-0">
                  <Link href={`/dashboard/lists/${list.id}`}>
                    <span class="font-medium text-on-surface-strong">
                      {list.title}
                    </span>
                  </Link>
                  <span class="ml-2 text-on-surface-weak tabular-nums">
                    {list.bookCount} books
                    {list.isPublic ? " · Public" : " · Private"}
                  </span>
                </div>
                {publicUrl ? (
                  <a
                    href={publicUrl}
                    class="shrink-0 text-accent underline underline-offset-2"
                  >
                    View
                  </a>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default PrivateShelfListsStrip;
