import { BookList } from "../../../db/schema";

type PublicListCard = BookList & {
  bookCount: number;
  coverUrls: string[];
};

type Props = {
  shelfSlug: string;
  favoritesCount: number;
  lists: PublicListCard[];
};

const ShelfListsSection = ({ shelfSlug, favoritesCount, lists }: Props) => {
  return (
    <section class="flex flex-col gap-3">
      <h2 class="font-display text-2xl font-medium text-on-surface-strong">
        Lists
      </h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href={`/shelf/${shelfSlug}#favourites`}
          class="flex gap-3 border border-outline bg-surface-alt p-3 transition hover:border-outline-strong"
        >
          <div class="flex size-16 shrink-0 items-center justify-center bg-surface text-xs text-on-surface-weak">
            ♥
          </div>
          <div class="min-w-0">
            <p class="font-medium text-on-surface-strong">Favorites</p>
            <p class="text-xs text-on-surface-weak tabular-nums">
              {favoritesCount} {favoritesCount === 1 ? "book" : "books"}
            </p>
          </div>
        </a>
        {lists.map((list) => (
          <a
            href={`/shelf/${shelfSlug}/lists/${list.slug}`}
            class="flex gap-3 border border-outline bg-surface-alt p-3 transition hover:border-outline-strong"
          >
            <div class="flex size-16 shrink-0 overflow-hidden bg-surface">
              {list.coverUrls[0] ? (
                <img
                  src={list.coverUrls[0]}
                  alt=""
                  class="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div class="flex size-full items-center justify-center text-xs text-on-surface-weak">
                  List
                </div>
              )}
            </div>
            <div class="min-w-0">
              <p class="truncate font-medium text-on-surface-strong">
                {list.title}
              </p>
              <p class="text-xs text-on-surface-weak tabular-nums">
                {list.bookCount} {list.bookCount === 1 ? "book" : "books"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ShelfListsSection;
