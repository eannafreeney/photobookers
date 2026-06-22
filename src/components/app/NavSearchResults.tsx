//
import { Book, BookFair, Creator } from "../../db/schema";
import { AuthUser } from "../../../types";
import VerifiedCreator from "./VerifiedCreator";
import Avatar from "./Avatar";
import { formatDate } from "../../utils";

type CreatorSearchResult = Pick<
  Creator,
  "id" | "slug" | "displayName" | "coverUrl" | "status" | "type"
>;

type BookSearchResult = Pick<Book, "id" | "slug" | "coverUrl" | "title"> & {
  artist: Pick<Creator, "id" | "displayName"> | null;
  publisher: Pick<Creator, "id" | "displayName"> | null;
};

type FairSearchResult = Pick<
  BookFair,
  "id" | "slug" | "name" | "coverUrl" | "startDate" | "endDate" | "city" | "country"
>;

type NavSearchResultsProps = {
  creators: CreatorSearchResult[];
  books: BookSearchResult[];
  fairs: FairSearchResult[];
  user?: AuthUser | null;
  isMobile?: boolean;
};

const NavSearchResults = ({
  creators,
  books,
  fairs,
  isMobile = false,
}: NavSearchResultsProps) => {
  const hasResults = creators.length > 0 || books.length > 0 || fairs.length > 0;

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
            <p class="text-sm text-on-surface">No results found</p>
          </div>
        ) : (
          <ul class="flex flex-col gap-4">
            {creators.length > 0 && (
              <>
                <li class="text-xs uppercase font-semibold text-on-surface pt-2 pb-1">
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
                  <li class="text-xs uppercase font-semibold text-on-surface pt-4 pb-1">
                    Books
                  </li>
                )}
                {!creators.length && (
                  <li class="text-xs uppercase font-semibold text-on-surface pt-2 pb-1">
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

            {fairs.length > 0 && (
              <>
                {(creators.length > 0 || books.length > 0) && (
                  <li class="text-xs uppercase font-semibold text-on-surface pt-4 pb-1">
                    Fairs
                  </li>
                )}
                {!creators.length && !books.length && (
                  <li class="text-xs uppercase font-semibold text-on-surface pt-2 pb-1">
                    Fairs
                  </li>
                )}
                <ul class="flex flex-col gap-4">
                  {fairs.map((fair) => (
                    <FairResultItem key={fair.id} fair={fair} />
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
  creator: CreatorSearchResult;
};

const CreatorResultItem = ({ creator }: CreatorResultItemProps) => {
  return (
    <li>
      <a
        href={`/creators/${creator.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
      >
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            size="md"
          />
          <div class="absolute -top-1 -right-1">
            <VerifiedCreator
              creatorStatus={creator.status ?? "stub"}
              size="xs"
            />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">
            {creator.displayName}
          </div>
          <div class="text-xs uppercase font-semibold text-on-surface">
            {creator.type}
          </div>
        </div>
      </a>
    </li>
  );
};

type BookResultItemProps = {
  book: BookSearchResult;
};

const BookResultItem = ({ book }: BookResultItemProps) => {
  return (
    <li>
      <a
        href={`/books/${book.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
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
              {book.artist.displayName}{" "}
              {book.publisher?.displayName &&
                `- ${book.publisher?.displayName}`}
            </div>
          )}
        </div>
      </a>
    </li>
  );
};

type FairResultItemProps = {
  fair: FairSearchResult;
};

const FairResultItem = ({ fair }: FairResultItemProps) => {
  return (
    <li>
      <a
        href={`/fairs/${fair.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
        aria-label={`View ${fair.name}`}
      >
        <div class="shrink-0">
          {fair.coverUrl ? (
            <img
              src={fair.coverUrl}
              alt={`${fair.name} cover`}
              class="w-12 h-12 object-cover rounded-sm"
              loading="lazy"
            />
          ) : (
            <div class="w-12 h-12 bg-surface-alt rounded-sm flex items-center justify-center">
              <span class="text-xs text-on-surface-weak">Fair</span>
            </div>
          )}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">{fair.name}</div>
          <div class="text-xs text-on-surface truncate">
            {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
          </div>
          {(fair.city || fair.country) && (
            <div class="text-xs text-on-surface-weak truncate">
              {fair.city && fair.country
                ? `${fair.city}, ${fair.country}`
                : fair.city || fair.country}
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
