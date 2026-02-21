//
import { Book, Creator } from "../../db/schema";
import { AuthUser } from "../../../types";

type NavSearchResultsProps = {
  creators: Creator[];
  books: (Book & { artist: Creator | null })[];
  user?: AuthUser | null;
  isMobile?: boolean;
};

const NavSearchResults = ({
  creators,
  books,
  isMobile = false,
}: NavSearchResultsProps) => {
  const hasResults = creators.length > 0 || books.length > 0;

  return (
    <div
      id={isMobile ? "search-results-mobile" : "search-results"}
      class="fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11  md:h-auto md:w-fit md:min-w-64 lg:min-w-96 md:rounded-radius overflow-hidden rounded-radius border shadow-sm border-outline bg-surface-alt "
      x-data="{ isOpen: true }"
      x-show="isOpen"
    >
      <div class="max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
        {!hasResults ? (
          <div class="p-8 text-center">
            <p class="text-sm text-on-surface-weak">No results found</p>
          </div>
        ) : (
          <ul class="flex flex-col gap-4">
            {creators.length > 0 && (
              <>
                <li class="text-xs uppercase font-semibold text-on-surface-weak pt-2 pb-1">
                  Creators
                </li>
                <ul class="flex flex-col gap-4">
                  {creators.map((creator) => (
                    <CreatorResultItem key={creator.id} creator={creator} />
                  ))}
                </ul>
              </>
            )}

            {books.length > 0 && (
              <>
                {creators.length > 0 && (
                  <li class="text-xs uppercase font-semibold text-on-surface-weak pt-4 pb-1">
                    Books
                  </li>
                )}
                {!creators.length && (
                  <li class="text-xs uppercase font-semibold text-on-surface-weak pt-2 pb-1">
                    Books
                  </li>
                )}
                <ul class="flex flex-col gap-4">
                  {books.map((book) => (
                    <BookResultItem key={book.id} book={book} />
                  ))}
                </ul>
              </>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

type CreatorResultItemProps = {
  creator: Creator;
};

const CreatorResultItem = ({ creator }: CreatorResultItemProps) => {
  return (
    <li>
      <a
        href={`/creators/${creator.slug}`}
        class="flex items-center gap-3 rounded-radius hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        aria-label={`View ${creator.displayName} profile`}
      >
        <div class="shrink-0">
          <img
            src={creator.coverUrl ?? ""}
            alt={`${creator.displayName} avatar`}
            class="w-10 h-10 rounded-full object-cover"
            loading="lazy"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">
            {creator.displayName}
          </div>
          <div class="text-xs uppercase font-semibold text-on-surface-weak">
            {creator.type}
          </div>
        </div>
      </a>
    </li>
  );
};

type BookResultItemProps = {
  book: Book & { artist: Creator | null };
};

const BookResultItem = ({ book }: BookResultItemProps) => {
  return (
    <li>
      <a
        href={`/books/${book.slug}`}
        class="flex items-center gap-3 rounded-radius hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        aria-label={`View ${book.title} by ${book.artist?.displayName ?? "Unknown artist"}`}
      >
        <div class="shrink-0">
          <img
            src={book.coverUrl ?? ""}
            alt={`${book.title} cover`}
            class="w-12 h-12 object-cover rounded-sm"
            loading="lazy"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">{book.title}</div>
          {book.artist && (
            <div class="text-xs text-on-surface truncate">
              {book.artist.displayName}
            </div>
          )}
        </div>
      </a>
    </li>
  );
};

export default NavSearchResults;

const closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    class="size-6"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);
